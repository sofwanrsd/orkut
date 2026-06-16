-- Skema D1 untuk TAVEVE Gateway (MULTI-TENANT)
-- Jalankan: npm run db:init   (atau db:init:local untuk dev)
-- CATATAN: skrip ini DROP tabel lama — aman dijalankan ulang saat masih tahap test.

DROP TABLE IF EXISTS invoices;
DROP TABLE IF EXISTS app_state;
DROP TABLE IF EXISTS balance_log;

-- Tabel tagihan / order (per merchant)
CREATE TABLE invoices (
  merchant_id  TEXT    NOT NULL,             -- ID merchant (dari server utama)
  id           TEXT    NOT NULL,             -- ID tagihan (ref dari server utama / auto)
  base_amount  INTEGER NOT NULL,             -- harga asli (mis. 10000)
  unique_code  INTEGER NOT NULL,             -- kode unik (mis. 37)
  amount       INTEGER NOT NULL,             -- yang HARUS dibayar = base + unique_code
  qris_string  TEXT,                         -- string QRIS dinamis
  status       TEXT    NOT NULL DEFAULT 'PENDING',  -- PENDING | PAID | EXPIRED
  created_at   INTEGER NOT NULL,             -- epoch ms
  expires_at   INTEGER NOT NULL,             -- epoch ms (batas tampil ke pelanggan)
  paid_at      INTEGER,                      -- epoch ms saat lunas
  paid_delta   INTEGER,                      -- delta saldo yang mencocokkan (audit)
  PRIMARY KEY (merchant_id, id)
);

-- Pencarian cepat saat mencocokkan pembayaran (per merchant)
CREATE INDEX idx_invoices_match ON invoices (merchant_id, status, expires_at);
CREATE INDEX idx_invoices_code  ON invoices (merchant_id, base_amount, status);

-- State global key-value. Baseline saldo disimpan per merchant: 'last_balance:{merchant_id}'
CREATE TABLE app_state (
  key   TEXT PRIMARY KEY,
  value TEXT
);

-- Log perubahan saldo (per merchant) untuk audit
CREATE TABLE balance_log (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  merchant_id TEXT    NOT NULL,
  at          INTEGER NOT NULL,   -- epoch ms
  prev        INTEGER NOT NULL,
  current     INTEGER NOT NULL,
  delta       INTEGER NOT NULL,
  note        TEXT                -- 'matched' | 'unmatched_in' | 'balance_down' | dsb
);
CREATE INDEX idx_balancelog_merchant ON balance_log (merchant_id, at);
