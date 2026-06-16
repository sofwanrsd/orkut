// src/controllers/apiController.js
const authService = require("../services/authService");
const qrisService = require("../services/qrisService");
const qrDecodeService = require("../services/qrDecodeService");
const { success, error } = require("../utils/response");

// --- HEALTH CHECK ---
exports.healthCheck = async (req, res) => {
  try {
    // Test dengan dummy request ke OrderKuota
    const testResult = await authService.loginRequest("test", "test");
    
    // Kalau response ada "Gunakan Jaringan Internet Lainnya" = API blocked
    const responseStr = JSON.stringify(testResult);
    
    if (responseStr.includes("Gunakan Jaringan Internet Lainnya")) {
      return res.json({
        status: false,
        message: "OrderKuota API blocked - IP not whitelisted",
        api_status: "blocked",
        suggestion: "Whitelist your server IP in OrderKuota dashboard"
      });
    }
    
    // Kalau dapat response lain (meskipun error login) = API OK
    return res.json({
      status: true,
      message: "API Gateway healthy & OrderKuota reachable",
      api_status: "online",
      orderkuota_connection: "connected"
    });
    
  } catch (err) {
    // Network error atau timeout
    return res.json({
      status: false,
      message: "Cannot reach OrderKuota API",
      api_status: "offline",
      error: err.message
    });
  }
};


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

exports.checkMutasiDetail = async (req, res) => {
  const { auth_token, auth_username, page, start_date, end_date, keterangan, jumlah } = req.body;
  try {
    const result = await qrisService.getMutasiDetail(auth_token, auth_username, {
      page,
      startDate: start_date,
      endDate: end_date,
      keterangan,
      jumlah,
    });
    success(res, result);
  } catch (err) {
    error(res, err.message);
  }
};

exports.checkBalance = async (req, res) => {
  const { auth_token, auth_username } = req.body;
  try {
    const result = await qrisService.getBalance(auth_token, auth_username);
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

// --- QR DECODE ---
exports.decodeQrisImage = async (req, res) => {
  try {
    // Validate file upload
    if (!req.file) {
      return error(res, "No image file uploaded. Please upload a QRIS image.", 400);
    }

    // Decode QR from image buffer
    const qrisString = await qrDecodeService.decodeFromBuffer(req.file.buffer);

    success(res, {
      qris_string: qrisString,
      filename: req.file.originalname,
      size: req.file.size
    });
  } catch (err) {
    error(res, err.message);
  }
};
