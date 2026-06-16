// Bangun objek konfigurasi dari env (c.env di Hono / binding Worker).
// Identitas perangkat ada di [vars] wrangler.toml; kredensial diambil dari server utama.
export function getConfig(env) {
  return {
    host: env.OK_HOST || "app.orderkuota.com",
    userAgent: env.OK_USER_AGENT || "okhttp/4.12.0",
    device: {
      app_reg_id: env.OK_APP_REG_ID || "",
      phone_uuid: env.OK_PHONE_UUID || "",
      phone_model: env.OK_PHONE_MODEL || "",
      phone_android_version: env.OK_PHONE_ANDROID_VERSION || "",
      app_version_code: env.OK_APP_VERSION_CODE || "",
      app_version_name: env.OK_APP_VERSION_NAME || "",
      ui_mode: env.OK_UI_MODE || "light",
    },
    // Kunci gateway untuk endpoint server-to-server (header X-API-Key).
    // Kosong = tidak dipaksa (mode dev). Set via `wrangler secret put GATEWAY_API_KEY`.
    apiKey: env.GATEWAY_API_KEY || "",
    invoiceTtlSeconds: parseInt(env.INVOICE_TTL_SECONDS || "600", 10),
  };
}
