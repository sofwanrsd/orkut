// Dashboard Worker — Console + Docs + Payment Demo
// Estetika sama dengan versi lama: terminal-style, Alpine.js, tema Taveve

export function dashboard() {
  return `<!DOCTYPE html>
<html lang="id">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>TAVEVE Gateway — API Gateway</title>
<script src="https://cdn.tailwindcss.com"></script>
<script defer src="https://cdn.jsdelivr.net/npm/alpinejs@3.x.x/dist/cdn.min.js"></script>
<script src="https://cdn.jsdelivr.net/npm/qrcodejs@1.0.0/qrcode.min.js"></script>
<script>
  tailwind.config = {
    theme: {
      extend: {
        fontFamily: { sans: ['system-ui','sans-serif'], mono: ['ui-monospace','monospace'] },
        colors: {
          taveve: {
            400: '#ffb84d', 500: '#F5A623', 600: '#e68a00',
            800: '#9e5b00', 950: '#2d1a00'
          }
        }
      }
    }
  }
</script>
<style>
  body { background-color: #000; color: #e2e8f0; }
  .card { background: #0d0d0d; border: 1px solid #222; }
  .input-field { background: #000; border: 1px solid #2a2a2a; color: #fff; }
  .input-field:focus { border-color: #F5A623; outline: none; }
  ::-webkit-scrollbar { width: 6px; height: 6px; }
  ::-webkit-scrollbar-track { background: transparent; }
  ::-webkit-scrollbar-thumb { background: #333; border-radius: 3px; }
  pre { white-space: pre-wrap; word-wrap: break-word; }
  .tab-active { color: #ffb84d; border-bottom: 2px solid #F5A623; }
  .badge { background: #2d1a00; border: 1px solid #9e5b00; color: #ffb84d; }
  .method-badge { font-size: 10px; font-weight: 700; padding: 2px 6px; border-radius: 4px; font-family: monospace; }
  .method-get { background: #022c22; color: #4ade80; border: 1px solid #166534; }
  .method-post { background: #1c1f2e; color: #60a5fa; border: 1px solid #1e3a8a; }
  .method-delete { background: #2c1515; color: #f87171; border: 1px solid #7f1d1d; }
  .method-patch { background: #1c1a0a; color: #fbbf24; border: 1px solid #713f12; }
  .status-badge { font-size: 10px; font-weight: 700; padding: 2px 6px; border-radius: 4px; font-family: monospace; }
  .status-paid { background: #022c22; color: #4ade80; }
  .status-pending { background: #1c1a0a; color: #fbbf24; }
  .status-expired { background: #2c1515; color: #f87171; }
  .status-success { background: #022c22; color: #4ade80; }
  .status-error { background: #2c1515; color: #f87171; }
  .status-info { background: #0c1a2c; color: #60a5fa; }
  .glow-orange { box-shadow: 0 0 20px rgba(245,166,35,0.15); }
  .glow-green { box-shadow: 0 0 20px rgba(74,222,128,0.15); }
  .glow-red { box-shadow: 0 0 20px rgba(248,113,113,0.15); }
  .glow-yellow { box-shadow: 0 0 20px rgba(251,191,36,0.15); }
  .pulse-dot { animation: pulse 2s infinite; }
  @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:.4} }
</style>
</head>
<body class="min-h-screen p-4 md:p-8 flex flex-col items-center" x-data="app()">

<!-- HEADER -->
<header class="w-full max-w-6xl mb-6 flex flex-col md:flex-row items-center justify-between gap-4">
  <div class="flex items-center gap-4">
    <div class="h-12 w-12 bg-taveve-950 rounded border border-taveve-800 flex items-center justify-center">
      <span class="text-xl font-bold text-taveve-400">T</span>
    </div>
    <div>
      <h1 class="text-2xl font-bold text-white">TAVEVE Gateway</h1>
      <div class="flex items-center gap-2 mt-0.5">
        <span class="badge px-2 py-0.5 rounded text-[10px] font-bold">v3.0</span>
        <span class="text-xs text-slate-500 font-mono">CF Worker + D1</span>
        <span class="flex items-center gap-1 text-xs text-emerald-400">
          <span class="w-1.5 h-1.5 bg-emerald-400 rounded-full pulse-dot"></span>
          LIVE
        </span>
      </div>
    </div>
  </div>
  <div class="flex gap-2">
    <span class="text-xs text-slate-500 font-mono">https://taveve-gateway.tavevestr.workers.dev</span>
  </div>
</header>

<main class="w-full max-w-6xl">

<!-- TABS -->
<div class="flex gap-6 mb-6 border-b border-slate-800">
  <button @click="tab = 'console'" :class="tab==='console'?'tab-active':'text-slate-500 border-transparent'"
    class="pb-3 px-1 text-sm font-bold uppercase tracking-widest border-b-2 transition-colors">Console</button>
  <button @click="tab = 'docs'" :class="tab==='docs'?'tab-active':'text-slate-500 border-transparent'"
    class="pb-3 px-1 text-sm font-bold uppercase tracking-widest border-b-2 transition-colors">Docs</button>
  <button @click="tab = 'demo'" :class="tab==='demo'?'tab-active':'text-slate-500 border-transparent'"
    class="pb-3 px-1 text-sm font-bold uppercase tracking-widest border-b-2 transition-colors">Payment Demo</button>
</div>

<!-- ==================== CONSOLE ==================== -->
<template x-if="tab === 'console'">
<div class="grid grid-cols-1 lg:grid-cols-12 gap-6">

  <!-- LEFT: Request Config -->
  <div class="lg:col-span-4">
    <div class="card rounded-xl p-5 glow-orange">
      <h2 class="text-xs font-bold text-slate-400 uppercase tracking-widest mb-5">Request Config</h2>
      <form @submit.prevent="sendRequest" class="space-y-4">
        <div>
          <label class="block text-[10px] font-bold text-taveve-400 uppercase mb-1">Target Endpoint</label>
          <select x-model="selected" @change="resetForm()" class="input-field w-full rounded p-2.5 text-sm cursor-pointer">
            <optgroup label="AUTH">
              <option value="login">Login — Request OTP</option>
              <option value="verify">Verify OTP — Get Token</option>
            </optgroup>
            <optgroup label="QRIS">
              <option value="balance">Cek Saldo</option>
              <option value="mutasi">Cek Mutasi QRIS</option>
              <option value="mutasi-detail">Cek Mutasi Detail</option>
              <option value="dynamic">Generate Dynamic QRIS</option>
            </optgroup>
            <optgroup label="PAYMENT (BARU)">
              <option value="pay-create">Create Invoice</option>
              <option value="pay-status">Check Status</option>
              <option value="pay-scan">Manual Scan</option>
            </optgroup>
          </select>
        </div>

        <div>
          <label class="block text-[10px] font-bold text-taveve-400 uppercase mb-1">X-API-Key</label>
          <input type="text" x-model="cred.apiKey" placeholder="kunci gateway (kosong jika dev)" class="input-field w-full rounded p-2.5 text-xs font-mono">
        </div>

        <div class="space-y-3">
          <!-- Auth fields -->
          <template x-if="['login','verify','mutasi','mutasi-detail','balance'].includes(selected)">
            <div>
              <label class="block text-[10px] font-bold text-slate-500 uppercase mb-1">Username</label>
              <input type="text" x-model="f.username" placeholder="username" class="input-field w-full rounded p-2.5 text-sm font-mono">
            </div>
          </template>
          <template x-if="selected === 'login'">
            <div>
              <label class="block text-[10px] font-bold text-slate-500 uppercase mb-1">Password</label>
              <input type="password" x-model="f.password" class="input-field w-full rounded p-2.5 text-sm font-mono">
            </div>
          </template>
          <template x-if="selected === 'verify'">
            <div>
              <label class="block text-[10px] font-bold text-slate-500 uppercase mb-1">Kode OTP</label>
              <input type="text" x-model="f.otp" placeholder="123456" class="input-field w-full rounded p-2.5 text-lg font-mono text-center tracking-[0.3em] font-bold text-taveve-400">
            </div>
          </template>
          <template x-if="['mutasi','mutasi-detail','balance'].includes(selected)">
            <div>
              <label class="block text-[10px] font-bold text-slate-500 uppercase mb-1">Auth Token</label>
              <input type="text" x-model="f.token" placeholder="token_id:auth_token" class="input-field w-full rounded p-2.5 text-xs font-mono">
            </div>
          </template>
          <!-- Mutasi detail filters -->
          <template x-if="selected === 'mutasi-detail'">
            <div class="space-y-3">
              <div class="grid grid-cols-2 gap-2">
                <div>
                  <label class="block text-[10px] font-bold text-slate-500 uppercase mb-1">Page</label>
                  <input type="number" x-model="f.page" value="1" class="input-field w-full rounded p-2.5 text-sm font-mono">
                </div>
                <div>
                  <label class="block text-[10px] font-bold text-slate-500 uppercase mb-1">Jumlah</label>
                  <input type="text" x-model="f.jumlah" placeholder="10000" class="input-field w-full rounded p-2.5 text-sm font-mono">
                </div>
              </div>
              <div>
                <label class="block text-[10px] font-bold text-slate-500 uppercase mb-1">Dari Tanggal</label>
                <input type="date" x-model="f.start_date" class="input-field w-full rounded p-2.5 text-sm font-mono">
              </div>
              <div>
                <label class="block text-[10px] font-bold text-slate-500 uppercase mb-1">Ke Tanggal</label>
                <input type="date" x-model="f.end_date" class="input-field w-full rounded p-2.5 text-sm font-mono">
              </div>
              <div>
                <label class="block text-[10px] font-bold text-slate-500 uppercase mb-1">Filter Keterangan</label>
                <input type="text" x-model="f.keterangan" placeholder="GOPAY, OVO, DANA..." class="input-field w-full rounded p-2.5 text-sm font-mono">
              </div>
            </div>
          </template>
          <!-- Dynamic QR -->
          <template x-if="selected === 'dynamic'">
            <div class="space-y-3">
              <div>
                <label class="block text-[10px] font-bold text-slate-500 uppercase mb-1">Base String QRIS</label>
                <textarea x-model="f.base_string" rows="3" placeholder="000201..." class="input-field w-full rounded p-2.5 text-xs font-mono"></textarea>
              </div>
              <div>
                <label class="block text-[10px] font-bold text-slate-500 uppercase mb-1">Nominal (Rp)</label>
                <input type="number" x-model="f.amount" class="input-field w-full rounded p-2.5 text-sm font-mono">
              </div>
            </div>
          </template>
          <!-- Payment create -->
          <template x-if="selected === 'pay-create'">
            <div class="space-y-3">
              <div>
                <label class="block text-[10px] font-bold text-slate-500 uppercase mb-1">Base Amount (Rp)</label>
                <input type="number" x-model="f.amount" placeholder="10000" class="input-field w-full rounded p-2.5 text-sm font-mono">
              </div>
              <div>
                <label class="block text-[10px] font-bold text-slate-500 uppercase mb-1">Invoice ID (opsional)</label>
                <input type="text" x-model="f.id" placeholder="INV-001" class="input-field w-full rounded p-2.5 text-sm font-mono">
              </div>
            </div>
          </template>
          <!-- Payment status -->
          <template x-if="selected === 'pay-status'">
            <div>
              <label class="block text-[10px] font-bold text-slate-500 uppercase mb-1">Invoice ID</label>
              <input type="text" x-model="f.id" placeholder="c0d3..." class="input-field w-full rounded p-2.5 text-sm font-mono">
            </div>
          </template>
          <!-- Kredensial merchant (header) untuk semua endpoint payment -->
          <template x-if="selected.startsWith('pay-')">
            <div class="space-y-3 border-t border-slate-800 pt-3 mt-1">
              <p class="text-[10px] font-bold text-taveve-400 uppercase">Header Kredensial (server-to-server)</p>
              <div>
                <label class="block text-[10px] font-bold text-slate-500 uppercase mb-1">X-Merchant-Id</label>
                <input type="text" x-model="cred.merchantId" placeholder="tokoberkah" class="input-field w-full rounded p-2.5 text-xs font-mono">
              </div>
              <div>
                <label class="block text-[10px] font-bold text-slate-500 uppercase mb-1">X-Auth-Token</label>
                <input type="text" x-model="cred.token" placeholder="token_id:auth_token" class="input-field w-full rounded p-2.5 text-xs font-mono">
              </div>
              <div>
                <label class="block text-[10px] font-bold text-slate-500 uppercase mb-1">X-Auth-Username</label>
                <input type="text" x-model="cred.username" placeholder="username" class="input-field w-full rounded p-2.5 text-xs font-mono">
              </div>
              <template x-if="selected === 'pay-create'">
                <div>
                  <label class="block text-[10px] font-bold text-slate-500 uppercase mb-1">X-Qris-Base</label>
                  <textarea x-model="cred.qrisBase" rows="2" placeholder="000201..." class="input-field w-full rounded p-2.5 text-xs font-mono"></textarea>
                </div>
              </template>
            </div>
          </template>
        </div>

        <button type="submit" :disabled="loading"
          class="w-full py-3 rounded font-bold text-sm uppercase tracking-wider transition-colors"
          :class="loading ? 'bg-slate-800 text-slate-500 cursor-not-allowed' : 'bg-taveve-600 hover:bg-taveve-500 text-white'">
          <span x-show="!loading">Execute Request</span>
          <span x-show="loading">Processing...</span>
        </button>
      </form>
    </div>
  </div>

  <!-- RIGHT: Response -->
  <div class="lg:col-span-8">
    <div class="card rounded-xl h-[580px] flex flex-col overflow-hidden border-t-2 border-t-taveve-500">
      <div class="bg-black border-b border-slate-800 p-3 flex justify-between items-center px-5">
        <div class="flex gap-1.5">
          <div class="w-2.5 h-2.5 rounded-full bg-red-500"></div>
          <div class="w-2.5 h-2.5 rounded-full bg-yellow-500"></div>
          <div class="w-2.5 h-2.5 rounded-full bg-green-500"></div>
        </div>
        <span class="font-mono text-xs" :class="statusClass" x-text="status"></span>
      </div>
      <div class="flex-1 bg-black p-5 overflow-auto font-mono text-xs relative">
        <div x-show="!response && !loading" class="absolute inset-0 flex flex-col items-center justify-center text-slate-700">
          <p class="font-bold tracking-widest">AWAITING INPUT</p>
        </div>
        <div x-show="loading" class="absolute inset-0 flex items-center justify-center bg-black/80 z-20">
          <span class="text-taveve-400 font-mono text-sm animate-pulse">Processing...</span>
        </div>
        <!-- QR result -->
        <template x-if="qrString">
          <div class="mb-6 flex gap-5 items-start p-5 bg-slate-900/50 rounded border border-slate-800">
            <div class="bg-white p-2 rounded flex-shrink-0" id="qrconsole"></div>
            <div>
              <h3 class="text-white font-bold text-base mb-1">QRIS Generated!</h3>
              <p class="text-slate-400 mb-2 text-xs">Nominal: <span class="text-taveve-400 font-bold" x-text="'Rp ' + Number(invAmount).toLocaleString('id-ID')"></span></p>
              <p class="text-slate-500 mb-3 text-xs">ID: <span class="text-slate-300" x-text="invId"></span></p>
              <div class="text-xs text-slate-500 mb-3">Dynamic String:</div>
              <div class="bg-black p-2 rounded border border-slate-700 text-[10px] text-emerald-400 break-all mb-3" x-text="qrString"></div>
            </div>
          </div>
        </template>
        <div x-show="response">
          <pre class="text-emerald-400 leading-relaxed" x-text="response"></pre>
        </div>
      </div>
    </div>
  </div>
</div>
</template>

<!-- ==================== DOCS ==================== -->
<template x-if="tab === 'docs'">
<div class="space-y-6 pb-16">

  <!-- Overview -->
  <div class="card p-6 rounded-xl border-t-2 border-t-taveve-500">
    <h2 class="text-xl font-bold text-white mb-2">Dokumentasi API — TAVEVE Gateway</h2>
    <p class="text-slate-400 text-sm leading-relaxed">
      Base URL: <span class="text-taveve-400 font-mono font-bold">https://taveve-gateway.tavevestr.workers.dev</span><br>
      <b class="text-taveve-400">Multi-tenant SaaS</b> — setiap request membawa kredensial merchant.<br>
      <b class="text-taveve-400">Tidak perlu login/OTP.</b> Cukup punya auth_token + username OrderKuota.
    </p>
    <div class="mt-3 flex flex-wrap gap-2">
      <span class="badge">Multi-tenant (banyak merchant)</span>
      <span class="badge">Bebas Captcha (polling saldo)</span>
      <span class="badge">Worker stateless</span>
      <span class="badge">Cloudflare Worker + D1</span>
    </div>
  </div>

  <!-- MODULE 01: Credential -->
  <div class="space-y-3">
    <h3 class="text-base font-bold text-taveve-400 flex items-center gap-2">
      <span class="px-2 py-0.5 bg-taveve-950 rounded border border-taveve-800 text-xs">MODULE 01</span>
      Kredensial
    </h3>

    <div class="card p-5 rounded-xl border-l-2 border-l-slate-700">
      <div class="flex flex-col md:flex-row md:items-start justify-between mb-4 gap-2">
        <div>
          <h4 class="font-bold text-white">Header Wajib (server-to-server)</h4>
          <p class="text-slate-400 text-sm mt-1">Semua endpoint <span class="text-taveve-400 font-mono">/api/pay/*</span> dipanggil dari <b class="text-white">server utama Anda</b>, bukan browser pelanggan (kredensial tidak boleh bocor ke klien). Kredensial dikirim lewat HTTP header, bukan body.</p>
        </div>
      </div>
      <div class="grid md:grid-cols-2 gap-5">
        <div>
          <h5 class="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Header</h5>
          <ul class="text-sm text-slate-300 space-y-1.5">
            <li class="flex gap-2"><span class="text-taveve-400 font-mono bg-taveve-950/30 px-1 rounded">X-API-Key</span> kunci gateway (anti-abuse)</li>
            <li class="flex gap-2"><span class="text-taveve-400 font-mono bg-taveve-950/30 px-1 rounded">X-Merchant-Id</span> ID unik merchant (dari DB Anda)</li>
            <li class="flex gap-2"><span class="text-taveve-400 font-mono bg-taveve-950/30 px-1 rounded">X-Auth-Token</span> token OrderKuota merchant</li>
            <li class="flex gap-2"><span class="text-taveve-400 font-mono bg-taveve-950/30 px-1 rounded">X-Auth-Username</span> username OrderKuota merchant</li>
            <li class="flex gap-2"><span class="text-taveve-400 font-mono bg-taveve-950/30 px-1 rounded">X-Qris-Base</span> QRIS statis merchant (khusus create)</li>
          </ul>
        </div>
        <div>
          <h5 class="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Catatan</h5>
          <ul class="text-sm text-slate-400 space-y-1">
            <li>• Tiap merchant punya baseline saldo & pool kode unik <b class="text-white">terpisah</b> (di-scope per <span class="font-mono">X-Merchant-Id</span>).</li>
            <li>• <b class="text-white">Tidak perlu login/OTP</b> — token + username langsung dipakai scan saldo.</li>
            <li>• <span class="font-mono">X-API-Key</span> di-set di server via <span class="font-mono">wrangler secret put GATEWAY_API_KEY</span>.</li>
            <li>• Browser pelanggan polling ke <b class="text-white">server utama</b>, lalu server yang teruskan ke gateway.</li>
          </ul>
        </div>
      </div>
    </div>

    <div class="card p-5 rounded-xl border-l-2 border-l-slate-700">
      <div class="flex flex-col md:flex-row md:items-start justify-between mb-4 gap-2">
        <div>
          <h4 class="font-bold text-white">Keterangan</h4>
          <p class="text-slate-400 text-sm mt-1">Endpoint Auth (<code class="text-taveve-400 font-mono">/api/auth/*</code>) tetap tersedia untuk testing manual. <b class="text-white">Tidak wajib</b> untuk alur Payment — cukup punya <code class="text-taveve-400 font-mono">auth_token</code> + <code class="text-taveve-400 font-mono">auth_username</code>.</p>
        </div>
      </div>
    </div>
  </div>

  <!-- MODULE 02: QRIS -->
  <div class="space-y-3">
    <h3 class="text-base font-bold text-taveve-400 flex items-center gap-2">
      <span class="px-2 py-0.5 bg-taveve-950 rounded border border-taveve-800 text-xs">MODULE 02</span>
      QRIS
    </h3>

    <div class="card p-5 rounded-xl border-l-2 border-l-slate-700">
      <div class="flex flex-col md:flex-row md:items-start justify-between mb-4 gap-2">
        <div>
          <h4 class="font-bold text-white">3. Cek Saldo</h4>
          <p class="text-slate-400 text-sm mt-1">Melihat saldo utama dan saldo QRIS. <b class="text-taveve-400">Tidak kena captcha</b> — digunakan untuk deteksi pembayaran.</p>
        </div>
        <div class="flex items-center gap-2">
          <span class="method-badge method-post">POST</span>
          <code class="text-xs bg-black px-3 py-1.5 rounded border border-slate-800 text-taveve-400 font-mono">/api/qris/balance</code>
        </div>
      </div>
      <div class="grid md:grid-cols-2 gap-5">
        <div>
          <h5 class="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Parameters</h5>
          <ul class="text-sm text-slate-300 space-y-1.5">
            <li class="flex gap-2"><span class="text-taveve-400 font-mono bg-taveve-950/30 px-1 rounded text-xs">X-API-Key</span> <span class="text-xs">Header. Kunci gateway.</span></li>
            <li class="flex gap-2"><span class="text-taveve-400 font-mono bg-taveve-950/30 px-1 rounded text-xs">auth_username</span> <span class="text-xs">Body. Username OrderKuota.</span></li>
            <li class="flex gap-2"><span class="text-taveve-400 font-mono bg-taveve-950/30 px-1 rounded text-xs">auth_token</span> <span class="text-xs">Body. Auth token dari hasil verify OTP.</span></li>
          </ul>
        </div>
        <div>
          <h5 class="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Response Example</h5>
          <pre class="bg-black p-3 rounded text-xs text-emerald-400 border border-slate-800 overflow-x-auto">{
  "status": true,
  "message": "Success",
  "data": {
    "success": true,
    "balance": 198076,
    "qris_balance": 188,
    "name": "TAVEVE STORE",
    "username": "USERNAME_ANDA"
  }
}</pre>
        </div>
      </div>
    </div>

    <div class="card p-5 rounded-xl border-l-2 border-l-slate-700 glow-orange">
      <div class="flex flex-col md:flex-row md:items-start justify-between mb-4 gap-2">
        <div>
          <h4 class="font-bold text-white">4. Cek Mutasi QRIS</h4>
          <p class="text-slate-400 text-sm mt-1">Mengambil 4 transaksi terakhir (Status: IN). <b class="text-yellow-400">KENA CAPTCHA — verifikasi permintaan diperlukan.</b> Gunakan ini hanya untuk testing manual.</p>
        </div>
        <div class="flex items-center gap-2">
          <span class="method-badge method-post">POST</span>
          <code class="text-xs bg-black px-3 py-1.5 rounded border border-slate-800 text-taveve-400 font-mono">/api/qris/mutasi</code>
        </div>
      </div>
      <div class="grid md:grid-cols-2 gap-5">
        <div>
          <h5 class="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Parameters</h5>
          <ul class="text-sm text-slate-300 space-y-1.5">
            <li class="flex gap-2"><span class="text-taveve-400 font-mono bg-taveve-950/30 px-1 rounded text-xs">X-API-Key</span> <span class="text-xs">Header. Kunci gateway.</span></li>
            <li class="flex gap-2"><span class="text-taveve-400 font-mono bg-taveve-950/30 px-1 rounded text-xs">auth_username</span> <span class="text-xs">Body. Username OrderKuota.</span></li>
            <li class="flex gap-2"><span class="text-taveve-400 font-mono bg-taveve-950/30 px-1 rounded text-xs">auth_token</span> <span class="text-xs">Body. Auth token.</span></li>
            <li class="flex gap-2"><span class="text-taveve-400 font-mono bg-taveve-950/30 px-1 rounded text-xs">page</span> <span class="text-xs">Body. Halaman (default 1).</span></li>
          </ul>
          <p class="text-xs text-yellow-400 mt-3">Catatan: endpoint mutasi OrderKuota memerlukan verifikasi captcha — biasanya gagal otomatis. Pakai <span class="font-mono">/api/pay/*</span> untuk deteksi pembayaran.</p>
        </div>
        <div>
          <h5 class="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Response Example</h5>
          <pre class="bg-black p-3 rounded text-xs text-emerald-400 border border-slate-800 overflow-x-auto">{
  "status": true,
  "message": "Success",
  "data": {
    "success": true,
    "qris_history": {
      "success": false,
      "total": 0,
      "results": [],
      "message": "Kamu belum melakukan verifikasi permintaan"
    },
    "account": {
      "success": true,
      "results": {
        "id": 2440365,
        "username": "USERNAME_ANDA",
        "qris_balance": 188,
        "qris_name": "TAVEVE STORE"
      }
    }
  }
}</pre>
        </div>
      </div>
    </div>

    <div class="card p-5 rounded-xl border-l-2 border-l-slate-700">
      <div class="flex flex-col md:flex-row md:items-start justify-between mb-4 gap-2">
        <div>
          <h4 class="font-bold text-white">5. Cek Mutasi Detail</h4>
          <p class="text-slate-400 text-sm mt-1">Semua transaksi dengan filter tanggal, keterangan, jumlah, dan pagination.</p>
        </div>
        <div class="flex items-center gap-2">
          <span class="method-badge method-post">POST</span>
          <code class="text-xs bg-black px-3 py-1.5 rounded border border-slate-800 text-taveve-400 font-mono">/api/qris/mutasi-detail</code>
        </div>
      </div>
      <div class="grid md:grid-cols-2 gap-5">
        <div>
          <h5 class="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Parameters</h5>
          <ul class="text-sm text-slate-300 space-y-1.5">
            <li class="flex gap-2"><span class="text-taveve-400 font-mono bg-taveve-950/30 px-1 rounded text-xs">X-API-Key</span> <span class="text-xs">Header. Kunci gateway.</span></li>
            <li class="flex gap-2"><span class="text-taveve-400 font-mono bg-taveve-950/30 px-1 rounded text-xs">auth_username</span> <span class="text-xs">Body. Username OrderKuota.</span></li>
            <li class="flex gap-2"><span class="text-taveve-400 font-mono bg-taveve-950/30 px-1 rounded text-xs">auth_token</span> <span class="text-xs">Body. Auth token.</span></li>
            <li class="flex gap-2"><span class="text-taveve-400 font-mono bg-taveve-950/30 px-1 rounded text-xs">page</span> <span class="text-xs">Body. Halaman (default 1).</span></li>
            <li class="flex gap-2"><span class="text-taveve-400 font-mono bg-taveve-950/30 px-1 rounded text-xs">start_date</span> <span class="text-xs">Body. Filter dari (YYYY-MM-DD).</span></li>
            <li class="flex gap-2"><span class="text-taveve-400 font-mono bg-taveve-950/30 px-1 rounded text-xs">end_date</span> <span class="text-xs">Body. Filter sampai (YYYY-MM-DD).</span></li>
            <li class="flex gap-2"><span class="text-taveve-400 font-mono bg-taveve-950/30 px-1 rounded text-xs">keterangan</span> <span class="text-xs">Body. Filter source (GOPAY/OVO/DANA).</span></li>
            <li class="flex gap-2"><span class="text-taveve-400 font-mono bg-taveve-950/30 px-1 rounded text-xs">jumlah</span> <span class="text-xs">Body. Filter nominal.</span></li>
          </ul>
        </div>
        <div>
          <h5 class="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Response Example</h5>
          <pre class="bg-black p-3 rounded text-xs text-emerald-400 border border-slate-800 overflow-x-auto">{
  "status": true,
  "message": "Success",
  "data": {
    "success": true,
    "total": 2,
    "all_in": [
      {
        "id": 123456789,
        "kredit": "10.000",
        "debet": "0",
        "saldo_akhir": "100.000",
        "keterangan": "NOBU / JOHN DOE",
        "tanggal": "24/01/2026 18:23",
        "status": "IN",
        "brand": { "name": "GoPay" }
      }
    ],
    "all_out": [
      {
        "id": 123456790,
        "kredit": "0",
        "debet": "5.000",
        "saldo_akhir": "95.000",
        "keterangan": "Penarikan",
        "tanggal": "24/01/2026 19:01",
        "status": "OUT",
        "brand": { "name": "" }
      }
    ],
    "results": [ /* gabungan all_in + all_out */ ]
  }
}</pre>
        </div>
      </div>
    </div>

    <div class="card p-5 rounded-xl border-l-2 border-l-slate-700">
      <div class="flex flex-col md:flex-row md:items-start justify-between mb-4 gap-2">
        <div>
          <h4 class="font-bold text-white">6. Generate Dynamic QRIS</h4>
          <p class="text-slate-400 text-sm mt-1">Mengubah QRIS statis jadi dinamis — nominal tertanam di dalam QR. Endpoint ini <b class="text-taveve-400">bebas captcha</b>.</p>
        </div>
        <div class="flex items-center gap-2">
          <span class="method-badge method-post">POST</span>
          <code class="text-xs bg-black px-3 py-1.5 rounded border border-slate-800 text-taveve-400 font-mono">/api/qris/dynamic</code>
        </div>
      </div>
      <div class="grid md:grid-cols-2 gap-5">
        <div>
          <h5 class="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Parameters</h5>
          <ul class="text-sm text-slate-300 space-y-1.5">
            <li class="flex gap-2"><span class="text-taveve-400 font-mono bg-taveve-950/30 px-1 rounded text-xs">X-API-Key</span> <span class="text-xs">Header. Kunci gateway.</span></li>
            <li class="flex gap-2"><span class="text-taveve-400 font-mono bg-taveve-950/30 px-1 rounded text-xs">base_string</span> <span class="text-xs">Body. String QRIS statis (dimulai 000201...).</span></li>
            <li class="flex gap-2"><span class="text-taveve-400 font-mono bg-taveve-950/30 px-1 rounded text-xs">amount</span> <span class="text-xs">Body. Nominal (Int) dalam Rupiah.</span></li>
          </ul>
          <p class="text-xs text-slate-500 mt-3">Worker mengembalikan <span class="font-mono">dynamic_string</span>; render ke gambar QR di sisi klien (mis. <span class="font-mono">qrcodejs</span>).</p>
        </div>
        <div>
          <h5 class="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Response Example</h5>
          <pre class="bg-black p-3 rounded text-xs text-emerald-400 border border-slate-800 overflow-x-auto">{
  "status": true,
  "message": "Success",
  "data": {
    "original_string": "00020101021126670016COM.NOBUBANK.WWW...",
    "amount": 15000,
    "dynamic_string": "00020101021226670016COM.NOBUBANK.WWW..."
  }
}</pre>
        </div>
      </div>
    </div>
  </div>

  <!-- MODULE 03: PAYMENT (BARU) -->
  <div class="space-y-3">
    <h3 class="text-base font-bold text-taveve-400 flex items-center gap-2">
      <span class="px-2 py-0.5 bg-taveve-950 rounded border border-taveve-800 text-xs">MODULE 03</span>
      Payment Detection <span class="text-xs text-slate-500 font-normal normal-case">(BARU — Solusi captcha)</span>
    </h3>

    <div class="card p-5 rounded-xl border-l-2 border-l-slate-700 glow-orange">
      <div class="flex flex-col md:flex-row md:items-start justify-between mb-4 gap-2">
        <div>
          <h4 class="font-bold text-white">7. Create Invoice <span class="badge ml-2 text-[9px]">BARU</span></h4>
          <p class="text-slate-400 text-sm mt-1">Membuat tagihan dengan <b class="text-taveve-400">nominal unik otomatis</b>. Digit unik (1–500) ditambahkan ke base amount sehingga tiap order mudah dibedakan. QRIS dinamis langsung di-generate.</p>
        </div>
        <div class="flex items-center gap-2">
          <span class="method-badge method-post">POST</span>
          <code class="text-xs bg-black px-3 py-1.5 rounded border border-slate-800 text-taveve-400 font-mono">/api/pay/create</code>
        </div>
      </div>
      <div class="grid md:grid-cols-2 gap-5">
        <div>
          <h5 class="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Parameters</h5>
          <ul class="text-sm text-slate-300 space-y-1.5">
            <li class="flex gap-2"><span class="text-taveve-400 font-mono bg-taveve-950/30 px-1 rounded text-xs">X-API-Key</span> <span class="text-xs">Header. Kunci gateway (server-to-server).</span></li>
            <li class="flex gap-2"><span class="text-taveve-400 font-mono bg-taveve-950/30 px-1 rounded text-xs">X-Merchant-Id</span> <span class="text-xs">Header. ID unik merchant dari DB Anda.</span></li>
            <li class="flex gap-2"><span class="text-taveve-400 font-mono bg-taveve-950/30 px-1 rounded text-xs">X-Auth-Token</span> <span class="text-xs">Header. auth_token OrderKuota merchant.</span></li>
            <li class="flex gap-2"><span class="text-taveve-400 font-mono bg-taveve-950/30 px-1 rounded text-xs">X-Auth-Username</span> <span class="text-xs">Header. Username OrderKuota merchant.</span></li>
            <li class="flex gap-2"><span class="text-taveve-400 font-mono bg-taveve-950/30 px-1 rounded text-xs">X-Qris-Base</span> <span class="text-xs">Header. String QRIS statis merchant.</span></li>
            <li class="flex gap-2"><span class="text-taveve-400 font-mono bg-taveve-950/30 px-1 rounded text-xs">base_amount</span> <span class="text-xs">Body. Harga asli (Rp). Worker tambahkan kode unik 1–500.</span></li>
            <li class="flex gap-2"><span class="text-taveve-400 font-mono bg-taveve-950/30 px-1 rounded text-xs">id</span> <span class="text-xs">Body. Opsional. ID invoice dari server Anda; kosong = auto UUID.</span></li>
          </ul>
          <h5 class="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 mt-4">Catatan</h5>
          <ul class="text-xs text-slate-400 space-y-1">
            <li>• <b class="text-white">amount</b> di response = nominal yang harus dibayar pelanggan.</li>
            <li>• Tagihan aktif 10 menit + grace 2 menit (kode unik tetap terkunci).</li>
            <li>• Slot kode unik per nominal dasar: 500.</li>
          </ul>
        </div>
        <div>
          <h5 class="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Response Example</h5>
          <pre class="bg-black p-3 rounded text-xs text-emerald-400 border border-slate-800 overflow-x-auto">{
  "status": true,
  "message": "Success",
  "data": {
    "id": "INV-001",
    "merchant_id": "tokoberkah",
    "base_amount": 10000,
    "unique_code": 164,
    "amount": 10164,
    "qris_string": "00020101021226670016COM.NOBUBANK.WWW...",
    "status": "PENDING",
    "created_at": 1781617098947,
    "expires_at": 1781617698947
  }
}</pre>
        </div>
      </div>
    </div>

    <div class="card p-5 rounded-xl border-l-2 border-l-slate-700 glow-orange">
      <div class="flex flex-col md:flex-row md:items-start justify-between mb-4 gap-2">
        <div>
          <h4 class="font-bold text-white">8. Check Status <span class="badge ml-2 text-[9px]">BARU</span></h4>
          <p class="text-slate-400 text-sm mt-1">Mengecek status tagihan. Setiap pemanggilan otomatis menjalankan <b class="text-taveve-400">scan saldo</b> dan mencocokkan delta. Polling dari browser (tiap 4 detik) adalah cara standar menggunakan endpoint ini.</p>
        </div>
        <div class="flex items-center gap-2">
          <span class="method-badge method-get">GET</span>
          <code class="text-xs bg-black px-3 py-1.5 rounded border border-slate-800 text-taveve-400 font-mono">/api/pay/status/:id</code>
        </div>
      </div>
      <div class="grid md:grid-cols-2 gap-5">
        <div>
          <h5 class="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Parameters</h5>
          <ul class="text-sm text-slate-300 space-y-1.5">
            <li class="flex gap-2"><span class="text-taveve-400 font-mono bg-taveve-950/30 px-1 rounded text-xs">X-API-Key</span> <span class="text-xs">Header. Kunci gateway.</span></li>
            <li class="flex gap-2"><span class="text-taveve-400 font-mono bg-taveve-950/30 px-1 rounded text-xs">X-Merchant-Id</span> <span class="text-xs">Header. ID merchant.</span></li>
            <li class="flex gap-2"><span class="text-taveve-400 font-mono bg-taveve-950/30 px-1 rounded text-xs">X-Auth-Token</span> <span class="text-xs">Header. auth_token OrderKuota.</span></li>
            <li class="flex gap-2"><span class="text-taveve-400 font-mono bg-taveve-950/30 px-1 rounded text-xs">X-Auth-Username</span> <span class="text-xs">Header. Username OrderKuota.</span></li>
            <li class="flex gap-2"><span class="text-taveve-400 font-mono bg-taveve-950/30 px-1 rounded text-xs">id</span> <span class="text-xs">URL param. ID invoice yang dicek.</span></li>
          </ul>
          <h5 class="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 mt-4">Status Values</h5>
          <ul class="text-xs space-y-1">
            <li><span class="status-badge status-pending">PENDING</span> belum dibayar / dalam grace</li>
            <li><span class="status-badge status-paid">PAID</span> lunas — proses order</li>
            <li><span class="status-badge status-expired">EXPIRED</span> lewat 10 mnt + grace 2 mnt</li>
          </ul>
        </div>
        <div>
          <h5 class="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Response Example</h5>
          <pre class="bg-black p-3 rounded text-xs text-emerald-400 border border-slate-800 overflow-x-auto">{
  "status": true,
  "message": "Success",
  "data": {
    "id": "INV-001",
    "merchant_id": "tokoberkah",
    "amount": 10164,
    "base_amount": 10000,
    "status": "PAID",
    "paid": true,
    "paid_at": 1781617300000,
    "expires_at": 1781617698947,
    "scan": {
      "current": 237913,
      "delta": 10164,
      "matched": ["INV-001"],
      "note": "matched"
    }
  }
}</pre>
        </div>
      </div>
    </div>

    <div class="card p-5 rounded-xl border-l-2 border-l-slate-700 glow-orange">
      <div class="flex flex-col md:flex-row md:items-start justify-between mb-4 gap-2">
        <div>
          <h4 class="font-bold text-white">9. Manual Scan <span class="badge ml-2 text-[9px]">BARU</span></h4>
          <p class="text-slate-400 text-sm mt-1">Scan saldo satu merchant tanpa terikat satu tagihan. Dipanggil <b class="text-taveve-400">server utama</b> sebagai jaring pengaman (mis. cron server tiap beberapa menit per merchant) atau untuk debugging.</p>
        </div>
        <div class="flex items-center gap-2">
          <span class="method-badge method-post">POST</span>
          <code class="text-xs bg-black px-3 py-1.5 rounded border border-slate-800 text-taveve-400 font-mono">/api/pay/scan</code>
        </div>
      </div>
      <div class="grid md:grid-cols-2 gap-5">
        <div>
          <h5 class="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Parameters</h5>
          <ul class="text-sm text-slate-300 space-y-1.5">
            <li class="flex gap-2"><span class="text-taveve-400 font-mono bg-taveve-950/30 px-1 rounded text-xs">X-API-Key</span> <span class="text-xs">Header. Kunci gateway.</span></li>
            <li class="flex gap-2"><span class="text-taveve-400 font-mono bg-taveve-950/30 px-1 rounded text-xs">X-Merchant-Id</span> <span class="text-xs">Header. ID merchant.</span></li>
            <li class="flex gap-2"><span class="text-taveve-400 font-mono bg-taveve-950/30 px-1 rounded text-xs">X-Auth-Token</span> <span class="text-xs">Header. auth_token OrderKuota.</span></li>
            <li class="flex gap-2"><span class="text-taveve-400 font-mono bg-taveve-950/30 px-1 rounded text-xs">X-Auth-Username</span> <span class="text-xs">Header. Username OrderKuota.</span></li>
          </ul>
          <p class="text-xs text-slate-500 mt-3">Body kosong. Endpoint ini scan saldo merchant ini sekali → cocokkan delta vs PENDING → geser baseline.</p>
        </div>
        <div>
          <h5 class="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Response Example</h5>
          <pre class="bg-black p-3 rounded text-xs text-emerald-400 border border-slate-800 overflow-x-auto">{
  "status": true,
  "message": "Success",
  "data": {
    "current": 237913,
    "delta": 10164,
    "matched": ["INV-001"],
    "note": "matched"
  }
}</pre>
        </div>
      </div>
    </div>

    <!-- Alur integrasi -->
    <div class="card p-5 rounded-xl border-l-2 border-l-slate-700 glow-orange">
      <h4 class="font-bold text-white mb-3">Alur Integrasi Lengkap</h4>
      <div class="space-y-3 text-sm text-slate-300">
        <div class="flex items-start gap-3">
          <span class="flex-shrink-0 w-6 h-6 bg-taveve-950 rounded-full flex items-center justify-center text-taveve-400 text-xs font-bold">1</span>
          <div>
            <p class="font-bold text-white">Server Utama → Create Invoice</p>
            <p class="text-slate-500 text-xs">POST /api/pay/create { base_amount: 10000, id: "INV-001" } + header kredensial merchant → dapat nominal unik + QRIS</p>
          </div>
        </div>
        <div class="flex items-start gap-3">
          <span class="flex-shrink-0 w-6 h-6 bg-taveve-950 rounded-full flex items-center justify-center text-taveve-400 text-xs font-bold">2</span>
          <div>
            <p class="font-bold text-white">Tampilkan QRIS ke Pelanggan</p>
            <p class="text-slate-500 text-xs">Nominal yang harus dibayar = base_amount + unique_code</p>
          </div>
        </div>
        <div class="flex items-start gap-3">
          <span class="flex-shrink-0 w-6 h-6 bg-taveve-950 rounded-full flex items-center justify-center text-taveve-400 text-xs font-bold">3</span>
          <div>
            <p class="font-bold text-white">Server Utama Polling: Check Status (tiap ~4 detik)</p>
            <p class="text-slate-500 text-xs">Server utama (BUKAN browser pelanggan) → GET /api/pay/status/:id + header kredensial → Worker scan saldo → cocokkan delta → update status. Browser pelanggan polling ke server utama Anda, bukan langsung ke Worker (agar auth_token tidak bocor).</p>
          </div>
        </div>
        <div class="flex items-start gap-3">
          <span class="flex-shrink-0 w-6 h-6 bg-taveve-950 rounded-full flex items-center justify-center text-taveve-400 text-xs font-bold">4</span>
          <div>
            <p class="font-bold text-taveve-400">Status = PAID → Konfirmasi Otomatis</p>
            <p class="text-slate-500 text-xs">Server utama melihat status PAID dari polling-nya sendiri, lalu proses order. Selesai ✅</p>
          </div>
        </div>
      </div>
    </div>

    <!-- Quick start: contoh curl siap pakai -->
    <div class="card p-5 rounded-xl border-l-2 border-l-slate-700 glow-orange">
      <h4 class="font-bold text-white mb-1">Quick Start — Contoh cURL</h4>
      <p class="text-slate-400 text-sm mb-3">Ganti nilai header dengan kredensial merchant Anda. Semua dipanggil dari server, bukan browser.</p>

      <h5 class="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">1. Buat tagihan</h5>
      <pre class="bg-black p-3 rounded text-xs text-slate-300 border border-slate-800 overflow-x-auto">curl -X POST https://taveve-gateway.tavevestr.workers.dev/api/pay/create \
  -H "Content-Type: application/json" \
  -H "X-API-Key: KUNCI_GATEWAY_ANDA" \
  -H "X-Merchant-Id: tokoA" \
  -H "X-Auth-Token: 2440365:xxxxxxxx" \
  -H "X-Auth-Username: usernamemerchant" \
  -H "X-Qris-Base: 00020101021126...5802ID....." \
  -d '{ "base_amount": 10000, "id": "INV-001" }'</pre>

      <h5 class="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 mt-4">2. Cek status (polling)</h5>
      <pre class="bg-black p-3 rounded text-xs text-slate-300 border border-slate-800 overflow-x-auto">curl https://taveve-gateway.tavevestr.workers.dev/api/pay/status/INV-001 \
  -H "X-API-Key: KUNCI_GATEWAY_ANDA" \
  -H "X-Merchant-Id: tokoA" \
  -H "X-Auth-Token: 2440365:xxxxxxxx" \
  -H "X-Auth-Username: usernamemerchant"</pre>

      <h5 class="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 mt-4">3. Scan manual (jaring pengaman / cron)</h5>
      <pre class="bg-black p-3 rounded text-xs text-slate-300 border border-slate-800 overflow-x-auto">curl -X POST https://taveve-gateway.tavevestr.workers.dev/api/pay/scan \
  -H "X-API-Key: KUNCI_GATEWAY_ANDA" \
  -H "X-Merchant-Id: tokoA" \
  -H "X-Auth-Token: 2440365:xxxxxxxx" \
  -H "X-Auth-Username: usernamemerchant"</pre>
    </div>

    <!-- Referensi field & nilai -->
    <div class="card p-5 rounded-xl border-l-2 border-l-slate-700 glow-orange">
      <h4 class="font-bold text-white mb-3">Referensi Nilai</h4>
      <div class="grid md:grid-cols-2 gap-5">
        <div>
          <h5 class="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">status (invoice)</h5>
          <ul class="text-xs text-slate-300 space-y-1">
            <li><span class="status-badge status-pending">PENDING</span> belum dibayar / dalam grace</li>
            <li><span class="status-badge status-paid">PAID</span> lunas — proses order</li>
            <li><span class="status-badge status-expired">EXPIRED</span> lewat 10 mnt + grace 2 mnt</li>
          </ul>
          <h5 class="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 mt-4">Aturan waktu</h5>
          <ul class="text-xs text-slate-400 space-y-1">
            <li>• Invoice aktif <b class="text-white">10 menit</b> (expires_at).</li>
            <li>• <b class="text-white">Grace 2 menit</b> setelah expired: bayar telat masih PAID, kode unik masih terkunci.</li>
            <li>• Lewat grace → EXPIRED, kode unik dilepas untuk order lain.</li>
          </ul>
        </div>
        <div>
          <h5 class="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">scan.note (hasil pencocokan)</h5>
          <ul class="text-xs text-slate-300 space-y-1">
            <li><span class="text-taveve-400 font-mono">matched</span> 1 tagihan cocok persis</li>
            <li><span class="text-taveve-400 font-mono">matched_subset</span> beberapa tagihan terbayar 1 window</li>
            <li><span class="text-taveve-400 font-mono">no_change</span> saldo tidak berubah</li>
            <li><span class="text-taveve-400 font-mono">unmatched_in</span> uang masuk tak cocok tagihan manapun</li>
            <li><span class="text-taveve-400 font-mono">balance_down</span> saldo turun (WD/refund) — diserap baseline</li>
            <li><span class="text-taveve-400 font-mono">init_baseline</span> scan pertama merchant (set titik awal)</li>
          </ul>
        </div>
      </div>
      <p class="text-slate-500 text-xs mt-4">Yang menentukan order lunas adalah <b class="text-white">status = PAID</b> (atau id invoice muncul di <span class="font-mono">scan.matched</span>). Nilai <span class="font-mono">note</span> hanya untuk audit/log.</p>
    </div>

  </div>

  <!-- MODULE 04: SYSTEM & AUTH -->
  <div class="space-y-3">
    <h3 class="text-base font-bold text-taveve-400 flex items-center gap-2">
      <span class="px-2 py-0.5 bg-taveve-950 rounded border border-taveve-800 text-xs">MODULE 04</span>
      System &amp; Auth <span class="text-xs text-slate-500 font-normal normal-case">(opsional — testing/diagnostik)</span>
    </h3>

    <!-- Health -->
    <div class="card p-5 rounded-xl border-l-2 border-l-slate-700">
      <div class="flex flex-col md:flex-row md:items-start justify-between mb-4 gap-2">
        <div>
          <h4 class="font-bold text-white">Health Check</h4>
          <p class="text-slate-400 text-sm mt-1">Cek apakah gateway hidup dan bisa menjangkau OrderKuota. Berguna untuk monitoring/uptime. Tidak butuh API key.</p>
        </div>
        <div class="flex items-center gap-2">
          <span class="method-badge method-get">GET</span>
          <code class="text-xs bg-black px-3 py-1.5 rounded border border-slate-800 text-taveve-400 font-mono">/api/health</code>
        </div>
      </div>
      <div class="grid md:grid-cols-2 gap-5">
        <div>
          <h5 class="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Nilai api_status</h5>
          <ul class="text-xs text-slate-300 space-y-1">
            <li><span class="text-emerald-400 font-mono">online</span> gateway ↔ OrderKuota normal</li>
            <li><span class="text-yellow-400 font-mono">blocked</span> IP gateway belum di-whitelist OrderKuota</li>
            <li><span class="text-red-400 font-mono">offline</span> OrderKuota tidak bisa dihubungi</li>
          </ul>
        </div>
        <div>
          <h5 class="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Response</h5>
          <pre class="bg-black p-3 rounded text-xs text-emerald-400 border border-slate-800 overflow-x-auto">{
  "status": true,
  "message": "API Gateway healthy & OrderKuota reachable",
  "api_status": "online",
  "orderkuota_connection": "connected"
}</pre>
        </div>
      </div>
    </div>

    <!-- Login -->
    <div class="card p-5 rounded-xl border-l-2 border-l-slate-700">
      <div class="flex flex-col md:flex-row md:items-start justify-between mb-4 gap-2">
        <div>
          <h4 class="font-bold text-white">Login — Request OTP</h4>
          <p class="text-slate-400 text-sm mt-1">Memicu OrderKuota mengirim kode OTP ke email merchant. <b class="text-white">Hanya perlu sekali</b> untuk mendapatkan <span class="font-mono">auth_token</span> — setelah punya token, alur Payment tidak butuh login lagi.</p>
        </div>
        <div class="flex items-center gap-2">
          <span class="method-badge method-post">POST</span>
          <code class="text-xs bg-black px-3 py-1.5 rounded border border-slate-800 text-taveve-400 font-mono">/api/auth/login</code>
        </div>
      </div>
      <div class="grid md:grid-cols-2 gap-5">
        <div>
          <h5 class="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Parameters</h5>
          <ul class="text-sm text-slate-300 space-y-1.5">
            <li class="flex gap-2"><span class="text-taveve-400 font-mono bg-taveve-950/30 px-1 rounded text-xs">X-API-Key</span> <span class="text-xs">Header. Kunci gateway.</span></li>
            <li class="flex gap-2"><span class="text-taveve-400 font-mono bg-taveve-950/30 px-1 rounded text-xs">username</span> <span class="text-xs">Body. Username akun OrderKuota merchant.</span></li>
            <li class="flex gap-2"><span class="text-taveve-400 font-mono bg-taveve-950/30 px-1 rounded text-xs">password</span> <span class="text-xs">Body. Password akun OrderKuota.</span></li>
          </ul>
        </div>
        <div>
          <h5 class="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Response Example</h5>
          <pre class="bg-black p-3 rounded text-xs text-emerald-400 border border-slate-800 overflow-x-auto">{
  "status": true,
  "message": "Success",
  "data": {
    "success": true,
    "results": {
      "otp": "email",
      "otp_value": "sof***02@gmail.com"
    }
  }
}</pre>
        </div>
      </div>
    </div>

    <!-- Verify -->
    <div class="card p-5 rounded-xl border-l-2 border-l-slate-700">
      <div class="flex flex-col md:flex-row md:items-start justify-between mb-4 gap-2">
        <div>
          <h4 class="font-bold text-white">Verify OTP — Get Token</h4>
          <p class="text-slate-400 text-sm mt-1">Tukar kode OTP yang masuk ke email jadi <b class="text-white">auth_token</b>. Simpan token + username ini di DB server Anda — itulah yang dipakai untuk semua request Payment merchant.</p>
        </div>
        <div class="flex items-center gap-2">
          <span class="method-badge method-post">POST</span>
          <code class="text-xs bg-black px-3 py-1.5 rounded border border-slate-800 text-taveve-400 font-mono">/api/auth/verify</code>
        </div>
      </div>
      <div class="grid md:grid-cols-2 gap-5">
        <div>
          <h5 class="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Parameters</h5>
          <ul class="text-sm text-slate-300 space-y-1.5">
            <li class="flex gap-2"><span class="text-taveve-400 font-mono bg-taveve-950/30 px-1 rounded text-xs">X-API-Key</span> <span class="text-xs">Header. Kunci gateway.</span></li>
            <li class="flex gap-2"><span class="text-taveve-400 font-mono bg-taveve-950/30 px-1 rounded text-xs">username</span> <span class="text-xs">Body. Username yang sama dengan login.</span></li>
            <li class="flex gap-2"><span class="text-taveve-400 font-mono bg-taveve-950/30 px-1 rounded text-xs">otp</span> <span class="text-xs">Body. Kode 6 digit dari email.</span></li>
          </ul>
        </div>
        <div>
          <h5 class="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Response Example</h5>
          <pre class="bg-black p-3 rounded text-xs text-emerald-400 border border-slate-800 overflow-x-auto">{
  "status": true,
  "message": "Success",
  "data": {
    "success": true,
    "results": {
      "id": "USER_ID",
      "name": "NAMA_TOKO",
      "username": "USERNAME_ANDA",
      "token": "USER_ID:auth_token"
    }
  }
}</pre>
        </div>
      </div>
    </div>
  </div>
</div>
</template>

<!-- ==================== PAYMENT DEMO ==================== -->
<template x-if="tab === 'demo'">
<div class="space-y-6">

  <!-- Info -->
  <div class="card p-5 rounded-xl border-t-2 border-t-taveve-500">
    <h2 class="text-lg font-bold text-white mb-1">Simulasi Pembayaran</h2>
    <p class="text-slate-400 text-sm">Buat tagihan → bayar QRIS → deteksi otomatis via polling saldo. Tidak pakai mutasi — bebas captcha.</p>
  </div>

  <!-- Kredensial merchant (dikirim sebagai header) -->
  <div class="card p-5 rounded-xl border-l-2 border-l-slate-700">
    <h3 class="font-bold text-white mb-1">0. Kredensial Merchant</h3>
    <p class="text-slate-500 text-xs mb-4">Dikirim sebagai HTTP header. Di produksi, server utama Anda yang mengisi ini — bukan browser.</p>
    <div class="grid md:grid-cols-2 gap-3">
      <div>
        <label class="block text-[10px] font-bold text-slate-500 uppercase mb-1">X-API-Key</label>
        <input type="text" x-model="cred.apiKey" placeholder="kosong jika dev" class="input-field w-full rounded p-2.5 text-xs font-mono">
      </div>
      <div>
        <label class="block text-[10px] font-bold text-slate-500 uppercase mb-1">X-Merchant-Id</label>
        <input type="text" x-model="cred.merchantId" placeholder="tokoberkah" class="input-field w-full rounded p-2.5 text-xs font-mono">
      </div>
      <div>
        <label class="block text-[10px] font-bold text-slate-500 uppercase mb-1">X-Auth-Username</label>
        <input type="text" x-model="cred.username" placeholder="username OrderKuota" class="input-field w-full rounded p-2.5 text-xs font-mono">
      </div>
      <div>
        <label class="block text-[10px] font-bold text-slate-500 uppercase mb-1">X-Auth-Token</label>
        <input type="text" x-model="cred.token" placeholder="token_id:auth_token" class="input-field w-full rounded p-2.5 text-xs font-mono">
      </div>
      <div class="md:col-span-2">
        <label class="block text-[10px] font-bold text-slate-500 uppercase mb-1">X-Qris-Base</label>
        <input type="text" x-model="cred.qrisBase" placeholder="00020101021126..." class="input-field w-full rounded p-2.5 text-xs font-mono">
      </div>
    </div>
  </div>

  <!-- Form buat tagihan -->
  <div class="card p-5 rounded-xl border-l-2 border-l-slate-700 glow-orange">
    <h3 class="font-bold text-white mb-4">1. Buat Tagihan</h3>
    <div class="flex gap-3 mb-4">
      <div class="flex-1">
        <label class="block text-[10px] font-bold text-slate-500 uppercase mb-1">Nominal (Rp)</label>
        <input type="number" x-model="demoAmount" placeholder="10000" class="input-field w-full rounded p-2.5 text-sm font-mono">
      </div>
      <div class="flex-1">
        <label class="block text-[10px] font-bold text-slate-500 uppercase mb-1">Invoice ID (opsional)</label>
        <input type="text" x-model="demoId" placeholder="INV-001" class="input-field w-full rounded p-2.5 text-sm font-mono">
      </div>
    </div>
    <button @click="demoCreate" :disabled="demoLoading"
      class="px-6 py-2.5 rounded font-bold text-sm uppercase tracking-wider transition-colors"
      :class="demoLoading ? 'bg-slate-800 text-slate-500 cursor-not-allowed' : 'bg-taveve-600 hover:bg-taveve-500 text-white'">
      <span x-show="!demoLoading">Buat Tagihan</span>
      <span x-show="demoLoading">Membuat...</span>
    </button>
    <template x-if="demoError">
      <p class="mt-2 text-red-400 text-sm font-mono" x-text="demoError"></p>
    </template>
  </div>

  <!-- Invoice aktif -->
  <template x-if="demoInvoice">
  <div class="card p-5 rounded-xl border-l-2 border-l-slate-700 glow-orange">
    <h3 class="font-bold text-white mb-4">2. Bayar Sekarang</h3>
    <div class="flex flex-col md:flex-row gap-6 items-start">
      <!-- QR -->
      <div class="flex-shrink-0">
        <div class="bg-white p-3 rounded-lg" id="demo-qr"></div>
      </div>
      <!-- Info -->
      <div class="flex-1">
        <div class="grid grid-cols-2 gap-3 mb-4 text-sm">
          <div>
            <p class="text-[10px] font-bold text-slate-500 uppercase">Invoice ID</p>
            <p class="text-slate-200 font-mono text-xs truncate" x-text="demoInvoice.id"></p>
          </div>
          <div>
            <p class="text-[10px] font-bold text-slate-500 uppercase">Base Amount</p>
            <p class="text-slate-200 font-mono text-xs" x-text="'Rp ' + Number(demoInvoice.base_amount).toLocaleString('id-ID')"></p>
          </div>
          <div>
            <p class="text-[10px] font-bold text-slate-500 uppercase">Kode Unik</p>
            <p class="text-taveve-400 font-mono text-xs" x-text="'+' + demoInvoice.unique_code"></p>
          </div>
          <div>
            <p class="text-[10px] font-bold text-slate-500 uppercase">Yang Harus Dibayar</p>
            <p class="text-taveve-400 font-bold text-lg" x-text="'Rp ' + Number(demoInvoice.amount).toLocaleString('id-ID')"></p>
          </div>
          <div>
            <p class="text-[10px] font-bold text-slate-500 uppercase">Kedaluwarsa</p>
            <p class="text-slate-200 font-mono text-xs" x-text="new Date(demoInvoice.expires_at).toLocaleTimeString('id-ID')"></p>
          </div>
          <div>
            <p class="text-[10px] font-bold text-slate-500 uppercase">Status</p>
            <span class="status-badge status-pending" x-show="demoInvoice.status === 'PENDING'">PENDING</span>
            <span class="status-badge status-pending" x-show="demoInvoice.status === 'PAID'">PAID ✅</span>
            <span class="status-badge status-expired" x-show="demoInvoice.status === 'EXPIRED'">EXPIRED</span>
          </div>
        </div>
        <div class="flex gap-2">
          <button @click="demoPoll" :disabled="demoPolling"
            class="px-4 py-2 rounded font-bold text-xs transition-colors"
            :class="demoPolling ? 'bg-slate-800 text-slate-500' : 'bg-slate-700 hover:bg-slate-600 text-white'">
            <span x-show="!demoPolling">Cek Status</span>
            <span x-show="demoPolling">Scanning...</span>
          </button>
          <button @click="demoReset" class="px-4 py-2 rounded font-bold text-xs bg-slate-800 hover:bg-slate-700 text-slate-400">Reset</button>
        </div>
        <template x-if="demoScanResult">
          <div class="mt-3 p-3 rounded border text-xs font-mono" :class="demoScanResult.note === 'matched' ? 'border-taveve-800 bg-taveve-950/30 text-taveve-400' : 'border-slate-700 bg-slate-900/30 text-slate-400'">
            <p>delta: <span x-text="demoScanResult.delta"></span></p>
            <p>matched: <span x-text="JSON.stringify(demoScanResult.matched)"></span></p>
            <p>note: <span x-text="demoScanResult.note"></span></p>
          </div>
        </template>
      </div>
    </div>
  </div>
  </template>

  <!-- Instruksi -->
  <div class="card p-5 rounded-xl border-l-2 border-l-slate-700">
    <h3 class="font-bold text-white mb-3">Cara Test Pembayaran</h3>
    <ol class="text-sm text-slate-400 space-y-2 list-decimal list-inside">
      <li>Isi nominal (mis. <span class="text-taveve-400 font-mono">10000</span>) → klik <b class="text-white">Buat Tagihan</b></li>
      <li>Buka aplikasi <b class="text-white">OrderKuota</b> di HP → scan QRIS yang ditampilkan</li>
      <li>Transfer/ Bayar nominal yang tertera (Rp10.xxx)</li>
      <li>Klik <b class="text-white">Cek Status</b> → sistem mendeteksi otomatis</li>
      <li>Status berubah jadi <span class="status-badge status-paid">PAID ✅</span></li>
    </ol>
    <p class="mt-3 text-xs text-slate-600">Scan saldo dilakukan otomatis saat klik "Cek Status". Sistem mencocokkan kenaikan saldo dengan nominal unik invoice.</p>
  </div>

</div>
</template>

</main>

<footer class="mt-8 mb-4 text-center text-xs text-slate-400 font-mono">
  <p>Built by <span class="text-taveve-400 font-bold">ByDede</span> &copy; 2026 TAVEVE Gateway. All rights reserved.</p>
</footer>

<script>
function app() {
  return {
    tab: 'console',
    selected: 'login',
    loading: false,
    status: 'READY',
    statusClass: 'text-slate-500',
    response: '',
    qrString: null,
    invAmount: null,
    invId: null,

    f: {
      username: '', password: '', otp: '',
      token: '', base_string: '', amount: '', page: '1',
      start_date: '', end_date: '', keterangan: '', jumlah: '',
      id: ''
    },

    // Kredensial merchant untuk endpoint /api/pay/* (dikirim sebagai header).
    cred: { apiKey: '', merchantId: '', token: '', username: '', qrisBase: '' },

    // Bangun header kredensial untuk endpoint payment (server-to-server).
    payHeaders() {
      return {
        'Content-Type': 'application/json',
        'X-API-Key': this.cred.apiKey,
        'X-Merchant-Id': this.cred.merchantId,
        'X-Auth-Token': this.cred.token,
        'X-Auth-Username': this.cred.username,
        'X-Qris-Base': this.cred.qrisBase
      };
    },

    // Demo
    demoAmount: 10000,
    demoId: '',
    demoLoading: false,
    demoError: '',
    demoInvoice: null,
    demoPolling: false,
    demoScanResult: null,

    resetForm() {
      this.response = '';
      this.qrString = null;
      this.invAmount = null;
      this.invId = null;
      this.status = 'READY';
      this.statusClass = 'text-slate-500';
    },

    async sendRequest() {
      this.loading = true;
      this.response = '';
      this.qrString = null;
      this.status = 'TRANSMITTING...';
      this.statusClass = 'text-yellow-400';

      let endpoint = '', payload = {};

      if (this.selected === 'login') {
        endpoint = '/api/auth/login';
        payload = { username: this.f.username, password: this.f.password };
      } else if (this.selected === 'verify') {
        endpoint = '/api/auth/verify';
        payload = { username: this.f.username, otp: this.f.otp };
      } else if (this.selected === 'mutasi') {
        endpoint = '/api/qris/mutasi';
        payload = { auth_username: this.f.username, auth_token: this.f.token };
      } else if (this.selected === 'mutasi-detail') {
        endpoint = '/api/qris/mutasi-detail';
        payload = {
          auth_username: this.f.username, auth_token: this.f.token,
          page: this.f.page || '1', start_date: this.f.start_date,
          end_date: this.f.end_date, keterangan: this.f.keterangan, jumlah: this.f.jumlah
        };
      } else if (this.selected === 'balance') {
        endpoint = '/api/qris/balance';
        payload = { auth_username: this.f.username, auth_token: this.f.token };
      } else if (this.selected === 'dynamic') {
        endpoint = '/api/qris/dynamic';
        payload = { base_string: this.f.base_string, amount: this.f.amount };
      } else if (this.selected === 'pay-create') {
        endpoint = '/api/pay/create';
        payload = { base_amount: this.f.amount, id: this.f.id || undefined };
      } else if (this.selected === 'pay-status') {
        endpoint = '/api/pay/status/' + this.f.id;
        payload = null;
      } else if (this.selected === 'pay-scan') {
        endpoint = '/api/pay/scan';
        payload = {};
      }

      const isPay = this.selected.startsWith('pay-');

      try {
        const isGet = this.selected === 'pay-status';
        const headers = isPay
          ? this.payHeaders()
          : { 'Content-Type': 'application/json', 'X-API-Key': this.cred.apiKey };
        const res = await fetch(endpoint, {
          method: isGet ? 'GET' : 'POST',
          headers,
          body: payload ? JSON.stringify(payload) : undefined
        });
        const data = await res.json();
        this.status = res.status === 200 ? 'SUCCESS (' + res.status + ')' : 'ERROR (' + res.status + ')';
        this.statusClass = res.status === 200 ? 'text-emerald-400' : 'text-red-400';
        this.response = JSON.stringify(data, null, 2);

        // Render QR kalau ada dynamic_string
        if (data?.data?.qris_string) {
          this.qrString = data.data.qris_string;
          this.invAmount = data.data.amount;
          this.invId = data.data.id;
          this.$nextTick(() => {
            const el = document.getElementById('qrconsole');
            if (el) { el.innerHTML = ''; new QRCode(el, { text: data.data.qris_string, width: 140, height: 140 }); }
          });
        }
      } catch (err) {
        this.status = 'CONNECTION FAILED';
        this.statusClass = 'text-red-400';
        this.response = err.toString();
      } finally {
        this.loading = false;
      }
    },

    // --- Demo functions ---
    async demoCreate() {
      this.demoLoading = true;
      this.demoError = '';
      this.demoInvoice = null;
      this.demoScanResult = null;
      try {
        const res = await fetch('/api/pay/create', {
          method: 'POST',
          headers: this.payHeaders(),
          body: JSON.stringify({ base_amount: this.demoAmount, id: this.demoId || undefined })
        });
        const data = await res.json();
        if (!data.status) throw new Error(data.message);
        this.demoInvoice = data.data;
        this.$nextTick(() => {
          const el = document.getElementById('demo-qr');
          if (el && data.data.qris_string) { el.innerHTML = ''; new QRCode(el, { text: data.data.qris_string, width: 160, height: 160 }); }
        });
      } catch (e) {
        this.demoError = e.message;
      } finally {
        this.demoLoading = false;
      }
    },

    async demoPoll() {
      if (!this.demoInvoice) return;
      this.demoPolling = true;
      this.demoScanResult = null;
      try {
        const res = await fetch('/api/pay/status/' + this.demoInvoice.id, { headers: this.payHeaders() });
        const data = await res.json();
        if (data.data) {
          this.demoInvoice.status = data.data.status;
          if (data.data.scan) this.demoScanResult = data.data.scan;
        }
      } catch (e) {
        this.demoError = e.message;
      } finally {
        this.demoPolling = false;
      }
    },

    demoReset() {
      this.demoInvoice = null;
      this.demoScanResult = null;
      this.demoError = '';
    }
  }
}
</script>
</body>
</html>`;
}
