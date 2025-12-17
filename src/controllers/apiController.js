// src/controllers/apiController.js
const authService = require("../services/authService");
const qrisService = require("../services/qrisService");
const { success, error } = require("../utils/response");

// --- AUTH ---
exports.requestOtp = async (req, res) => {
  try {
    const result = await authService.loginRequest(
      req.body.username,
      req.body.password
    );
    success(res, result);
  } catch (err) {
    error(res, err.message);
  }
};

exports.verifyOtp = async (req, res) => {
  try {
    const result = await authService.verifyOtp(req.body.username, req.body.otp);
    success(res, result);
  } catch (err) {
    error(res, err.message);
  }
};

// --- QRIS ---
exports.checkMutasi = async (req, res) => {
  const { auth_token, auth_username, page, start_date, end_date } = req.body;
  try {
    const result = await qrisService.getMutasi(auth_token, auth_username, {
      page,
      startDate: start_date,
      endDate: end_date,
    });
    success(res, result);
  } catch (err) {
    error(res, err.message);
  }
};

exports.createDynamicQr = async (req, res) => {
  const { base_string, amount } = req.body;
  try {
    const result = await qrisService.generateDynamicQr(
      base_string,
      Number(amount)
    );
    success(res, result);
  } catch (err) {
    error(res, err.message);
  }
};
