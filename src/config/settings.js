// src/config/settings.js
module.exports = {
  app: {
    name: "Taveve API Gateway",
    version: "Lite-1.0.1", // Saya naikkan dikit versinya
    maintainer: "CodeByDede",
  },

  // Konfigurasi OrderKuota (Bypass Constants Baru)
  orderKuota: {
    baseUrl: "app.orderkuota.com",
    userAgent: "okhttp/4.12.0", // Sesuai input kamu

    // Data Identitas Perangkat Baru
    device: {
      app_reg_id:
        "di309HvATsaiCppl5eDpoc:APA91bFUcTOH8h2XHdPRz2qQ5Bezn-3_TaycFcJ5pNLGWpmaxheQP9Ri0E56wLHz0_b1vcss55jbRQXZgc9loSfBdNa5nZJZVMlk7GS1JDMGyFUVvpcwXbMDg8tjKGZAurCGR4kDMDRJ",
      phone_uuid: "di309HvATsaiCppl5eDpoc",
      phone_model: "SM-G960N",
      phone_android_version: "16",
      app_version_code: "250811",
      app_version_name: "25.08.11",
      ui_mode: "light",
    },
  },
};
