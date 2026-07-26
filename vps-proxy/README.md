# OrderKuota VPS proxy

Proxy outbound terbatas untuk tiga endpoint yang digunakan aplikasi:

- `POST /api/v2/login`
- `POST /api/v2/qris/menu/:tokenId`
- `POST /api/v2/qris/mutasi/:tokenId`

Service hanya mendengarkan `127.0.0.1:8788` dan dipublikasikan melalui
Cloudflare Tunnel. Semua endpoint upstream mewajibkan header `X-Proxy-Key`.
Endpoint `GET /health` tidak meneruskan request ke OrderKuota.

Environment aplikasi/Vercel:

```env
ORDERKUOTA_PROXY_URL=ok-proxy.taveve.store
ORDERKUOTA_PROXY_KEY=<nilai-yang-sama-dengan-PROXY_SECRET-di-VPS>
```
