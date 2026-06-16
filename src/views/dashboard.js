// src/views/dashboard.js
const settings = require("../config/settings");

module.exports = () => `
<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${settings.app.name} - API Gateway</title>

    <script src="https://cdn.tailwindcss.com"></script>
    <script defer src="https://cdn.jsdelivr.net/npm/alpinejs@3.x.x/dist/cdn.min.js"></script>

    <script>
      tailwind.config = {
        theme: {
          extend: {
            fontFamily: {
                sans: ['system-ui', 'sans-serif'],
                mono: ['ui-monospace', 'monospace']
            },
            colors: {
                taveve: {
                    400: '#ffb84d',
                    500: '#F5A623',
                    600: '#e68a00',
                    800: '#9e5b00',
                    950: '#2d1a00'
                }
            }
          }
        }
      }
    </script>
    <style>
       body {
           background-color: #000;
           color: #e2e8f0;
       }
       .card {
           background: #0d0d0d;
           border: 1px solid #222;
       }
       .input-field {
           background: #000;
           border: 1px solid #2a2a2a;
           color: #fff;
       }
       .input-field:focus {
           border-color: #F5A623;
           outline: none;
       }
       ::-webkit-scrollbar { width: 6px; height: 6px; }
       ::-webkit-scrollbar-track { background: transparent; }
       ::-webkit-scrollbar-thumb { background: #333; border-radius: 3px; }
       pre { white-space: pre-wrap; word-wrap: break-word; }
    </style>
</head>
<body class="min-h-screen p-4 md:p-8 flex flex-col items-center">

    <header class="w-full max-w-5xl mb-8 flex flex-col md:flex-row items-center justify-between gap-4">
        <div class="flex items-center gap-4">
            <div class="h-12 w-12 bg-taveve-950 rounded border border-taveve-800 flex items-center justify-center">
                <span class="text-xl font-bold text-taveve-400">T</span>
            </div>
            <div>
                <h1 class="text-2xl font-bold text-white">${settings.app.name}</h1>
                <div class="flex items-center gap-2 mt-0.5">
                    <span class="px-2 py-0.5 rounded text-[10px] font-bold bg-taveve-950 text-taveve-400 border border-taveve-800">v${settings.app.version}</span>
                    <span class="text-xs text-slate-500 font-mono">API Gateway</span>
                </div>
            </div>
        </div>

    </header>

    <main class="w-full max-w-5xl" x-data="appLogic()">

        <div class="flex gap-4 mb-6 border-b border-slate-800">
            <button @click="activeTab = 'console'"
                :class="activeTab === 'console' ? 'text-taveve-400 border-taveve-500' : 'text-slate-500 border-transparent'"
                class="pb-3 px-1 text-sm font-bold uppercase tracking-widest border-b-2">
                Console
            </button>
            <button @click="activeTab = 'docs'"
                :class="activeTab === 'docs' ? 'text-taveve-400 border-taveve-500' : 'text-slate-500 border-transparent'"
                class="pb-3 px-1 text-sm font-bold uppercase tracking-widest border-b-2">
                Docs
            </button>
        </div>

        <div x-show="activeTab === 'console'" class="grid grid-cols-1 lg:grid-cols-12 gap-6">

            <div class="lg:col-span-4">
                <div class="card rounded-xl p-5">
                    <h2 class="text-xs font-bold text-slate-400 uppercase tracking-widest mb-5">Request Config</h2>

                    <form @submit.prevent="sendRequest" class="space-y-4">
                        <div>
                            <label class="block text-[10px] font-bold text-taveve-400 uppercase mb-1">Target Endpoint</label>
                            <select x-model="selectedFeature" @change="resetForm()" class="input-field w-full rounded p-2.5 text-sm cursor-pointer">
                                <option value="login">Login (Request OTP)</option>
                                <option value="verify">Verify OTP (Get Token)</option>
                                <option value="mutasi">Cek Mutasi QRIS</option>
                                <option value="mutasi-detail">Cek Mutasi Detail</option>
                                <option value="balance">Cek Saldo</option>
                                <option value="decode">Decode QRIS dari Foto</option>
                                <option value="dynamic">Buat Dynamic QRIS</option>
                            </select>
                        </div>

                        <div class="space-y-3">
                            <template x-if="['login', 'verify', 'mutasi', 'mutasi-detail', 'balance'].includes(selectedFeature)">
                                <div>
                                    <label class="block text-[10px] font-bold text-slate-500 uppercase mb-1">Username / AuthToken</label>
                                    <input type="text" x-model="form.username" placeholder="adminganteng" class="input-field w-full rounded p-2.5 text-sm font-mono">
                                </div>
                            </template>

                            <template x-if="selectedFeature === 'login'">
                                <div>
                                    <label class="block text-[10px] font-bold text-slate-500 uppercase mb-1">Password</label>
                                    <input type="password" x-model="form.password" class="input-field w-full rounded p-2.5 text-sm font-mono">
                                </div>
                            </template>

                            <template x-if="selectedFeature === 'verify'">
                                <div>
                                    <label class="block text-[10px] font-bold text-slate-500 uppercase mb-1">Kode OTP</label>
                                    <input type="text" x-model="form.otp" placeholder="123456" class="input-field w-full rounded p-2.5 text-lg font-mono text-center tracking-[0.3em] font-bold text-taveve-400">
                                </div>
                            </template>

                            <template x-if="['mutasi', 'mutasi-detail', 'balance'].includes(selectedFeature)">
                                <div>
                                    <label class="block text-[10px] font-bold text-slate-500 uppercase mb-1">Auth Token</label>
                                    <input type="text" x-model="form.token" placeholder="ey..." class="input-field w-full rounded p-2.5 text-xs font-mono">
                                </div>
                            </template>

</template>
                            </template>

                            <template x-if="selectedFeature === 'mutasi-detail'">
                                <div class="space-y-3">
                                    <div>
                                        <label class="block text-[10px] font-bold text-slate-500 uppercase mb-1">Page</label>
                                        <input type="number" x-model="form.page" value="1" class="input-field w-full rounded p-2.5 text-sm font-mono">
                                    </div>
                                    <div>
                                        <label class="block text-[10px] font-bold text-slate-500 uppercase mb-1">Dari Tanggal</label>
                                        <input type="date" x-model="form.start_date" class="input-field w-full rounded p-2.5 text-sm font-mono">
                                    </div>
                                    <div>
                                        <label class="block text-[10px] font-bold text-slate-500 uppercase mb-1">Ke Tanggal</label>
                                        <input type="date" x-model="form.end_date" class="input-field w-full rounded p-2.5 text-sm font-mono">
                                    </div>
                                    <div>
                                        <label class="block text-[10px] font-bold text-slate-500 uppercase mb-1">Filter Keterangan</label>
                                        <input type="text" x-model="form.keterangan" placeholder="GOPAY, OVO, DANA..." class="input-field w-full rounded p-2.5 text-sm font-mono">
                                    </div>
                                    <div>
                                        <label class="block text-[10px] font-bold text-slate-500 uppercase mb-1">Filter Jumlah</label>
                                        <input type="text" x-model="form.jumlah" placeholder="10000" class="input-field w-full rounded p-2.5 text-sm font-mono">
                                    </div>
                                </div>
                            </template>

                            <template x-if="selectedFeature === 'dynamic'">
                                <div class="space-y-3">
                                    <div>
                                        <label class="block text-[10px] font-bold text-slate-500 uppercase mb-1">String QRIS Asli</label>
                                        <textarea x-model="form.base_string" rows="3" placeholder="000201..." class="input-field w-full rounded p-2.5 text-xs font-mono"></textarea>
                                    </div>
                                    <div>
                                        <label class="block text-[10px] font-bold text-slate-500 uppercase mb-1">Nominal (Rp)</label>
                                        <input type="number" x-model="form.amount" class="input-field w-full rounded p-2.5 text-sm font-mono">
                                    </div>
                                </div>
                            </template>

                            <template x-if="selectedFeature === 'decode'">
                                <div class="space-y-3">
                                    <div>
                                        <label class="block text-[10px] font-bold text-slate-500 uppercase mb-1">Upload Foto QRIS</label>
                                        <input type="file" @change="handleFileSelect" accept="image/*" class="input-field w-full rounded p-2.5 text-sm cursor-pointer">
                                        <p class="text-xs text-slate-500 mt-1">Format: JPG, PNG (max 5MB)</p>
                                    </div>
                                    <div x-show="imagePreview" class="border border-slate-700 rounded p-2">
                                        <img :src="imagePreview" class="max-h-36 mx-auto rounded" alt="Preview">
                                    </div>
                                </div>
                            </template>
                        </div>

                        <button type="submit" :disabled="loading"
                            class="w-full py-3 rounded font-bold text-sm uppercase tracking-wider"
                            :class="loading ? 'bg-slate-800 text-slate-500 cursor-not-allowed' : 'bg-taveve-600 hover:bg-taveve-500 text-white'">
                            <span x-show="!loading">Execute Request</span>
                            <span x-show="loading">Processing...</span>
                        </button>
                    </form>
                </div>
            </div>

            <div class="lg:col-span-8">
                <div class="card rounded-xl h-[580px] flex flex-col overflow-hidden border-t-2 border-t-taveve-500">
                    <div class="bg-black border-b border-slate-800 p-3 flex justify-between items-center px-5">
                        <div class="flex gap-1.5">
                            <div class="w-2.5 h-2.5 rounded-full bg-red-500"></div>
                            <div class="w-2.5 h-2.5 rounded-full bg-yellow-500"></div>
                            <div class="w-2.5 h-2.5 rounded-full bg-green-500"></div>
                        </div>
                        <span class="font-mono text-xs text-slate-500" x-text="status"></span>
                    </div>

                    <div class="flex-1 bg-black p-5 overflow-auto font-mono text-xs relative">
                        <div x-show="!response && !loading" class="absolute inset-0 flex flex-col items-center justify-center text-slate-700">
                            <p class="font-bold tracking-widest">AWAITING INPUT</p>
                        </div>
                        <div x-show="loading" class="absolute inset-0 flex items-center justify-center bg-black/80 z-20">
                            <span class="text-taveve-400 font-mono text-sm">Processing...</span>
                        </div>
                        <template x-if="qrImage">
                            <div class="mb-6 flex gap-5 items-center p-5 bg-slate-900/50 rounded border border-slate-800">
                                <div class="bg-white p-2 rounded">
                                    <img :src="qrImage" class="w-32 h-32 md:w-40 md:h-40">
                                </div>
                                <div>
                                    <h3 class="text-white font-bold text-base mb-1">QR Generated!</h3>
                                    <p class="text-slate-400 mb-3 text-xs">Scan using any payment app.</p>
                                    <a :href="qrImage" download="qris_dynamic.png" class="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-white rounded text-xs font-bold border border-slate-600">Download .PNG</a>
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

        <div x-show="activeTab === 'docs'" class="space-y-6 pb-16">

            <div class="card p-6 rounded-xl border-t-2 border-t-taveve-500">
                <h2 class="text-xl font-bold text-white mb-2">Dokumentasi & Panduan</h2>
                <p class="text-slate-400 text-sm leading-relaxed">
                    Panduan lengkap integrasi API. Gunakan Method <span class="text-taveve-400 font-mono font-bold">POST</span> dan format Body <span class="text-taveve-400 font-mono font-bold">JSON</span>. Pastikan Anda memiliki akun OrderKuota yang aktif sebelum memulai.
                </p>
            </div>

            <div class="space-y-6">

                <div class="space-y-3">
                    <h3 class="text-base font-bold text-taveve-400 flex items-center gap-2">
                        <span class="px-2 py-0.5 bg-taveve-950 rounded border border-taveve-800 text-xs">MODULE 01</span> Authentication
                    </h3>

                    <div class="card p-5 rounded-xl border-l-2 border-l-slate-700">
                        <div class="flex flex-col md:flex-row md:items-start justify-between mb-4 gap-2">
                            <div>
                                <h4 class="font-bold text-white">1. Request OTP (Login)</h4>
                                <p class="text-slate-400 text-sm mt-1">Langkah pertama. Gunakan endpoint ini untuk memicu pengiriman kode OTP ke Email terdaftar.</p>
                            </div>
                            <code class="text-xs bg-black px-3 py-1.5 rounded border border-slate-800 text-taveve-400 font-mono whitespace-nowrap">POST /api/auth/login</code>
                        </div>

                        <div class="grid md:grid-cols-2 gap-5">
                            <div>
                                <h5 class="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Parameters</h5>
                                <ul class="text-sm text-slate-300 space-y-1.5">
                                    <li class="flex gap-2"><span class="text-taveve-400 font-mono bg-taveve-950/30 px-1 rounded">username</span> Username terdaftar.</li>
                                    <li class="flex gap-2"><span class="text-taveve-400 font-mono bg-taveve-950/30 px-1 rounded">password</span> Kata sandi akun OrderKuota.</li>
                                </ul>
                            </div>
                            <div>
                                <h5 class="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Response Example</h5>
                                <pre class="bg-black p-3 rounded text-xs text-green-400 border border-slate-800 overflow-x-auto">
{
  "status": true,
  "message": "Success",
  "data": {
    "success": true,
    "results": {
      "otp": "email",
      "otp_value": "user************mail.com"
    }
  }
}</pre>
                            </div>
                        </div>
                    </div>

                    <div class="card p-5 rounded-xl border-l-2 border-l-slate-700">
                        <div class="flex flex-col md:flex-row md:items-start justify-between mb-4 gap-2">
                            <div>
                                <h4 class="font-bold text-white">2. Verify OTP (Get Token)</h4>
                                <p class="text-slate-400 text-sm mt-1">Tukar kode OTP yang diterima di Email menjadi <b>Auth Token</b>. Token ini wajib disimpan untuk akses API lainnya.</p>
                            </div>
                            <code class="text-xs bg-black px-3 py-1.5 rounded border border-slate-800 text-taveve-400 font-mono whitespace-nowrap">POST /api/auth/verify</code>
                        </div>

                        <div class="grid md:grid-cols-2 gap-5">
                            <div>
                                <h5 class="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Parameters</h5>
                                <ul class="text-sm text-slate-300 space-y-1.5">
                                    <li class="flex gap-2"><span class="text-taveve-400 font-mono bg-taveve-950/30 px-1 rounded">username</span> username yang sama.</li>
                                    <li class="flex gap-2"><span class="text-taveve-400 font-mono bg-taveve-950/30 px-1 rounded">otp</span> Kode 6 digit dari Email.</li>
                                </ul>
                            </div>
                            <div>
                                <h5 class="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Response Example</h5>
                                <pre class="bg-black p-3 rounded text-xs text-green-400 border border-slate-800 overflow-x-auto">
{
  "status": true,
  "message": "Success",
  "data": {
    "success": true,
    "results": {
      "otp": "",
      "id": "123456",
      "name": "demouser",
      "username": "demouser",
      "balance": "500000",
      "token": "123456:aBcDeFgHiJkLmNoPqRsTuVwXyZ1234567890"
    }
  }
}</pre>
                            </div>
                        </div>
                    </div>
                </div>

                <div class="space-y-3">
                    <h3 class="text-base font-bold text-taveve-400 flex items-center gap-2">
                        <span class="px-2 py-0.5 bg-taveve-950 rounded border border-taveve-800 text-xs">MODULE 02</span> QRIS Payment
                    </h3>

                    <div class="card p-5 rounded-xl border-l-2 border-l-slate-700">
                        <div class="flex flex-col md:flex-row md:items-start justify-between mb-4 gap-2">
                            <div>
                                <h4 class="font-bold text-white">3. Cek Mutasi QRIS</h4>
                                <p class="text-slate-400 text-sm mt-1">Mengambil 4 transaksi QRIS terakhir yang masuk (Status: IN). Berguna untuk verifikasi pembayaran otomatis.</p>
                            </div>
                            <code class="text-xs bg-black px-3 py-1.5 rounded border border-slate-800 text-taveve-400 font-mono whitespace-nowrap">POST /api/qris/mutasi</code>
                        </div>

                        <div class="grid md:grid-cols-2 gap-5">
                            <div>
                                <h5 class="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Parameters</h5>
                                <ul class="text-sm text-slate-300 space-y-1.5">
                                    <li class="flex gap-2"><span class="text-taveve-400 font-mono bg-taveve-950/30 px-1 rounded">auth_username</span> Username Login.</li>
                                    <li class="flex gap-2"><span class="text-taveve-400 font-mono bg-taveve-950/30 px-1 rounded">auth_token</span> Token dari hasil Verify OTP.</li>
                                </ul>
                            </div>
                            <div>
                                <h5 class="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Response Example</h5>
                                <pre class="bg-black p-3 rounded text-xs text-green-400 border border-slate-800 overflow-x-auto">
{
  "status": true,
  "data": {
    "qris_history": {
      "total": 50,
      "page": 1,
      "results": [
        {
          "id": 123456789,
          "kredit": "10.000",
          "saldo_akhir": "100.000",
          "keterangan": "NOBU / JOHN DOE",
          "tanggal": "24/01/2026 18:23",
          "status": "IN",
          "brand": { "name": "GoPay" }
        }
      ]
    },
    "account": {
      "username": "demouser",
      "balance": 500000,
      "qris_balance": 100000,
      "qris_name": "TOKO DEMO"
    }
  }
}</pre>
                            </div>
                        </div>
                    </div>

                    <div class="card p-5 rounded-xl border-l-2 border-l-slate-700">
                        <div class="flex flex-col md:flex-row md:items-start justify-between mb-4 gap-2">
                            <div>
                                <h4 class="font-bold text-white">4. Cek Mutasi Detail</h4>
                                <p class="text-slate-400 text-sm mt-1">Mengambil semua transaksi dengan filter lengkap: tanggal, keterangan, jumlah, dan pagination.</p>
                            </div>
                            <code class="text-xs bg-black px-3 py-1.5 rounded border border-slate-800 text-taveve-400 font-mono whitespace-nowrap">POST /api/qris/mutasi-detail</code>
                        </div>

                        <div class="grid md:grid-cols-2 gap-5">
                            <div>
                                <h5 class="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Parameters</h5>
                                <ul class="text-sm text-slate-300 space-y-1.5">
                                    <li class="flex gap-2"><span class="text-taveve-400 font-mono bg-taveve-950/30 px-1 rounded">auth_username</span> Username Login.</li>
                                    <li class="flex gap-2"><span class="text-taveve-400 font-mono bg-taveve-950/30 px-1 rounded">auth_token</span> Token dari hasil Verify OTP.</li>
                                    <li class="flex gap-2"><span class="text-taveve-400 font-mono bg-taveve-950/30 px-1 rounded">page</span> Halaman (default: 1).</li>
                                    <li class="flex gap-2"><span class="text-taveve-400 font-mono bg-taveve-950/30 px-1 rounded">start_date</span> Filter dari tanggal (YYYY-MM-DD).</li>
                                    <li class="flex gap-2"><span class="text-taveve-400 font-mono bg-taveve-950/30 px-1 rounded">end_date</span> Filter sampai tanggal (YYYY-MM-DD).</li>
                                    <li class="flex gap-2"><span class="text-taveve-400 font-mono bg-taveve-950/30 px-1 rounded">keterangan</span> Filter source (GOPAY, OVO, DANA).</li>
                                    <li class="flex gap-2"><span class="text-taveve-400 font-mono bg-taveve-950/30 px-1 rounded">jumlah</span> Filter nominal.</li>
                                </ul>
                            </div>
                            <div>
                                <h5 class="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Response Example</h5>
                                <pre class="bg-black p-3 rounded text-xs text-green-400 border border-slate-800 overflow-x-auto">
{
  "status": true,
  "data": {
    "success": true,
    "total": 20,
    "all_in": [...],
    "all_out": [...],
    "results": [...],
    "pagination": {
      "current_page": "1",
      "has_more": true
    }
  }
}</pre>
                            </div>
                        </div>
                    </div>

                    <div class="card p-5 rounded-xl border-l-2 border-l-slate-700">
                        <div class="flex flex-col md:flex-row md:items-start justify-between mb-4 gap-2">
                            <div>
                                <h4 class="font-bold text-white">5. Cek Saldo</h4>
                                <p class="text-slate-400 text-sm mt-1">Melihat saldo utama dan saldo QRIS dari akun OrderKuota.</p>
                            </div>
                            <code class="text-xs bg-black px-3 py-1.5 rounded border border-slate-800 text-taveve-400 font-mono whitespace-nowrap">POST /api/qris/balance</code>
                        </div>

                        <div class="grid md:grid-cols-2 gap-5">
                            <div>
                                <h5 class="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Parameters</h5>
                                <ul class="text-sm text-slate-300 space-y-1.5">
                                    <li class="flex gap-2"><span class="text-taveve-400 font-mono bg-taveve-950/30 px-1 rounded">auth_username</span> Username Login.</li>
                                    <li class="flex gap-2"><span class="text-taveve-400 font-mono bg-taveve-950/30 px-1 rounded">auth_token</span> Token dari hasil Verify OTP.</li>
                                </ul>
                            </div>
                            <div>
                                <h5 class="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Response Example</h5>
                                <pre class="bg-black p-3 rounded text-xs text-green-400 border border-slate-800 overflow-x-auto">
{
  "status": true,
  "data": {
    "success": true,
    "balance": 500000,
    "qris_balance": 100000,
    "name": "Nama Toko",
    "username": "demouser"
  }
}</pre>
                            </div>
                        </div>
                    </div>

                    <div class="card p-5 rounded-xl border-l-2 border-l-slate-700">
                        <div class="flex flex-col md:flex-row md:items-start justify-between mb-4 gap-2">
                            <div>
                                <h4 class="font-bold text-white">7. Decode QRIS dari Foto</h4>
                                <p class="text-slate-400 text-sm mt-1">Upload foto QRIS untuk mendapatkan raw string-nya. Berguna untuk convert static QRIS fisik ke digital.</p>
                            </div>
                            <code class="text-xs bg-black px-3 py-1.5 rounded border border-slate-800 text-taveve-400 font-mono whitespace-nowrap">POST /api/qris/decode</code>
                        </div>

                        <div class="grid md:grid-cols-2 gap-5">
                            <div>
                                <h5 class="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Parameters</h5>
                                <ul class="text-sm text-slate-300 space-y-1.5">
                                    <li class="flex flex-col">
                                        <span class="text-taveve-400 font-mono bg-taveve-950/30 w-fit px-1 rounded mb-1">image</span>
                                        <span class="text-xs text-slate-500">File gambar QRIS (JPG/PNG, max 5MB). Gunakan multipart/form-data.</span>
                                    </li>
                                </ul>
                            </div>
                            <div>
                                <h5 class="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Response Example</h5>
                                <pre class="bg-black p-3 rounded text-xs text-green-400 border border-slate-800 overflow-x-auto">
{
  "status": true,
  "message": "Success",
  "data": {
    "qris_string": "00020101021126...",
    "filename": "qris.jpg",
    "size": 245678
  }
}</pre>
                            </div>
                        </div>
                    </div>

                    <div class="card p-5 rounded-xl border-l-2 border-l-slate-700">
                        <div class="flex flex-col md:flex-row md:items-start justify-between mb-4 gap-2">
                            <div>
                                <h4 class="font-bold text-white">8. Generate Dynamic QRIS</h4>
                                <p class="text-slate-400 text-sm mt-1">Membuat kode QRIS baru dengan nominal yang sudah tertanam (Static to Dynamic). Output berupa base64 image.</p>
                            </div>
                            <code class="text-xs bg-black px-3 py-1.5 rounded border border-slate-800 text-taveve-400 font-mono whitespace-nowrap">POST /api/qris/decode</code>
                        </div>

                        <div class="grid md:grid-cols-2 gap-5">
                            <div>
                                <h5 class="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Parameters</h5>
                                <ul class="text-sm text-slate-300 space-y-1.5">
                                    <li class="flex flex-col mb-2">
                                        <span class="text-taveve-400 font-mono bg-taveve-950/30 w-fit px-1 rounded mb-1">base_string</span>
                                        <span class="text-xs text-slate-500">String text dari QRIS Toko Asli Anda (bisa didapat dari scan QRIS toko pakai aplikasi scanner).</span>
                                    </li>
                                    <li class="flex gap-2"><span class="text-taveve-400 font-mono bg-taveve-950/30 px-1 rounded">amount</span> Nominal Rupiah (Int).</li>
                                </ul>
                            </div>
                            <div>
                                <h5 class="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Response Example</h5>
                                <pre class="bg-black p-3 rounded text-xs text-green-400 border border-slate-800 overflow-x-auto">
{
  "status": true,
  "message": "Success",
  "data": {
    "original_string": "00020101021126...",
    "amount": 50000,
    "dynamic_string": "00020101021226...",
    "qr_image": "data:image/png;base64,iVBORw0KG..."
  }
}</pre>
                            </div>
                        </div>
                    </div>

                </div>

            </div>
        </div>

    </main>

    <footer class="mt-8 mb-4 text-center text-xs text-slate-400 font-mono">
        <p>Built by <span class="text-taveve-400 font-bold">${settings.app.maintainer}</span> &copy; ${new Date().getFullYear()} ${settings.app.name}. All rights reserved.</p>
    </footer>

    <script>
        function appLogic() {
            return {
                activeTab: 'console',
                selectedFeature: 'login',
                loading: false,
                status: 'READY',
                response: '',
                qrImage: null,
                imagePreview: null,
                selectedFile: null,
                form: {
                    username: '', password: '', otp: '',
                    token: '', base_string: '', amount: '',
                    page: '1', start_date: '', end_date: '',
                    keterangan: '', jumlah: ''
                },
                resetForm() {
                    this.response = '';
                    this.qrImage = null;
                    this.imagePreview = null;
                    this.selectedFile = null;
                    this.status = 'READY';
                },
                handleFileSelect(event) {
                    const file = event.target.files[0];
                    if (file) {
                        this.selectedFile = file;
                        const reader = new FileReader();
                        reader.onload = (e) => {
                            this.imagePreview = e.target.result;
                        };
                        reader.readAsDataURL(file);
                    }
                },
                async sendRequest() {
                    this.loading = true;
                    this.response = '';
                    this.qrImage = null;
                    this.status = 'TRANSMITTING...';

                    let endpoint = '';
                    let payload = {};

                    if (this.selectedFeature === 'login') {
                        endpoint = '/api/auth/login';
                        payload = { username: this.form.username, password: this.form.password };
                    } else if (this.selectedFeature === 'verify') {
                        endpoint = '/api/auth/verify';
                        payload = { username: this.form.username, otp: this.form.otp };
                    } else if (this.selectedFeature === 'mutasi') {
                        endpoint = '/api/qris/mutasi';
                        payload = { auth_username: this.form.username, auth_token: this.form.token };
                    } else if (this.selectedFeature === 'mutasi-detail') {
                        endpoint = '/api/qris/mutasi-detail';
                        payload = {
                            auth_username: this.form.username,
                            auth_token: this.form.token,
                            page: this.form.page || '1',
                            start_date: this.form.start_date,
                            end_date: this.form.end_date,
                            keterangan: this.form.keterangan,
                            jumlah: this.form.jumlah
                        };
                    } else if (this.selectedFeature === 'balance') {
                        endpoint = '/api/qris/balance';
                        payload = { auth_username: this.form.username, auth_token: this.form.token };
                    } else if (this.selectedFeature === 'dynamic') {
                        endpoint = '/api/qris/dynamic';
                        payload = { base_string: this.form.base_string, amount: this.form.amount };
                    } else if (this.selectedFeature === 'decode') {
                        endpoint = '/api/qris/decode';
                    }

                    try {
                        let res, data;

                        if (this.selectedFeature === 'decode') {
                            if (!this.selectedFile) {
                                throw new Error('Please select an image file');
                            }
                            const formData = new FormData();
                            formData.append('image', this.selectedFile);

                            res = await fetch(endpoint, {
                                method: 'POST',
                                body: formData
                            });
                        } else {
                            res = await fetch(endpoint, {
                                method: 'POST',
                                headers: { 'Content-Type': 'application/json' },
                                body: JSON.stringify(payload)
                            });
                        }

                        data = await res.json();

                        this.status = res.status === 200 ? 'SUCCESS (200)' : 'ERROR (' + res.status + ')';
                        this.response = JSON.stringify(data, null, 2);

                        if (data.data && data.data.qr_image) {
                            this.qrImage = data.data.qr_image;
                        }

                    } catch (err) {
                        this.status = 'CONNECTION FAILED';
                        this.response = err.toString();
                    } finally {
                        this.loading = false;
                    }
                }
            }
        }
    </script>
</body>
</html>
`;
