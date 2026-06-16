# TAVEVE Gateway — Cloudflare Worker Edition

Menggantikan Express/Vercel. Worker langsung menghubungi OrderKuota (IP-bypass otomatis) + menyimpan state di D1 untuk deteksi pembayaran QRIS via polling saldo (bebas captcha).

---

## Yang Berubah dari Versi Lama

| | Lama (Vercel) | Baru (CF Worker) |
|---|---|---|
| Endpoint stabil untuk server utama | ✅ | ✅ (tetap sama) |
| Captcha mutasi | ❌ diblokir | ✅ dihindari (polling saldo) |
| Deteksi pembayaran otomatis | ❌ tidak ada | ✅ (nominal unik + geser baseline) |
| Proxy CF Worker | perlu terpisah | ✅ jadi satu dengan app |
| Database | stateless (butuh Upstash) | ✅ D1 (SQL, di dalam Cloudflare) |
| Decode QR dari foto | ✅ | ❌ belum didukung |

---

## Prasyarat

- **Node.js 18+** terinstall
- Akun **Cloudflare** (free cukup)
- **Wrangler CLI** terinstall

```bash
npm install -g wrangler
```

---

## Langkah 1 — Clone / Buka Folder Worker

```bash
cd orkut/worker
npm install
```

---

## Langkah 2 — Buat D1 Database

```bash
wrangler d1 create taveve-db
```

Output-nya akan menampilkan `database_id`. **Salin** nilai itu.

Lalu buka `wrangler.toml`, cari baris:

```toml
database_id = "GANTI_DENGAN_DATABASE_ID_DARI_WRANGLER"
```

Ganti dengan ID yang baru Anda salin.

---

## Langkah 3 — Inisialisasi Tabel

```bash
# Untuk development (database lokal, tidak mempengaruhi production)
wrangler d1 execute taveve-db --local --file=./schema.sql

# Untuk production (sekali saja, bikin tabel di cloud)
wrangler d1 execute taveve-db --remote --file=./schema.sql
```

---

## Langkah 4 — Set Secrets & Variables

### Secrets (kredensial tidak boleh ke git)

```bash
# Token & username akun merchant (untuk polling saldo deteksi pembayaran)
wrangler secret put MERCHANT_AUTH_TOKEN
# Masukkan: 2440365:BQivmeu5zGW426tU9YNLngZa7lRAfOxh

wrangler secret put MERCHANT_AUTH_USERNAME
# Masukkan: sofwanrsd
```

### Variables (boleh di-commit)

Buka `wrangler.toml`, edit bagian `[vars]`:

```toml
# String QRIS statis merchant (untuk generate QRIS dinamis).
# Dapatkan dari dashboard OrderKuota atau generate base string baru.
# Jika kosong, endpoint /api/pay/create tidak bisa generate QRIS otomatis —
# tapi tetap bisa buat tagihan, pelanggan bayar manual ke nominal yang ditampilkan.
MERCHANT_QRIS_BASE = "00020101021126..."
```

---

## Langkah 5 — Test Lokal

```bash
wrangler dev --remote  # pakai database remote (D1 cloud)
# atau
wrangler dev          # pakai database lokal (.wrangler/state)
```

Buka `http://localhost:8787`. Dashboard demo deteksi pembayaran bisa langsung dicoba.

---

## Langkah 6 — Deploy

```bash
wrangler deploy
```

Output akhir menampilkan URL Worker, misalnya:

```
https://taveve-gateway.YOUR_SUBDOMAIN.workers.dev
```

**Simpan URL ini** — itu endpoint baru yang akan dipakai server utama Anda.

---

## Langkah 7 — Integrasi dengan Server Utama

Server utama Anda (Express/Next.js/apapun) **tidak perlu ubah kode**. Cuma ganti base URL endpoint dari Vercel ke Worker:

```
# Lama (Vercel)
POST https://your-app.vercel.app/api/pay/create

# Baru (Worker)
POST https://taveve-gateway.YOUR_SUBDOMAIN.workers.dev/api/pay/create
```

