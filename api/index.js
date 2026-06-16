// api/index.js
const express = require("express");
const cors = require("cors");
const multer = require("multer");
const dashboardView = require("../src/views/dashboard");
const apiController = require("../src/controllers/apiController");
const settings = require("../src/config/settings");
const { error } = require("../src/utils/response");

// Multer setup for file uploads (memory storage)
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 4 * 1024 * 1024, // 4MB limit (Vercel max 4.5MB)
  },
  fileFilter: (req, file, cb) => {
    // Accept images only
    if (!file.mimetype.startsWith('image/')) {
      return cb(new Error('Only image files are allowed'), false);
    }
    cb(null, true);
  }
});

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get("/", (req, res) => res.send(dashboardView()));

// Health Check Endpoint
app.get("/api/health", apiController.healthCheck);

// Endpoint AUTH
app.post("/api/auth/login", apiController.requestOtp);
app.post("/api/auth/verify", apiController.verifyOtp);

// Endpoint QRIS
app.post("/api/qris/mutasi", apiController.checkMutasi);
app.post("/api/qris/mutasi-detail", apiController.checkMutasiDetail);
app.post("/api/qris/balance", apiController.checkBalance);
app.post("/api/qris/dynamic", apiController.createDynamicQr);
app.post("/api/qris/decode", upload.single('image'), apiController.decodeQrisImage);

app.use((req, res) => error(res, "Endpoint not found", 404));

if (require.main === module) {
  app.listen(3000, () => {
    console.clear();
    console.log(`
    =============================================
    🧡 TAVEVE API GATEWAY v${settings.app.version}
    =============================================
    [+] Server is running on port 3000
    [+] Ready to serve transactions!
    `);
  });
}

module.exports = app;
