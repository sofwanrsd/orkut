// src/services/authService.js
const axios = require("axios");
const settings = require("../config/settings");

class AuthService {
  constructor() {
    this.config = settings.orderKuota;
    this.headers = {
      Host: this.config.baseUrl,
      "User-Agent": this.config.userAgent,
      "Content-Type": "application/x-www-form-urlencoded",
    };
  }

  async loginRequest(username, password) {
    const payload = new URLSearchParams({
      username,
      password,
      ...this.config.device,
    }).toString();

    try {
      const { data } = await axios.post(
        `https://${this.config.baseUrl}/api/v2/login`,
        payload,
        { headers: this.headers }
      );
      return data;
    } catch (error) {
      throw new Error(
        error.response?.data
          ? JSON.stringify(error.response.data)
          : error.message
      );
    }
  }

  async verifyOtp(username, otp) {
    return this.loginRequest(username, otp);
  }
}

module.exports = new AuthService();
