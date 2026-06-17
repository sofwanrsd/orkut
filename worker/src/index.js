// TAVEVE Gateway — Cloudflare Worker (Hono)
// Menggantikan app Express/Vercel. Worker langsung menghubungi OrderKuota
// (IP-bypass tetap berlaku) + menyimpan state di D1 untuk deteksi pembayaran.

import { Hono } from "hono";
import { cors } from "hono/cors";

import { getConfig } from "./config.js";
import { loginRequest, getBalance, getMutasi } from "./orderkuota.js";
import { generateDynamicQR } from "./qrisLogic.js";
import { createInvoice, checkStatus, scanAndMatch } from "./detection.js";
import { getState, setState, getMerchantKey, acquireScanLock, releaseScanLock } from "./db.js";
import { dashboard } from "./dashboard.js";

const app = new Hono();
app.use("*", cors());

// ---- helper response (format sama dengan utils/response.js lama) ----
const ok = (c, data, message = "Success") =>
  c.json({ status: true, message, data }, 200);
const fail = (c, message = "Internal Server Error", code = 500) =>
  c.json({ status: false, message }, code);

// Middleware penjaga API key (header X-API-Key) untuk semua endpoint /api/*
// kecuali /api/health. Kalau GATEWAY_API_KEY belum diset → tidak dipaksa (mode dev).
const apiKeyGuard = async (c, next) => {
  const cfg = getConfig(c.env);
  if (cfg.apiKey && c.req.header("x-api-key") !== cfg.apiKey) {
    return fail(c, "API key tidak valid", 401);
  }
  await next();
};

// Penjaga khusus /api/pay/* (multi-tenant). Backward-compatible:
//  - master GATEWAY_API_KEY selalu diterima (dipakai operator tunggal sekarang).
//  - kalau merchant punya key terdaftar di merchant_keys, request HARUS pakai key itu
//    (atau master). Mencegah pemegang satu key mengakses merchant lain.
const payGuard = async (c, next) => {
  const cfg = getConfig(c.env);
  const provided = c.req.header("x-api-key") || "";
  const merchantId = c.req.header("x-merchant-id") || "";

  if (cfg.apiKey && provided === cfg.apiKey) return next(); // master key → lolos

  if (!merchantId) return fail(c, "API key tidak valid", 401);
  const mkey = await getMerchantKey(c.env.DB, merchantId);
  if (mkey && provided === mkey) return next(); // per-merchant key cocok

  // Kalau master key di-set tapi tidak cocok, dan merchant tak punya key sendiri → tolak.
  if (cfg.apiKey || mkey) return fail(c, "API key tidak valid", 401);
  return next(); // mode dev: tidak ada key sama sekali
};
function credFromHeaders(c) {
  return {
    merchantId: c.req.header("x-merchant-id") || "",
    authToken: c.req.header("x-auth-token") || "",
    authUsername: c.req.header("x-auth-username") || "",
    qrisBase: c.req.header("x-qris-base") || "",
  };
}

// Parse body JSON atau urlencoded (kompatibel dengan klien lama)
async function body(c) {
  const ct = c.req.header("content-type") || "";
  if (ct.includes("application/json")) {
    try {
      return await c.req.json();
    } catch {
      return {};
    }
  }
  try {
    return await c.req.parseBody();
  } catch {
    return {};
  }
}

// ================= UI =================
app.get("/", (c) => c.html(dashboard()));

// Proteksi API key: auth & qris pakai master key; pay/* pakai payGuard (master atau per-merchant).
app.use("/api/auth/*", apiKeyGuard);
app.use("/api/qris/*", apiKeyGuard);
app.use("/api/pay/*", payGuard);

// ================= HEALTH =================
// Hasil di-cache ~30 detik di D1 supaya tidak hammer login OrderKuota tiap request
// (endpoint ini publik tanpa API key → cegah amplifikasi DoS ke OrderKuota).
const HEALTH_TTL_MS = 30 * 1000;
app.get("/api/health", async (c) => {
  const cfg = getConfig(c.env);
  const now = Date.now();
  try {
    const cached = await getState(c.env.DB, "health_cache");
    if (cached) {
      const obj = JSON.parse(cached);
      if (obj && typeof obj.at === "number" && now - obj.at < HEALTH_TTL_MS) {
        return c.json({ ...obj.body, cached: true });
      }
    }
  } catch { /* cache miss → cek live */ }

  let body;
  try {
    const test = await loginRequest(cfg, "test", "test");
    const str = JSON.stringify(test);
    if (str.includes("Gunakan Jaringan Internet Lainnya")) {
      body = {
        status: false,
        message: "OrderKuota API blocked - IP not whitelisted",
        api_status: "blocked",
      };
    } else {
      body = {
        status: true,
        message: "API Gateway healthy & OrderKuota reachable",
        api_status: "online",
        orderkuota_connection: "connected",
      };
    }
  } catch (err) {
    body = {
      status: false,
      message: "Cannot reach OrderKuota API",
      api_status: "offline",
    };
  }

  try {
    await setState(c.env.DB, "health_cache", JSON.stringify({ at: now, body }));
  } catch { /* abaikan kegagalan tulis cache */ }
  return c.json(body);
});

