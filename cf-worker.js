// Cloudflare Worker — proxy ke OrderKuota
// Copy-paste kode ini ke https://workers.cloudflare.com

const TARGET_HOST = "app.orderkuota.com";
const TARGET = `https://${TARGET_HOST}`;

export default {
  async fetch(request) {
    const url = new URL(request.url);
    const targetUrl = TARGET + url.pathname + url.search;

    // Rebuild headers, override Host ke OrderKuota
    const newHeaders = new Headers(request.headers);
    newHeaders.set("Host", TARGET_HOST);

    const newRequest = new Request(targetUrl, {
      method: request.method,
      headers: newHeaders,
      body: request.method !== "GET" && request.method !== "HEAD"
        ? request.body
        : undefined,
    });

    const response = await fetch(newRequest);

    // Rebuild response headers (hapus header CF yang bisa konflik)
    const responseHeaders = new Headers(response.headers);
    responseHeaders.delete("content-encoding");

    return new Response(response.body, {
      status: response.status,
      statusText: response.statusText,
      headers: responseHeaders,
    });
  },
};
