# OrderKuota VPS proxy

Proxy outbound terbatas untuk tiga endpoint yang digunakan aplikasi:

- `POST /api/v2/login`
- `POST /api/v2/qris/menu/:tokenId`
- `POST /api/v2/qris/mutasi/:tokenId`

Service hanya mendengarkan `127.0.0.1:8788` dan dipublikasikan melalui
Cloudflare Tunnel. Semua endpoint upstream mewajibkan header `X-Proxy-Key`.
Endpoint `GET /health` tidak meneruskan request ke OrderKuota.

## Arsitektur produksi

```text
Vercel -> Cloudflare Tunnel khusus -> 127.0.0.1:8788 -> OrderKuota
```

Service yang digunakan:

- `orderkuota-proxy.service` untuk proxy Node.js.
- `cloudflared-orderkuota.service` untuk tunnel terpisah.

Tunnel terpisah dipakai agar perubahan proxy tidak me-restart tunnel aplikasi
lain pada VPS. Tidak ada port publik baru yang perlu dibuka.

Environment aplikasi/Vercel:

```env
ORDERKUOTA_PROXY_URL=ok-proxy.taveve.store
ORDERKUOTA_PROXY_KEY=<nilai-yang-sama-dengan-PROXY_SECRET-di-VPS>
```

## Batasan

Proxy hanya mengganti jalur keluar menjadi IP VPS Indonesia. OrderKuota masih
dapat menolak `/api/v2/qris/mutasi/:tokenId` dengan HTTP `469` karena IP VPS
dapat dikenali sebagai jaringan data center atau endpoint membutuhkan
verifikasi tambahan. Login atau health yang berhasil tidak membuktikan endpoint
mutasi diizinkan.

Untuk deteksi pembayaran otomatis, gunakan polling saldo + nominal unik.
Gunakan endpoint mutasi hanya jika akses tersebut memang diizinkan OrderKuota.
