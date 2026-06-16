// Inti deteksi pembayaran lewat POLLING SALDO (bukan mutasi → bebas captcha).
// MULTI-TENANT: semua operasi di-scope per merchant. Kredensial datang dari
// pemanggil (server utama) lewat objek `cred`, bukan disimpan di Worker.
//
// Strategi: tiap order pakai NOMINAL UNIK; saat saldo naik, cocokkan delta ke tagihan.
// "Baseline" (last_balance:{merchant_id}) digeser maju setiap selesai scan.

import { getBalance } from "./orderkuota.js";
import { generateDynamicQR } from "./qrisLogic.js";
import {
  getState,
  setState,
  insertInvoice,
  getInvoice,
  getMatchable,
  getLockedAmounts,
  markPaid,
  expireOld,
  logBalance,
} from "./db.js";

const MAX_UNIQUE_CODE = 500; // tambahan 1..500 rupiah
const SUBSET_PENDING_CAP = 25; // batas jumlah pending untuk pencarian kombinasi

// key baseline saldo per merchant
const balanceKey = (merchantId) => `last_balance:${merchantId}`;

// Pilih kode unik sehingga nominal final belum dipakai tagihan aktif merchant ini.
function pickUniqueCode(baseAmount, lockedAmounts) {
  for (let tries = 0; tries < 50; tries++) {
    const code = 1 + Math.floor(Math.random() * MAX_UNIQUE_CODE);
    if (!lockedAmounts.has(baseAmount + code)) return code;
  }
  for (let code = 1; code <= MAX_UNIQUE_CODE; code++) {
    if (!lockedAmounts.has(baseAmount + code)) return code;
  }
  throw new Error("Slot nominal unik habis untuk nominal ini, coba lagi nanti.");
}

// Validasi kredensial merchant yang dikirim server utama.
function requireCred(cred) {
  if (!cred || !cred.merchantId)
    throw new Error("merchant_id wajib (kirim via header X-Merchant-Id).");
  if (!cred.authToken || !cred.authUsername)
    throw new Error("auth_token & auth_username wajib (via header).");
  return cred;
}

/**
 * Buat tagihan baru untuk satu merchant.
 * @param {object} cred { merchantId, authToken, authUsername, qrisBase }
 * @param {object} opts { id?, baseAmount }
 */
export async function createInvoice(db, cfg, cred, opts) {
  requireCred(cred);
  if (!cred.qrisBase)
    throw new Error("qris_base_string wajib untuk generate QRIS (via header).");

  const baseAmount = parseInt(opts.baseAmount, 10);
  if (!Number.isFinite(baseAmount) || baseAmount <= 0)
    throw new Error("base_amount tidak valid");

  const now = Date.now();
  await expireOld(db, cred.merchantId, now);

  // Kode unik tidak boleh bentrok dengan nominal yang masih terkunci merchant ini.
  const locked = await getLockedAmounts(db, cred.merchantId, now);
  const uniqueCode = pickUniqueCode(baseAmount, locked);
  const amount = baseAmount + uniqueCode;

  const qrisString = generateDynamicQR(cred.qrisBase, amount);

  const id = opts.id ? String(opts.id) : crypto.randomUUID();
  const expires_at = now + cfg.invoiceTtlSeconds * 1000;

  await insertInvoice(db, {
    merchant_id: cred.merchantId,
    id,
    base_amount: baseAmount,
    unique_code: uniqueCode,
    amount,
    qris_string: qrisString,
    created_at: now,
    expires_at,
  });

  return {
    id,
    merchant_id: cred.merchantId,
    base_amount: baseAmount,
    unique_code: uniqueCode,
    amount, // final = base + unik code
    qris_string: qrisString,
    status: "PENDING",
    created_at: now,
    expires_at,
  };
}

// Cari subset dari daftar pending yang jumlah amount-nya == target. Bounded backtracking.
export function findSubset(pending, target) {
  const items = [...pending].sort((a, b) => b.amount - a.amount);
  const result = [];
  function bt(i, remaining) {
    if (remaining === 0) return true;
    if (i >= items.length || remaining < 0) return false;
    result.push(items[i]);
    if (bt(i + 1, remaining - items[i].amount)) return true;
    result.pop();
    return bt(i + 1, remaining);
  }
  return bt(0, target) ? result : null;
}

// PURE: tentukan tagihan mana yang cocok dengan kenaikan saldo `delta`.
export function matchDelta(pending, delta) {
  if (!(delta > 0) || !pending.length) return [];
  const exact = pending.find((p) => p.amount === delta);
  if (exact) return [exact];
  if (pending.length <= SUBSET_PENDING_CAP) {
    const subset = findSubset(pending, delta);
    if (subset) return subset;
  }
  return [];
}

/**
 * Scan saldo satu merchant: hitung delta vs baseline, cocokkan, geser baseline.
 * @param {object} cred { merchantId, authToken, authUsername }
 * @returns ringkasan { current, delta, matched: [ids], note }
 */
export async function scanAndMatch(db, cfg, cred) {
  requireCred(cred);
  const { merchantId, authToken, authUsername } = cred;

  const now = Date.now();
  await expireOld(db, merchantId, now);

  const bal = await getBalance(cfg, authToken, authUsername);
  const current = Number(bal.qris_balance) || 0;

  const key = balanceKey(merchantId);
  const lastStr = await getState(db, key);

  // Inisialisasi baseline pada panggilan pertama (tidak menandai apa pun).
  if (lastStr === null) {
    await setState(db, key, current);
    return { current, delta: 0, matched: [], note: "init_baseline" };
  }

  const last = parseInt(lastStr, 10) || 0;
  const delta = current - last;

  if (delta === 0) return { current, delta: 0, matched: [], note: "no_change" };

  // Saldo turun (WD / refund) → serap ke baseline, tidak tandai order.
  if (delta < 0) {
    await logBalance(db, merchantId, now, last, current, delta, "balance_down");
    await setState(db, key, current);
    return { current, delta, matched: [], note: "balance_down" };
  }

  // delta > 0 → ada pemasukan. Cocokkan ke tagihan yang masih matchable (PENDING + grace).
  const pending = await getMatchable(db, merchantId, now);
  const candidates = matchDelta(pending, delta);
  const matched = [];

  for (const inv of candidates) {
    if (await markPaid(db, merchantId, inv.id, now, inv.amount)) matched.push(inv.id);
  }

  let note = "unmatched_in";
  if (matched.length === 1 && candidates.length === 1) note = "matched";
  else if (matched.length) note = "matched_subset";

  await logBalance(db, merchantId, now, last, current, delta, note);
  await setState(db, key, current); // geser baseline apa pun hasilnya

  return { current, delta, matched, note };
}

/**
 * Cek status tagihan satu merchant: scan dulu, lalu baca status terbaru.
 */
export async function checkStatus(db, cfg, cred, id) {
  requireCred(cred);

  let scan = null;
  let scanError = null;
  try {
    scan = await scanAndMatch(db, cfg, cred);
  } catch (e) {
    scanError = e.message; // tetap kembalikan status dari DB walau scan gagal
  }

  const inv = await getInvoice(db, cred.merchantId, id);
  if (!inv) throw new Error("Tagihan tidak ditemukan");

  return {
    id: inv.id,
    merchant_id: inv.merchant_id,
    amount: inv.amount,
    base_amount: inv.base_amount,
    status: inv.status, // PENDING | PAID | EXPIRED
    paid: inv.status === "PAID",
    paid_at: inv.paid_at || null,
    expires_at: inv.expires_at,
    scan: scan || undefined,
    scan_error: scanError || undefined,
  };
}
