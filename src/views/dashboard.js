// src/views/dashboard.js
const settings = require("../config/settings");

module.exports = () => `
<!DOCTYPE html>
<html lang="id" class="dark">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${settings.app.name} - Nexus Gateway</title>
    
    <script src="https://cdn.tailwindcss.com"></script>
    <script defer src="https://cdn.jsdelivr.net/npm/alpinejs@3.x.x/dist/cdn.min.js"></script>
    <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;700&family=JetBrains+Mono:wght@400;700&display=swap" rel="stylesheet">
    
    <script>
      tailwind.config = {
        darkMode: 'class',
        theme: {
          extend: {
            fontFamily: { 
                sans: ['Outfit', 'sans-serif'],
                mono: ['JetBrains Mono', 'monospace'] 
            },
            colors: { 
                nexus: { 
                    bg: '#020617', 
                    card: '#0f172a',
                    cyan: '#06b6d4',
                    purple: '#8b5cf6'
                } 
            },
            animation: {
                'pulse-glow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
            }
          }
        }
      }
    </script>
    <style>
       /* --- OPTIMIZED CYBERPUNK THEME (Ringan & Smooth) --- */
       body { 
           background-color: #020617;
           background-image: 
                linear-gradient(rgba(6, 182, 212, 0.03) 1px, transparent 1px),
                linear-gradient(90deg, rgba(6, 182, 212, 0.03) 1px, transparent 1px);
           background-size: 40px 40px;
           background-attachment: fixed; /* Kunci Scroll biar Ringan */
           color: #e2e8f0;
       }
       .glass { 
           background: rgba(15, 23, 42, 0.8); 
           backdrop-filter: blur(5px);
           -webkit-backdrop-filter: blur(5px);
           border: 1px solid rgba(6, 182, 212, 0.1);
           box-shadow: 0 4px 20px 0 rgba(0, 0, 0, 0.2);
       }
       .input-tech {
           background: rgba(2, 6, 23, 0.6);
           border: 1px solid rgba(255,255,255,0.1);
           color: #fff;
           transition: all 0.3s ease;
       }
       .input-tech:focus {
           border-color: #06b6d4;
           box-shadow: 0 0 10px rgba(6, 182, 212, 0.2);
           outline: none;
       }
       ::-webkit-scrollbar { width: 6px; height: 6px; }
       ::-webkit-scrollbar-track { background: transparent; }
       ::-webkit-scrollbar-thumb { background: #334155; border-radius: 3px; }
       ::-webkit-scrollbar-thumb:hover { background: #06b6d4; }
       pre { white-space: pre-wrap; word-wrap: break-word; }
    </style>
</head>
<body class="antialiased min-h-screen p-4 md:p-8 flex flex-col items-center selection:bg-cyan-500/30 selection:text-cyan-200">

    <header class="w-full max-w-6xl mb-10 flex flex-col md:flex-row items-center justify-between gap-6 relative z-10">
        <div class="flex items-center gap-5">
            <div class="relative group">
                <div class="absolute -inset-1 bg-gradient-to-r from-cyan-600 to-purple-600 rounded-lg blur opacity-40 group-hover:opacity-75 transition duration-200"></div>
                <div class="relative h-14 w-14 bg-slate-900 rounded-lg flex items-center justify-center border border-slate-700">
                    <span class="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 to-purple-400">N</span>
                </div>
            </div>
            <div>
                <h1 class="text-3xl font-bold text-white tracking-tight">${settings.app.name}</h1>
                <div class="flex items-center gap-2 mt-1">
                    <span class="px-2 py-0.5 rounded text-[10px] font-bold bg-cyan-950 text-cyan-400 border border-cyan-900">CORE v${settings.app.version}</span>
                    <span class="text-xs text-slate-500 font-mono">Serverless</span>
                </div>
            </div>
        </div>
        
        <div class="glass px-5 py-2 rounded-full flex items-center gap-3">
            <span class="relative flex h-3 w-3">
              <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
              <span class="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
            </span>
            <span class="text-xs font-mono font-bold text-green-400 tracking-wider">SYSTEM ONLINE</span>
        </div>
    </header>

    <main class="w-full max-w-6xl relative z-10" x-data="appLogic()">
        
        <div class="flex gap-6 mb-8 border-b border-slate-800">
            <button @click="activeTab = 'console'" 
                :class="activeTab === 'console' ? 'text-cyan-400 border-cyan-400' : 'text-slate-500 border-transparent hover:text-slate-300'"
                class="pb-3 px-1 text-sm font-bold uppercase tracking-widest border-b-2 transition-all duration-300 flex items-center gap-2">
                <span>⚡ Console</span>
            </button>
            <button @click="activeTab = 'docs'" 
                :class="activeTab === 'docs' ? 'text-purple-400 border-purple-400' : 'text-slate-500 border-transparent hover:text-slate-300'"
                class="pb-3 px-1 text-sm font-bold uppercase tracking-widest border-b-2 transition-all duration-300 flex items-center gap-2">
                <span>📚 Docs</span>
            </button>
        </div>

        <div x-show="activeTab === 'console'" x-transition.opacity.duration.300ms class="grid grid-cols-1 lg:grid-cols-12 gap-8">
            
            <div class="lg:col-span-4">
                <div class="glass rounded-2xl p-1">
                    <div class="bg-slate-900/50 rounded-xl p-6">
                        <h2 class="text-xs font-bold text-slate-400 uppercase tracking-widest mb-6 flex items-center gap-2">
                            <span class="w-2 h-2 bg-cyan-500 rounded-full"></span> Request Config
                        </h2>
                        
                        <form @submit.prevent="sendRequest" class="space-y-5">
                            <div class="relative group">
                                <label class="block text-[10px] font-bold text-cyan-500 uppercase mb-1.5">Target Endpoint</label>
                                <select x-model="selectedFeature" @change="resetForm()" class="input-tech w-full rounded-lg p-3 text-sm cursor-pointer appearance-none">
                                    <option value="login">🔐 Login (Request OTP)</option>
                                    <option value="verify">✅ Verify OTP (Get Token)</option>
                                    <option value="mutasi">💰 Cek Mutasi QRIS</option>
                                    <option value="dynamic">🔁 Buat Dynamic QRIS</option>
                                </select>
                                <div class="absolute right-4 top-[2.4rem] text-cyan-500 pointer-events-none text-xs">▼</div>
                            </div>

                            <div class="space-y-4" x-transition>
                                <template x-if="['login', 'verify', 'mutasi'].includes(selectedFeature)">
                                    <div>
                                        <label class="block text-[10px] font-bold text-slate-500 uppercase mb-1.5">Username / AuthToken</label>
                                        <input type="text" x-model="form.username" placeholder="adminganteng" class="input-tech w-full rounded-lg p-3 text-sm font-mono">
                                    </div>
                                </template>

                                <template x-if="selectedFeature === 'login'">
                                    <div>
                                        <label class="block text-[10px] font-bold text-slate-500 uppercase mb-1.5">Password</label>
                                        <input type="password" x-model="form.password" class="input-tech w-full rounded-lg p-3 text-sm font-mono">
                                    </div>
                                </template>

                                <template x-if="selectedFeature === 'verify'">
                                    <div>
                                        <label class="block text-[10px] font-bold text-slate-500 uppercase mb-1.5">Kode OTP</label>
                                        <input type="text" x-model="form.otp" placeholder="123456" class="input-tech w-full rounded-lg p-3 text-lg font-mono text-center tracking-[0.3em] font-bold text-cyan-400">
                                    </div>
                                </template>

                                <template x-if="selectedFeature === 'mutasi'">
                                    <div>
                                        <label class="block text-[10px] font-bold text-slate-500 uppercase mb-1.5">Auth Token</label>
                                        <input type="text" x-model="form.token" placeholder="ey..." class="input-tech w-full rounded-lg p-3 text-xs font-mono">
                                    </div>
                                </template>

                                <template x-if="selectedFeature === 'dynamic'">
                                    <div class="space-y-4">
                                        <div>
                                            <label class="block text-[10px] font-bold text-slate-500 uppercase mb-1.5">String QRIS Asli</label>
                                            <textarea x-model="form.base_string" rows="3" placeholder="000201..." class="input-tech w-full rounded-lg p-3 text-xs font-mono"></textarea>
                                        </div>
                                        <div>
                                            <label class="block text-[10px] font-bold text-slate-500 uppercase mb-1.5">Nominal (Rp)</label>
                                            <input type="number" x-model="form.amount" class="input-tech w-full rounded-lg p-3 text-sm font-mono">
                                        </div>
                                    </div>
                                </template>
                            </div>

                            <button type="submit" :disabled="loading" 
                                class="w-full py-3.5 rounded-lg font-bold text-sm uppercase tracking-wider transition-all relative overflow-hidden group"
                                :class="loading ? 'bg-slate-800 text-slate-500' : 'bg-cyan-600 hover:bg-cyan-500 text-white shadow-[0_0_20px_rgba(6,182,212,0.3)]'">
                                <span class="relative z-10 flex items-center justify-center gap-2">
                                    <span x-show="!loading">Execute Request</span>
                                    <span x-show="loading">Processing...</span>
                                </span>
                            </button>
                        </form>
                    </div>
                </div>
            </div>

            <div class="lg:col-span-8">
                <div class="glass rounded-2xl h-[600px] flex flex-col overflow-hidden border-t-4 border-t-cyan-500">
                    <div class="bg-[#050505] border-b border-slate-800 p-3 flex justify-between items-center px-6">
                        <div class="flex gap-2">
                            <div class="w-2.5 h-2.5 rounded-full bg-red-500"></div>
                            <div class="w-2.5 h-2.5 rounded-full bg-yellow-500"></div>
                            <div class="w-2.5 h-2.5 rounded-full bg-green-500"></div>
                        </div>
                        <span class="font-mono text-xs text-slate-500" x-text="status"></span>
                    </div>

                    <div class="flex-1 bg-[#050505] p-6 overflow-auto font-mono text-xs relative custom-scrollbar">
                        <div x-show="!response && !loading" class="absolute inset-0 flex flex-col items-center justify-center opacity-20">
                            <svg class="w-20 h-20 text-cyan-500 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M14 10l-2 1m0 0l-2-1m2 1v2.5M20 7l-2 1m2-1l-2-1m2 1v2.5M14 4l-2-1-2 1M4 7l2-1M4 7l2 1M4 7v2.5M12 21l-2-1m2 1l2-1m-2 1v-2.5M6 18l-2-1v-2.5M18 18l2-1v-2.5"></path></svg>
                            <p class="text-cyan-400 font-bold tracking-widest">AWAITING INPUT_</p>
                        </div>
                        <div x-show="loading" class="absolute inset-0 flex items-center justify-center bg-black/80 z-20 backdrop-blur-sm transition-all">
                            <div class="w-16 h-16 border-4 border-cyan-900 border-t-cyan-400 rounded-full animate-spin"></div>
                        </div>
                        <template x-if="qrImage">
                            <div class="mb-8 flex gap-6 items-center p-6 bg-slate-900/40 rounded-xl border border-dashed border-slate-700">
                                <div class="bg-white p-2 rounded-lg shadow-lg">
                                    <img :src="qrImage" class="w-32 h-32 md:w-40 md:h-40">
                                </div>
                                <div>
                                    <h3 class="text-white font-bold text-lg mb-1">QR Generated!</h3>
                                    <p class="text-slate-400 mb-4">Scan using any payment app.</p>
                                    <a :href="qrImage" download="qris_dynamic.png" class="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded text-xs font-bold border border-slate-600 transition">Download .PNG</a>
                                </div>
                            </div>
                        </template>
                        <div x-show="response" class="relative z-10">
                            <pre class="text-emerald-400 leading-relaxed" x-text="response"></pre>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <div x-show="activeTab === 'docs'" x-transition.opacity.duration.300ms class="space-y-8 pb-20">
            
            <div class="glass p-8 rounded-2xl text-center border-t-4 border-t-purple-500">
                <h2 class="text-2xl font-bold text-white mb-3">Dokumentasi & Panduan</h2>
                <p class="text-slate-400 max-w-2xl mx-auto text-sm leading-relaxed">
                    Panduan lengkap integrasi API. Gunakan Method <span class="text-cyan-400 font-mono font-bold">POST</span> dan format Body <span class="text-cyan-400 font-mono font-bold">JSON</span>. Pastikan Anda memiliki akun OrderKuota yang aktif sebelum memulai.
                </p>
            </div>

            <div class="grid grid-cols-1 gap-8">
                
                <div class="space-y-4">
                    <h3 class="text-lg font-bold text-cyan-400 flex items-center gap-2">
                        <span class="px-2 py-1 bg-cyan-900/50 rounded border border-cyan-800 text-xs">MODULE 01</span> Authentication
                    </h3>
                    
                    <div class="glass p-6 rounded-xl border-l-2 border-l-slate-600 hover:border-l-cyan-500 transition-colors">
                        <div class="flex flex-col md:flex-row md:items-center justify-between mb-4 gap-2">
                            <div>
                                <h4 class="font-bold text-white text-lg">1. Request OTP (Login)</h4>
                                <p class="text-slate-400 text-sm mt-1">Langkah pertama. Gunakan endpoint ini untuk memicu pengiriman kode OTP ke WhatsApp nomor terdaftar.</p>
                            </div>
                            <code class="text-xs bg-black px-3 py-2 rounded border border-slate-800 text-cyan-400 font-mono">POST /api/auth/login</code>
                        </div>
                        
                        <div class="grid md:grid-cols-2 gap-6 mt-6">
                            <div>
                                <h5 class="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Parameters</h5>
                                <ul class="text-sm text-slate-300 space-y-2">
                                    <li class="flex gap-2"><span class="text-cyan-400 font-mono bg-cyan-950/30 px-1 rounded">username</span> : Username terdaftar.</li>
                                    <li class="flex gap-2"><span class="text-cyan-400 font-mono bg-cyan-950/30 px-1 rounded">password</span> : Kata sandi akun OrderKuota.</li>
                                </ul>
                            </div>
                            <div>
                                <h5 class="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Example JSON</h5>
                                <pre class="bg-black/50 p-4 rounded-lg text-xs text-slate-300 border border-slate-800 overflow-x-auto">
{
  "username": "adminganteng",
  "password": "rahasia_banget"
}</pre>
                            </div>
                        </div>
                    </div>

                    <div class="glass p-6 rounded-xl border-l-2 border-l-slate-600 hover:border-l-cyan-500 transition-colors">
                        <div class="flex flex-col md:flex-row md:items-center justify-between mb-4 gap-2">
                            <div>
                                <h4 class="font-bold text-white text-lg">2. Verify OTP (Get Token)</h4>
                                <p class="text-slate-400 text-sm mt-1">Tukar kode OTP yang diterima di WhatsApp menjadi <b>Auth Token</b>. Token ini wajib disimpan untuk akses API lainnya.</p>
                            </div>
                            <code class="text-xs bg-black px-3 py-2 rounded border border-slate-800 text-cyan-400 font-mono">POST /api/auth/verify</code>
                        </div>
                        
                        <div class="grid md:grid-cols-2 gap-6 mt-6">
                            <div>
                                <h5 class="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Parameters</h5>
                                <ul class="text-sm text-slate-300 space-y-2">
                                    <li class="flex gap-2"><span class="text-cyan-400 font-mono bg-cyan-950/30 px-1 rounded">username</span> : username yang sama.</li>
                                    <li class="flex gap-2"><span class="text-cyan-400 font-mono bg-cyan-950/30 px-1 rounded">otp</span> : Kode 6 digit dari WhatsApp.</li>
                                </ul>
                            </div>
                            <div>
                                <h5 class="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Response Example</h5>
                                <pre class="bg-black/50 p-4 rounded-lg text-xs text-green-400 border border-slate-800 overflow-x-auto">
{
  "success": true,
  "data": { 
      "auth_token": "eyJhbGciOiJI...",
      "username": "admin..." 
  }
}</pre>
                            </div>
                        </div>
                    </div>
                </div>

                <div class="space-y-4">
                    <h3 class="text-lg font-bold text-purple-400 flex items-center gap-2">
                        <span class="px-2 py-1 bg-purple-900/50 rounded border border-purple-800 text-xs">MODULE 02</span> QRIS Payment
                    </h3>
                    
                    <div class="glass p-6 rounded-xl border-l-2 border-l-slate-600 hover:border-l-purple-500 transition-colors">
                        <div class="flex flex-col md:flex-row md:items-center justify-between mb-4 gap-2">
                            <div>
                                <h4 class="font-bold text-white text-lg">3. Cek Mutasi QRIS</h4>
                                <p class="text-slate-400 text-sm mt-1">Mengambil 4 transaksi QRIS terakhir yang masuk (Status: IN). Berguna untuk verifikasi pembayaran otomatis.</p>
                            </div>
                            <code class="text-xs bg-black px-3 py-2 rounded border border-slate-800 text-purple-400 font-mono">POST /api/qris/mutasi</code>
                        </div>
                        
                        <div class="grid md:grid-cols-2 gap-6 mt-6">
                            <div>
                                <h5 class="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Parameters</h5>
                                <ul class="text-sm text-slate-300 space-y-2">
                                    <li class="flex gap-2"><span class="text-purple-400 font-mono bg-purple-950/30 px-1 rounded">auth_username</span> : Username Login.</li>
                                    <li class="flex gap-2"><span class="text-purple-400 font-mono bg-purple-950/30 px-1 rounded">auth_token</span> : Token dari hasil Verify OTP.</li>
                                </ul>
                            </div>
                            <div>
                                <h5 class="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Response Example</h5>
                                <pre class="bg-black/50 p-4 rounded-lg text-xs text-green-400 border border-slate-800 overflow-x-auto">
{
  "success": true,
  "data": { 
      "qris_history": { 
          "results": [ ...list transaksi... ] 
      } 
  }
}</pre>
                            </div>
                        </div>
                    </div>

                    <div class="glass p-6 rounded-xl border-l-2 border-l-slate-600 hover:border-l-purple-500 transition-colors">
                        <div class="flex flex-col md:flex-row md:items-center justify-between mb-4 gap-2">
                            <div>
                                <h4 class="font-bold text-white text-lg">4. Generate Dynamic QRIS</h4>
                                <p class="text-slate-400 text-sm mt-1">Membuat kode QRIS baru dengan nominal yang sudah tertanam (Static to Dynamic). Output berupa base64 image.</p>
                            </div>
                            <code class="text-xs bg-black px-3 py-2 rounded border border-slate-800 text-purple-400 font-mono">POST /api/qris/dynamic</code>
                        </div>
                        
                        <div class="grid md:grid-cols-2 gap-6 mt-6">
                            <div>
                                <h5 class="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Parameters</h5>
                                <ul class="text-sm text-slate-300 space-y-2">
                                    <li class="flex flex-col mb-2">
                                        <span class="text-purple-400 font-mono bg-purple-950/30 w-fit px-1 rounded mb-1">base_string</span>
                                        <span class="text-xs text-slate-500">String text dari QRIS Toko Asli Anda (bisa didapat dari scan QRIS toko pakai aplikasi scanner).</span>
                                    </li>
                                    <li class="flex gap-2"><span class="text-purple-400 font-mono bg-purple-950/30 px-1 rounded">amount</span> : Nominal Rupiah (Int).</li>
                                </ul>
                            </div>
                            <div>
                                <h5 class="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Example JSON</h5>
                                <pre class="bg-black/50 p-4 rounded-lg text-xs text-slate-300 border border-slate-800 overflow-x-auto">
{
  "base_string": "00020101021226...",
  "amount": 50000
}</pre>
                            </div>
                        </div>
                    </div>

                </div>

            </div>
        </div>

    </main>
    
    <footer class="mt-10 mb-6 text-center text-xs text-slate-600 font-mono relative z-10">
        <p>SECURE CONNECTION ESTABLISHED • ${settings.app.maintainer}</p>
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
                form: {
                    username: '', password: '', otp: '', 
                    token: '', base_string: '', amount: ''
                },
                resetForm() {
                    this.response = '';
                    this.qrImage = null;
                    this.status = 'READY';
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
                    } else if (this.selectedFeature === 'dynamic') {
                        endpoint = '/api/qris/dynamic';
                        payload = { base_string: this.form.base_string, amount: this.form.amount };
                    }

                    try {
                        const res = await fetch(endpoint, {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify(payload)
                        });
                        const data = await res.json();
                        
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
