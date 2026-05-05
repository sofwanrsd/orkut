# Taveve API Gateway

API Gateway untuk integrasi OrderKuota QRIS — mendukung Auth, Mutasi QRIS, Generate Dynamic QRIS, dan Decode QRIS dari gambar. Dapat di-deploy ke **Vercel** (serverless) atau **VPS** manapun.

---

## Fitur

- **Auth** — Login & verifikasi OTP ke akun OrderKuota
- **Cek Mutasi QRIS** — Ambil 4 transaksi masuk terakhir
- **Generate Dynamic QRIS** — Convert static QRIS jadi dynamic dengan nominal tertanam
- **Decode QRIS dari Foto** — Upload gambar QRIS, dapatkan raw string-nya
- **Dashboard UI** — Antarmuka web built-in untuk test semua endpoint
- **CF Worker Proxy** — Bypass IP restriction OrderKuota saat deploy di server luar Indonesia

---

## Tech Stack

- **Runtime**: Node.js + Express
- **Deploy**: Vercel (serverless) / VPS
- **Proxy**: Cloudflare Workers (untuk bypass IP block OrderKuota)
- **Dependencies**: axios, cors, multer, qrcode, jimp, qrcode-reader

---

## Struktur Project

```
orkut/
├── api/
│   └── index.js          # Entry point (Express app)
├── src/
│   ├── config/
│   │   └── settings.js   # Konfigurasi app & OrderKuota device identity
│   ├── controllers/
│   │   └── apiController.js
│   ├── services/
│   │   ├── authService.js
│   │   ├── qrisService.js
│   │   └── qrDecodeService.js
│   ├── utils/
│   │   ├── qrisLogic.js  # CRC16 & dynamic QRIS generator
│   │   └── response.js   # Helper response JSON
│   └── views/
│       └── dashboard.js  # Dashboard HTML
├── cf-worker.js          # Kode Cloudflare Worker proxy
├── vercel.json           # Konfigurasi deploy Vercel
└── package.json
```

---

## Setup Lokal

```bash
# Install dependencies
npm install

# Jalankan server (port 3000)
npm start
```

Untuk test dengan CF Worker proxy secara lokal:

```powershell
$env:ORDERKUOTA_PROXY_URL = "shiny-fog-202f.tavevestr.workers.dev"
npm start
```

Buka `http://localhost:3000` untuk akses dashboard.

---

## Deploy ke Vercel

### 1. Setup Cloudflare Worker (wajib — bypass IP block)

1. Buka [workers.cloudflare.com](https://workers.cloudflare.com) → **Create Worker**
2. Hapus kode default, paste isi `cf-worker.js`
3. Deploy → copy URL worker (format: `nama.subdomain.workers.dev`)

### 2. Deploy ke Vercel

```bash
npm i -g vercel
vercel --prod
```

### 3. Set Environment Variable di Vercel

Di Vercel Dashboard → Project → **Settings → Environment Variables**:

| Variable | Value |
|---|---|
| `ORDERKUOTA_PROXY_URL` | `shiny-fog-202f.tavevestr.workers.dev` |

---

## API Endpoints

Base URL lokal: `http://localhost:3000`

### Health Check

```
GET /api/health
```

Cek koneksi ke OrderKuota API. Response `api_status: "online"` berarti proxy berjalan normal.

---

### Auth — Login (Request OTP)

```
POST /api/auth/login
Content-Type: application/json
```

```json
{
  "username": "your_username",
  "password": "your_password"
}
```

---

### Auth — Verify OTP (Get Token)

```
POST /api/auth/verify
Content-Type: application/json
```

```json
{
  "username": "your_username",
  "otp": "123456"
}
```

Response berisi `token` yang dipakai untuk endpoint QRIS.

---

### QRIS — Cek Mutasi

```
POST /api/qris/mutasi
Content-Type: application/json
```

```json
{
  "auth_username": "your_username",
  "auth_token": "123456:aBcDeFgH...",
  "page": 1,
  "start_date": "",
  "end_date": ""
}
```

Mengembalikan 4 transaksi masuk (status `IN`) terakhir.

---

### QRIS — Generate Dynamic QRIS

```
POST /api/qris/dynamic
Content-Type: application/json
```

```json
{
  "base_string": "00020101021126...",
  "amount": 50000
}
```

Response berisi `dynamic_string` dan `qr_image` (base64 PNG).

---

### QRIS — Decode QRIS dari Foto

```
POST /api/qris/decode
Content-Type: multipart/form-data
```

| Field | Type | Keterangan |
|---|---|---|
| `image` | File | Foto QRIS (JPG/PNG, max 4MB) |

---

## Environment Variables

| Variable | Default | Keterangan |
|---|---|---|
| `ORDERKUOTA_PROXY_URL` | `app.orderkuota.com` | Host proxy (CF Worker). Jika tidak diset, hit langsung ke OrderKuota. |

---

## Catatan Deploy

- **Vercel**: Request body max **4MB** (sudah disesuaikan di multer config)
- **CF Worker free tier**: 100.000 request/hari — cukup untuk skala kecil-menengah
- Dashboard UI bisa diakses di root URL (`/`)

---

Built by **ByDede** — Taveve Store
