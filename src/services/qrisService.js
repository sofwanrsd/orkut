// src/services/qrisService.js
const axios = require("axios");
const qs = require("qs");
const qrcode = require("qrcode");
const settings = require("../config/settings");
const { generateDynamicQR } = require("../utils/qrisLogic"); // Import Logika Baru

class QrisService {
  constructor() {
    this.config = settings.orderKuota;
  }

  // --- CEK MUTASI (Tidak Berubah) ---
  async getMutasi(authToken, authUsername, options = {}) {
    const tokenId = authToken.split(":")[0];
    if (!tokenId) throw new Error("Token tidak valid");

    const url = `https://${this.config.baseUrl}/api/v2/qris/mutasi/${tokenId}`;

    const requestData = {
      ...this.config.device,
      auth_username: authUsername,
      auth_token: authToken,
      request_time: Date.now().toString(),
      "requests[0]": "account",
      "requests[qris_history][page]": options.page || "1",
      "requests[qris_history][keterangan]": "",
      "requests[qris_history][jumlah]": "",
      "requests[qris_history][dari_tanggal]": options.startDate || "",
      "requests[qris_history][ke_tanggal]": options.endDate || "",
    };

    try {
      const { data } = await axios.post(url, qs.stringify(requestData), {
        headers: {
          Host: this.config.baseUrl,
          "User-Agent": this.config.userAgent,
          "Content-Type": "application/x-www-form-urlencoded",
          ...(this.config.proxyKey
            ? { "X-Proxy-Key": this.config.proxyKey }
            : {}),
        },
      });

      if (data?.qris_history?.results) {
        data.qris_history.results = data.qris_history.results
          .filter((item) => item.status === "IN")
          .slice(0, 4);
      }
      return { success: true, ...data };
    } catch (error) {
      throw new Error(
        error.response?.data
          ? JSON.stringify(error.response.data)
          : error.message
      );
    }
  }

  // --- DYNAMIC QRIS (Updated dengan Logic Kamu) ---
  async generateDynamicQr(baseString, amount) {
    // 1. Panggil fungsi dari src/utils/qrisLogic.js
    // Fungsi ini sudah handle replace 010212, inject nominal, dan hitung CRC
    const dynamicString = generateDynamicQR(baseString, amount);

    // 2. Generate Gambar QR Code dari string hasil olahan
    const qrImage = await qrcode.toDataURL(dynamicString, { width: 300 });

    return {
      original_string: baseString,
      amount: amount,
      dynamic_string: dynamicString,
      qr_image: qrImage,
    };
  }

  // --- CEK SALDO ---
  async getBalance(authToken, authUsername) {
    const tokenId = authToken.split(":")[0];
    if (!tokenId) throw new Error("Token tidak valid");

    const url = `https://${this.config.baseUrl}/api/v2/qris/menu/${tokenId}`;

    const requestData = {
      ...this.config.device,
      auth_username: authUsername,
      auth_token: authToken,
      request_time: Date.now().toString(),
      "requests[0]": "account",
      "requests[1]": "qris_menu",
    };

    try {
      const { data } = await axios.post(url, qs.stringify(requestData), {
        headers: {
          Host: this.config.baseUrl,
          "User-Agent": this.config.userAgent,
          "Content-Type": "application/x-www-form-urlencoded",
          ...(this.config.proxyKey
            ? { "X-Proxy-Key": this.config.proxyKey }
            : {}),
        },
      });

      const account = data?.account?.results;
      return {
        success: true,
        balance: account?.balance || 0,
        qris_balance: account?.qris_balance || 0,
        name: account?.name || "",
        username: account?.username || "",
      };
    } catch (error) {
      throw new Error(
        error.response?.data
          ? JSON.stringify(error.response.data)
          : error.message
      );
    }
  }

  // --- MUTASI DETAIL (ALL) ---
  async getMutasiDetail(authToken, authUsername, options = {}) {
    const tokenId = authToken.split(":")[0];
    if (!tokenId) throw new Error("Token tidak valid");

    const url = `https://${this.config.baseUrl}/api/v2/qris/mutasi/${tokenId}`;

    const requestData = {
      ...this.config.device,
      auth_username: authUsername,
      auth_token: authToken,
      request_time: Date.now().toString(),
      "requests[0]": "account",
      "requests[qris_history][page]": options.page || "1",
      "requests[qris_history][keterangan]": options.keterangan || "",
      "requests[qris_history][jumlah]": options.jumlah || "",
      "requests[qris_history][dari_tanggal]": options.startDate || "",
      "requests[qris_history][ke_tanggal]": options.endDate || "",
    };

    try {
      const { data } = await axios.post(url, qs.stringify(requestData), {
        headers: {
          Host: this.config.baseUrl,
          "User-Agent": this.config.userAgent,
          "Content-Type": "application/x-www-form-urlencoded",
          ...(this.config.proxyKey
            ? { "X-Proxy-Key": this.config.proxyKey }
            : {}),
        },
      });

      const results = data?.qris_history?.results || [];
      return {
        success: true,
        total: results.length,
        all_in: results.filter((item) => item.status === "IN"),
        all_out: results.filter((item) => item.status === "OUT"),
        results: results,
        pagination: {
          current_page: options.page || "1",
          has_more: results.length >= 10,
        },
      };
    } catch (error) {
      throw new Error(
        error.response?.data
          ? JSON.stringify(error.response.data)
          : error.message
      );
    }
  }

  }

module.exports = new QrisService();
