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
        "feWAyrROTHe_RYH3Sbruw8:APA91bFbdiCCuyMLLTtieOr4W5fiSlzPHwUOe9w75UwmiHt7zywlgKi_zlKi5WUSq6pJdqHNkRD7J98p2hU7UBKK5R2wh5xcOQRhLoyb9PNWXTDiFmjrua4",
      phone_uuid: "feWAyrROTHe_RYH3Sbruw8",
      phone_model: "23124RA7EO",
      phone_android_version: "15",
      app_version_code: "251029",
      app_version_name: "25.10.29",
      ui_mode: "light",
    },
  },
};
