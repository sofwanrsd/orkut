// Port dari src/utils/qrisLogic.js — pure JS, jalan di Worker tanpa perubahan.

// Hitung CRC16 (CRC16-CCITT-FALSE)
function toCRC16(str) {
  let crc = 0xffff;
  for (let c = 0; c < str.length; c++) {
    crc ^= str.charCodeAt(c) << 8;
    for (let i = 0; i < 8; i++) {
      if (crc & 0x8000) crc = (crc << 1) ^ 0x1021;
      else crc = crc << 1;
    }
  }
  const hex = (crc & 0xffff).toString(16).toUpperCase();
  return hex.padStart(4, "0");
}

/**
 * Generate QRIS Dinamis:
 * - Ubah 010211 → 010212
 * - Sisipkan TAG 54 (nominal) sebelum 5802ID
 * - Hitung ulang CRC
 */
export function generateDynamicQR(baseQR, nominal) {
  if (!baseQR) throw new Error("QRIS tidak boleh kosong");
  if (nominal === undefined || nominal === null || nominal === "")
    throw new Error("Nominal wajib diisi");

  nominal = String(nominal);

  const noCRC = baseQR.slice(0, -4);
  const makeDynamic = noCRC.replace("010211", "010212");
  const split = makeDynamic.split("5802ID");

  if (split.length < 2) {
    throw new Error(
      "QRIS tidak valid (tag 5802ID tidak ditemukan). Pastikan ini QRIS Indonesia."
    );
  }

  const tag54 =
    "54" + nominal.length.toString().padStart(2, "0") + nominal + "5802ID";
  const withoutCRC = split[0] + tag54 + split[1];
  const crc16 = toCRC16(withoutCRC);

  return withoutCRC + crc16;
}
