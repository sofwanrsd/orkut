// src/services/qrDecodeService.js
const Jimp = require("jimp");
const QrCode = require("qrcode-reader");

class QrDecodeService {
  async decodeFromBuffer(imageBuffer) {
    try {
      // Parse image dengan Jimp
      const image = await Jimp.read(imageBuffer);
      
      // Initialize QR code reader
      const qr = new QrCode();
      
      // Decode QR code
      return new Promise((resolve, reject) => {
        qr.callback = (err, value) => {
          if (err) {
            reject(new Error("Failed to decode QR code from image. Make sure the image contains a valid QR code."));
            return;
          }
          
          if (!value || !value.result) {
            reject(new Error("No QR code found in the image"));
            return;
          }
          
          resolve(value.result);
        };
        
        // Decode dari Jimp bitmap
        qr.decode(image.bitmap);
      });
      
    } catch (error) {
      throw new Error(`Image processing failed: ${error.message}`);
    }
  }
}

module.exports = new QrDecodeService();
