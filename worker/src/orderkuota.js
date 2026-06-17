// Komunikasi ke OrderKuota — dipanggil LANGSUNG dari Worker (tanpa proxy terpisah).
// Worker berjalan di edge Cloudflare, jadi IP-bypass tetap berlaku seperti cf-worker.js lama.

function buildHeaders(cfg) {
  return {
    "User-Agent": cfg.userAgent,
    "Content-Type": "application/x-www-form-urlencoded",
  };
}

function form(obj) {
  const p = new URLSearchParams();
  for (const [k, v] of Object.entries(obj)) p.append(k, v == null ? "" : String(v));
  return p.toString();
}

async function postOK(cfg, path, data) {
  const url = `https://${cfg.host}${path}`;
  const res = await fetch(url, {
    method: "POST",
    headers: buildHeaders(cfg),
    body: form(data),
  });
  const text = await res.text();
  let json;
  try {
    json = JSON.parse(text);
  } catch {
    // Jangan bocorkan body mentah OrderKuota (bisa HTML/pesan internal) ke klien.
    throw new Error(`OrderKuota tidak mengembalikan response valid (HTTP ${res.status})`);
  }
  return json;
}

// --- AUTH: login (request OTP) / verify OTP (loginRequest dengan otp sebagai password) ---
export async function loginRequest(cfg, username, password) {
  return postOK(cfg, `/api/v2/login`, {
    username,
    password,
    ...cfg.device,
  });
}

// --- CEK SALDO --- (TIDAK kena captcha — inti deteksi pembayaran)
export async function getBalance(cfg, authToken, authUsername) {
  const tokenId = (authToken || "").split(":")[0];
  if (!tokenId) throw new Error("Token tidak valid");

  const data = await postOK(cfg, `/api/v2/qris/menu/${tokenId}`, {
    ...cfg.device,
    auth_username: authUsername,
    auth_token: authToken,
    request_time: Date.now().toString(),
    "requests[0]": "account",
    "requests[1]": "qris_menu",
  });

  const account = data?.account?.results;
  return {
    balance: account?.balance ?? 0,
    qris_balance: account?.qris_balance ?? 0,
    name: account?.name ?? "",
    username: account?.username ?? "",
    raw: data,
  };
}

// --- CEK MUTASI --- (kena captcha "verifikasi permintaan", disisakan untuk kompatibilitas)
export async function getMutasi(cfg, authToken, authUsername, options = {}) {
  const tokenId = (authToken || "").split(":")[0];
  if (!tokenId) throw new Error("Token tidak valid");

  const data = await postOK(cfg, `/api/v2/qris/mutasi/${tokenId}`, {
    ...cfg.device,
    auth_username: authUsername,
    auth_token: authToken,
    request_time: Date.now().toString(),
    "requests[0]": "account",
    "requests[qris_history][page]": options.page || "1",
    "requests[qris_history][keterangan]": options.keterangan || "",
    "requests[qris_history][jumlah]": options.jumlah || "",
    "requests[qris_history][dari_tanggal]": options.startDate || "",
    "requests[qris_history][ke_tanggal]": options.endDate || "",
  });

  if (data?.qris_history?.results && options.onlyIn) {
    data.qris_history.results = data.qris_history.results
      .filter((item) => item.status === "IN")
      .slice(0, 4);
  }
  return data;
}