// ================= AUTH (endpoint lama, stabil) =================
app.post("/api/auth/login", async (c) => {
  const cfg = getConfig(c.env);
  const b = await body(c);
  try {
    return ok(c, await loginRequest(cfg, b.username, b.password));
  } catch (err) {
    return fail(c, err.message);
  }
});

app.post("/api/auth/verify", async (c) => {
  const cfg = getConfig(c.env);
  const b = await body(c);
  try {
    return ok(c, await loginRequest(cfg, b.username, b.otp));
  } catch (err) {
    return fail(c, err.message);
  }
});

// ================= QRIS (endpoint lama, stabil) =================
app.post("/api/qris/balance", async (c) => {
  const cfg = getConfig(c.env);
  const b = await body(c);
  try {
    const r = await getBalance(cfg, b.auth_token, b.auth_username);
    return ok(c, {
      success: true,
      balance: r.balance,
      qris_balance: r.qris_balance,
      name: r.name,
      username: r.username,
    });
  } catch (err) {
    return fail(c, err.message);
  }
});

app.post("/api/qris/mutasi", async (c) => {
  const cfg = getConfig(c.env);
  const b = await body(c);
  try {
    const data = await getMutasi(cfg, b.auth_token, b.auth_username, {
      page: b.page,
      startDate: b.start_date,
      endDate: b.end_date,
      onlyIn: true,
    });
    return ok(c, { success: true, ...data });
  } catch (err) {
    return fail(c, err.message);
  }
});

app.post("/api/qris/mutasi-detail", async (c) => {
  const cfg = getConfig(c.env);
  const b = await body(c);
  try {
    const data = await getMutasi(cfg, b.auth_token, b.auth_username, {
      page: b.page,
      startDate: b.start_date,
      endDate: b.end_date,
      keterangan: b.keterangan,
      jumlah: b.jumlah,
    });
    const results = data?.qris_history?.results || [];
    return ok(c, {
      success: true,
      total: results.length,
      all_in: results.filter((x) => x.status === "IN"),
      all_out: results.filter((x) => x.status === "OUT"),
      results,
    });
  } catch (err) {
    return fail(c, err.message);
  }
});

app.post("/api/qris/dynamic", async (c) => {
  const b = await body(c);
  try {
    const dynamic = generateDynamicQR(b.base_string, Number(b.amount));
    // Catatan: gambar QR dirender di sisi klien dari dynamic_string ini
    // (Worker tidak menjalankan encoder PNG bawaan Node).
    return ok(c, {
      original_string: b.base_string,
      amount: Number(b.amount),
      dynamic_string: dynamic,
    });
  } catch (err) {
    return fail(c, err.message);
  }
});

// Decode QRIS dari foto: butuh jimp/qrcode-reader (Node-only) → belum tersedia di Worker.
app.post("/api/qris/decode", (c) =>
  fail(
    c,
    "Fitur decode foto belum didukung di versi Worker (butuh library Node). Gunakan versi lama atau dekode di sisi klien.",
    501
  )
);

// ================= DETEKSI PEMBAYARAN (multi-tenant, server-to-server) =================
// Semua endpoint /api/pay/* butuh:
//   X-API-Key       : kunci gateway (anti-abuse karena Worker dipublish)
//   X-Merchant-Id   : ID merchant dari server utama
//   X-Auth-Token    : auth_token OrderKuota merchant
//   X-Auth-Username : username OrderKuota merchant
//   X-Qris-Base     : string QRIS statis merchant (khusus create)

// Buat tagihan: body { base_amount, id? }. Worker generate unique code + final amount.
app.post("/api/pay/create", async (c) => {
  const cfg = getConfig(c.env);
  const b = await body(c);
  try {
    const inv = await createInvoice(c.env.DB, cfg, credFromHeaders(c), {
      id: b.id,
      baseAmount: b.base_amount ?? b.amount,
    });
    return ok(c, inv);
  } catch (err) {
    return fail(c, err.message, 400);
  }
});

// Cek status tagihan (memicu scan saldo). Dipanggil berulang oleh server utama.
app.get("/api/pay/status/:id", async (c) => {
  const cfg = getConfig(c.env);
  try {
    return ok(c, await checkStatus(c.env.DB, cfg, credFromHeaders(c), c.req.param("id")));
  } catch (err) {
    return fail(c, err.message, 404);
  }
});

// Scan manual (jaring pengaman; dipanggil server utama per merchant). Tidak terikat 1 tagihan.
app.post("/api/pay/scan", async (c) => {
  const cfg = getConfig(c.env);
  try {
    return ok(c, await scanAndMatch(c.env.DB, cfg, credFromHeaders(c)));
  } catch (err) {
    return fail(c, err.message);
  }
});

// 404
app.notFound((c) => fail(c, "Endpoint not found", 404));

export default { fetch: app.fetch };
