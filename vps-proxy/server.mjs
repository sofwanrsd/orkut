import http from "node:http";
import https from "node:https";
import crypto from "node:crypto";

const bindHost = process.env.BIND_HOST || "127.0.0.1";
const port = Number(process.env.PORT || 8788);
const targetHost = process.env.TARGET_HOST || "app.orderkuota.com";
const proxySecret = process.env.PROXY_SECRET || "";
const maxBodyBytes = Number(process.env.MAX_BODY_BYTES || 262144);

if (!proxySecret) {
  throw new Error("PROXY_SECRET wajib diisi");
}

const allowedPaths = [
  /^\/api\/v2\/login$/,
  /^\/api\/v2\/qris\/(?:menu|mutasi)\/[A-Za-z0-9._:-]+$/,
];

function json(res, status, body) {
  const data = Buffer.from(JSON.stringify(body));
  res.writeHead(status, {
    "content-type": "application/json; charset=utf-8",
    "content-length": data.length,
    "cache-control": "no-store",
  });
  res.end(data);
}

function secretMatches(value) {
  if (!value) return false;
  const supplied = Buffer.from(String(value));
  const expected = Buffer.from(proxySecret);
  return (
    supplied.length === expected.length &&
    crypto.timingSafeEqual(supplied, expected)
  );
}

function readBody(req) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    let size = 0;

    req.on("data", (chunk) => {
      size += chunk.length;
      if (size > maxBodyBytes) {
        reject(Object.assign(new Error("Request body terlalu besar"), { status: 413 }));
        req.destroy();
        return;
      }
      chunks.push(chunk);
    });
    req.on("end", () => resolve(Buffer.concat(chunks)));
    req.on("error", reject);
  });
}

function forward(path, req, res, body) {
  const upstream = https.request(
    {
      hostname: targetHost,
      port: 443,
      path,
      method: "POST",
      servername: targetHost,
      timeout: 20000,
      headers: {
        host: targetHost,
        accept: "application/json",
        "user-agent": req.headers["user-agent"] || "okhttp/4.12.0",
        "content-type": "application/x-www-form-urlencoded",
        "content-length": body.length,
      },
    },
    (upstreamRes) => {
      res.writeHead(upstreamRes.statusCode || 502, {
        "content-type": upstreamRes.headers["content-type"] || "application/json",
        "cache-control": "no-store",
      });
      upstreamRes.pipe(res);
    },
  );

  upstream.on("timeout", () => upstream.destroy(new Error("Upstream timeout")));
  upstream.on("error", (error) => {
    if (!res.headersSent) {
      json(res, 502, { success: false, message: error.message });
    } else {
      res.destroy();
    }
  });
  upstream.end(body);
}

const server = http.createServer(async (req, res) => {
  const startedAt = Date.now();
  const url = new URL(req.url || "/", "http://localhost");

  res.on("finish", () => {
    const route = url.pathname.includes("/mutasi/")
      ? "qris-mutasi"
      : url.pathname.includes("/menu/")
        ? "qris-menu"
        : url.pathname === "/api/v2/login"
          ? "login"
          : url.pathname === "/health"
            ? "health"
            : "rejected";
    console.log(`${new Date().toISOString()} ${req.method} ${route} ${res.statusCode} ${Date.now() - startedAt}ms`);
  });

  if (req.method === "GET" && url.pathname === "/health") {
    return json(res, 200, { status: true, service: "orderkuota-vps-proxy" });
  }

  if (!secretMatches(req.headers["x-proxy-key"])) {
    return json(res, 401, { success: false, message: "Unauthorized" });
  }

  if (
    req.method !== "POST" ||
    url.search ||
    !allowedPaths.some((pattern) => pattern.test(url.pathname))
  ) {
    return json(res, 404, { success: false, message: "Not found" });
  }

  try {
    const body = await readBody(req);
    forward(url.pathname, req, res, body);
  } catch (error) {
    if (!res.headersSent) {
      json(res, error.status || 400, { success: false, message: error.message });
    }
  }
});

server.requestTimeout = 30000;
server.headersTimeout = 10000;
server.keepAliveTimeout = 5000;
server.listen(port, bindHost, () => {
  console.log(`orderkuota-vps-proxy listening on http://${bindHost}:${port}`);
});

function shutdown() {
  server.close(() => process.exit(0));
  setTimeout(() => process.exit(1), 5000).unref();
}

process.on("SIGTERM", shutdown);
process.on("SIGINT", shutdown);
