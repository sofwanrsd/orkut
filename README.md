# Taveve API Gateway

API Gateway untuk integrasi OrderKuota QRIS — mendukung Auth, Mutasi QRIS, Generate Dynamic QRIS, dan Decode QRIS dari gambar. Dapat di-deploy ke **Vercel** (serverless) atau **VPS** manapun.

---

## Fitur

- **Auth** — Login & verifikasi OTP ke akun OrderKuota
- **Cek Mutasi QRIS** — Ambil 4 transaksi masuk terakhir
- **Cek Mutasi Detail** — Ambil semua transaksi dengan filter (tanggal, jumlah, keterangan, pagination)
- **Cek Saldo** — Lihat saldo utama dan saldo QRIS
- **Generate Dynamic QRIS** — Convert static QRIS jadi dynamic dengan nominal tertanam
- **Decode QRIS dari Foto** — Upload gambar QRIS, dapatkan raw string-nya
- **Dashboard UI** — Antarmuka web built-in untuk test semua endpoint
- **Proxy selectable** — Pilih Cloudflare Worker atau restricted VPS proxy lewat environment

---

## Tech Stack

- **Runtime**: Node.js + Express
- **Deploy**: Vercel (serverless) / VPS
- **Proxy**: Cloudflare Worker atau VPS Indonesia melalui Cloudflare Tunnel
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
├── worker/               # Cloudflare Worker gateway + D1 + polling saldo
├── vps-proxy/            # Restricted VPS proxy + service Cloudflare Tunnel
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

Pilih salah satu mode proxy.

Cloudflare Worker:

```powershell
$env:ORDERKUOTA_PROXY_URL = "shiny-fog-202f.tavevestr.workers.dev"
Remove-Item Env:ORDERKUOTA_PROXY_KEY -ErrorAction SilentlyContinue
npm start
```

VPS proxy:

```powershell
$env:ORDERKUOTA_PROXY_URL = "ok-proxy.taveve.store"
$env:ORDERKUOTA_PROXY_KEY = "<proxy-secret>"
npm start
```

Buka `http://localhost:3000` untuk akses dashboard.

---

## Deploy ke Vercel

### 1. Pilih mode proxy

#### Opsi A — Cloudflare Worker

Deploy isi [`cf-worker.js`](./cf-worker.js) sebagai Cloudflare Worker. Aplikasi
akan meneruskan request langsung ke Worker tanpa `X-Proxy-Key`.

```text
Vercel → Cloudflare Worker → OrderKuota
```

Konfigurasi:

```env
ORDERKUOTA_PROXY_URL=shiny-fog-202f.tavevestr.workers.dev
# ORDERKUOTA_PROXY_KEY tidak perlu diisi
```

#### Opsi B — VPS proxy

Gunakan service di folder [`vps-proxy`](./vps-proxy). Deployment produksi saat
ini memakai arsitektur:

```text
Vercel → Cloudflare Tunnel → VPS Indonesia → OrderKuota
```

Proxy hanya menerima tiga endpoint OrderKuota yang digunakan aplikasi, hanya
mendengarkan `127.0.0.1:8788`, dan mewajibkan header `X-Proxy-Key`.

### 2. Deploy aplikasi

```bash
npm i -g vercel
vercel --prod
```

### 3. Set Environment Variable di Vercel

Di Vercel Dashboard → Project → **Settings → Environment Variables**:

| Mode | `ORDERKUOTA_PROXY_URL` | `ORDERKUOTA_PROXY_KEY` |
|---|---|---|
| Cloudflare Worker | `shiny-fog-202f.tavevestr.workers.dev` | Kosong/tidak diset |
| VPS proxy | `ok-proxy.taveve.store` | Nilai `PROXY_SECRET` pada VPS |

Gunakan hanya satu baris mode pada satu waktu. Set variabel untuk **Production**
dan **Preview**, lalu redeploy aplikasi. Untuk berpindah mode cukup ubah kedua
environment variable tersebut; perubahan kode tidak diperlukan.

### Status deployment produksi

- Aplikasi: `https://orkut-mu.vercel.app`
- Proxy health: `https://ok-proxy.taveve.store/health`
- VPS proxy dan Cloudflare Tunnel dijalankan sebagai service terpisah agar
  tidak mengganggu aplikasi lain pada VPS.

> Jangan commit `ORDERKUOTA_PROXY_KEY`, token merchant, atau kredensial VPS ke
> repository.

---

## API Endpoints

Base URL lokal: `http://localhost:3000`

### Batasan endpoint mutasi QRIS

Endpoint login dan balance dapat dijangkau melalui Cloudflare Worker maupun VPS
proxy. Namun OrderKuota dapat menolak endpoint mutasi pada kedua mode dengan
HTTP `469` dan pesan berikut:

```text
Gunakan jaringan Internet lainnya / tidak menggunakan Hospot Wifi sementara waktu. [QRIS]
```

Respons tersebut berasal dari proteksi OrderKuota, bukan dari Vercel atau kode
proxy. Cloudflare Worker memakai shared egress IP, sedangkan IP VPS tetap dapat
diklasifikasikan sebagai jaringan data center. Lokasi IP di Indonesia tidak
menjamin endpoint mutasi diterima. Jangan mengandalkan `/api/qris/mutasi` untuk
deteksi pembayaran otomatis. Gunakan polling saldo + nominal unik melalui
implementasi Cloudflare Worker pada folder [`worker`](./worker), atau gunakan
akses resmi yang diizinkan OrderKuota.

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

Mengembalikan 4 transaksi masuk (status `IN`) terakhir jika akses mutasi
diizinkan OrderKuota. Endpoint ini dapat diblokir dengan HTTP `469`; jangan
gunakan sebagai satu-satunya mekanisme deteksi pembayaran.

---

### QRIS — Cek Mutasi Detail

```
POST /api/qris/mutasi-detail
Content-Type: application/json
```

```json
{
  "auth_username": "your_username",
  "auth_token": "123456:aBcDeFgH...",
  "page": 1,
  "start_date": "2025-01-01",
  "end_date": "2025-01-31",
  "keterangan": "GOPAY",
  "jumlah": "10000"
}
```

Mengembalikan semua transaksi (IN & OUT) dengan filter lengkap dan pagination
jika akses mutasi diizinkan OrderKuota. Batasan HTTP `469` juga berlaku.

---

### QRIS — Cek Saldo

```
POST /api/qris/balance
Content-Type: application/json
```

```json
{
  "auth_username": "your_username",
  "auth_token": "123456:aBcDeFgH..."
}
```

Response berisi `balance`, `qris_balance`, `name`, dan `username`.

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
| `ORDERKUOTA_PROXY_URL` | `app.orderkuota.com` | Host Cloudflare Worker atau VPS proxy tanpa protokol. Jika kosong, aplikasi mengakses OrderKuota langsung. |
| `ORDERKUOTA_PROXY_KEY` | kosong | Secret untuk header `X-Proxy-Key` saat memakai VPS proxy. |

---

## Catatan Deploy

- **Vercel**: Request body max **4MB** (sudah disesuaikan di multer config)
- **Cloudflare Worker proxy**: tidak memerlukan `ORDERKUOTA_PROXY_KEY`
- **VPS proxy**: hanya bind ke loopback dan dipublikasikan melalui tunnel terpisah
- **Mutasi QRIS**: dapat ditolak OrderKuota pada mode Cloudflare Worker maupun VPS
- Dashboard UI bisa diakses di root URL (`/`)

---

Built by **ByDede** — Taveve Store
