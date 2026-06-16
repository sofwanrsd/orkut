// Lapisan akses D1 (MULTI-TENANT). Semua query di-scope per merchant_id.

// Grace period: setelah expires_at lewat, kode unik MASIH terkunci selama ini.
// Bayar dalam grace → tetap PAID. Lewat grace → kode unik dilepas untuk order lain.
export const GRACE_MS = 2 * 60 * 1000; // 2 menit

// ---- app_state (key-value global) ----
export async function getState(db, key) {
  const row = await db.prepare("SELECT value FROM app_state WHERE key = ?").bind(key).first();
  return row ? row.value : null;
}

export async function setState(db, key, value) {
  await db
    .prepare(
      "INSERT INTO app_state (key, value) VALUES (?, ?) " +
        "ON CONFLICT(key) DO UPDATE SET value = excluded.value"
    )
    .bind(key, String(value))
    .run();
}

// ---- invoices ----
export async function insertInvoice(db, inv) {
  await db
    .prepare(
      `INSERT INTO invoices
        (merchant_id, id, base_amount, unique_code, amount, qris_string, status, created_at, expires_at)
       VALUES (?, ?, ?, ?, ?, ?, 'PENDING', ?, ?)`
    )
    .bind(
      inv.merchant_id,
      inv.id,
      inv.base_amount,
      inv.unique_code,
      inv.amount,
      inv.qris_string || null,
      inv.created_at,
      inv.expires_at
    )
    .run();
}

export async function getInvoice(db, merchantId, id) {
  return db
    .prepare("SELECT * FROM invoices WHERE merchant_id = ? AND id = ?")
    .bind(merchantId, id)
    .first();
}

// Tagihan yang masih bisa dibayar: PENDING dan belum lewat (expires_at + grace).
// Inilah yang dicocokkan saat scan + yang mengunci kode unik.
export async function getMatchable(db, merchantId, now) {
  const { results } = await db
    .prepare(
      "SELECT * FROM invoices WHERE merchant_id = ? AND status = 'PENDING' AND (expires_at + ?) > ?"
    )
    .bind(merchantId, GRACE_MS, now)
    .all();
  return results || [];
}

// Nominal final (amount) yang masih terkunci untuk merchant ini (anti-bentrok kode unik).
export async function getLockedAmounts(db, merchantId, now) {
  const rows = await getMatchable(db, merchantId, now);
  return new Set(rows.map((r) => r.amount));
}

// Tandai lunas SECARA ATOMIK: hanya berhasil jika masih PENDING.
export async function markPaid(db, merchantId, id, paidAt, paidDelta) {
  const res = await db
    .prepare(
      "UPDATE invoices SET status = 'PAID', paid_at = ?, paid_delta = ? " +
        "WHERE merchant_id = ? AND id = ? AND status = 'PENDING'"
    )
    .bind(paidAt, paidDelta, merchantId, id)
    .run();
  return (res.meta?.changes ?? 0) > 0;
}

// Tandai EXPIRED tagihan PENDING yang sudah lewat expires_at + grace.
// (Selama dalam grace, status tetap PENDING agar bayar telat masih bisa PAID.)
export async function expireOld(db, merchantId, now) {
  await db
    .prepare(
      "UPDATE invoices SET status = 'EXPIRED' " +
        "WHERE merchant_id = ? AND status = 'PENDING' AND (expires_at + ?) <= ?"
    )
    .bind(merchantId, GRACE_MS, now)
    .run();
}

export async function logBalance(db, merchantId, at, prev, current, delta, note) {
  await db
    .prepare(
      "INSERT INTO balance_log (merchant_id, at, prev, current, delta, note) VALUES (?, ?, ?, ?, ?, ?)"
    )
    .bind(merchantId, at, prev, current, delta, note)
    .run();
}
