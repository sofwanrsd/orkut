// src/config/settings.js
module.exports = {
  app: {
    name: "Taveve API Gateway",
    version: "1.0",
    maintainer: "ByDede",
  },

  // Konfigurasi OrderKuota (Bypass Constants Baru)
  orderKuota: {
    baseUrl: "app.orderkuota.com",
    userAgent: "okhttp/4.12.0", // Sesuai input kamu

    // Data Identitas Perangkat Baru
    device: {
      app_reg_id: "czmk8DcrQzes8FZcI7XpCX:APA91bEOwn07D8Q1u2_m12pv4rMDz3XS522SfkcbdatQaUvcDRPakaTqK3ENMyT52dSDauaSLo3II13P15juQGSmuKOfg58qQ5GFC0ZKnq6Qd1Q4Oq1jorA",
      phone_uuid: "czmk8DcrQzes8FZcI7XpCX",
      phone_model: "Infinix X678B",
      phone_android_version: "14",
      app_version_code: "260115",
      app_version_name: "26.01.15",
      ui_mode: "light",
    },
  },
};