### Alur lengkap di server utama

```
1. Pelanggan checkout (order Rp10.000)
   → Server utama panggil: POST /api/pay/create { amount: 10000, id: "INV-001" }
   → Worker balas: { id, amount: 10037, qris_string, status: "PENDING" }
   → Server utama simpan amount & id, tampilkan QRIS ke pelanggan

2. Pelanggan bayar (scan QRIS, transfer Rp10.037)

3. Browser polling: GET /api/pay/status/INV-001  (tiap ~4 detik)
   → Worker: scan saldo → cocokkan delta → update status
   → Worker balas: { status: "PAID" }  ← konfirmasi ke server utama
```

---

## Endpoint Referensi

| Method | Path | Body / Param | Keterangan |
|---|---|---|---|
| `GET` | `/` | — | Dashboard demo |
| `GET` | `/api/health` | — | Cek koneksi OrderKuota |
| `POST` | `/api/auth/login` | `{ username, password }` | Request OTP |
| `POST` | `/api/auth/verify` | `{ username, otp }` | Verifikasi OTP → token |
| `POST` | `/api/qris/balance` | `{ auth_token, auth_username }` | Cek saldo (bebas captcha) |
| `POST` | `/api/qris/mutasi` | `{ auth_token, auth_username, page }` | Mutasi (kena captcha) |
| `POST` | `/api/qris/mutasi-detail` | `{ auth_token, auth_username, ... }` | Mutasi detail |
| `POST` | `/api/qris/dynamic` | `{ base_string, amount }` | Generate QRIS dinamis |
| `POST` | `/api/pay/create` | `{ amount, id?, base_string? }` | **Buat tagihan baru** |
| `GET` | `/api/pay/status/:id` | — | **Cek status + scan saldo** |
| `POST` | `/api/pay/scan` | — | Scan manual (untuk Cron) |

---

## Custom Domain (opsional)

Kalau mau pakai domain sendiri (mis. `api.tavevestore.com`):

1. Buka **Workers & Pages** di dashboard Cloudflare
2. Pilih Worker `taveve-gateway`
3. **Settings → Triggers → Custom Domains → Add Domain**
4. Arahkan DNS domain ke Cloudflare, laluikat di sana

Ini membuat endpoint jadi lebih rapi & profesional tanpa perlu Vercel sama sekali.

---

## Catatan Penting

### Decode QR dari foto
Fitur `/api/qris/decode` belum didukung di Worker (library Node-only). Solusi:
- Gunakan decoder JS di sisi browser (mis. `html5-qrcode`).
- Atau simpan gambar, decode manual lalu kirim `base_string` ke `/api/qris/dynamic`.

### Kode unik habis
Setiap nominal dasar punya 999 slot unik (1–999). Jika bentrok, endpoint `/api/pay/create` akan melempar error. Untuk skala besar, perlu strategi tambahan (mis. nominal dasar berbeda per produk).

### Cron Trigger (jaring pengaman)
Worker sudah punya `scheduled()` handler. Untuk mengaktifkannya:
1. Di dashboard Cloudflare → Worker `taveve-gateway` → **Triggers → Cron Triggers**
2. Tambahkan cron: `*/5 * * * *` (tiap 5 menit)
3. Ini berguna sebagai jaring pengaman jika polling dari browser pelanggan berhenti (mis. pelanggan menutup tab).

---

## Struktur File

```
worker/
├── wrangler.toml       # Konfigurasi Worker + binding D1
├── package.json
├── schema.sql          # Skema database D1
├── src/
│   ├── index.js       # App Hono + semua endpoint
│   ├── config.js      # Bangun config dari env / secrets
│   ├── orderkuota.js  # Komunikasi ke OrderKuota (fetch)
│   ├── qrisLogic.js   # CRC16 + generate QRIS dinamis
│   ├── db.js          # Lapisan akses D1
│   ├── detection.js   # Logika deteksi: nominal unik + geser baseline
│   └── dashboard.js   # UI demo
└── README.md           # (file ini)
```
