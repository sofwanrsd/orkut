// api/index.js
const express = require("express");
const cors = require("cors");
const dashboardView = require("../src/views/dashboard");
const apiController = require("../src/controllers/apiController");
const { error } = require("../src/utils/response");

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get("/", (req, res) => res.send(dashboardView()));

// Endpoint AUTH
app.post("/api/auth/login", apiController.requestOtp);
app.post("/api/auth/verify", apiController.verifyOtp);

// Endpoint QRIS
app.post("/api/qris/mutasi", apiController.checkMutasi);
app.post("/api/qris/dynamic", apiController.createDynamicQr);

app.use((req, res) => error(res, "Endpoint not found", 404));

if (require.main === module) {
  app.listen(3000, () => console.log("Nexus QRIS running on port 3000"));
}

module.exports = app;
