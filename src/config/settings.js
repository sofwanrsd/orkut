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
        "e5aCENGrQOWvhQWYnv-uNc:APA91bFj3O_mv5Nf_2SM4Duz4Z8Ug3nBNaHlgodlY92CBuNIA9xmc0Dahev5xxqssPmnTdcie4mlhiG9ZAE1iCe1QbyhxcUyGXlenJxiUaXdfm1rklOEo9k",
      phone_uuid: "e5aCENGrQOWvhQWYnv-uNc",
      phone_model: "sdk_gphone64_x86_64",
      phone_android_version: "16",
      app_version_code: "250811",
      app_version_name: "25.07.11",
      ui_mode: "light",
    },
  },
};
