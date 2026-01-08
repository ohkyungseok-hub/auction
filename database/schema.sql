-- 마켓베르데 경매 시스템 데이터베이스 스키마

-- 회원 테이블
CREATE TABLE IF NOT EXISTS members (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    password TEXT,
    company TEXT,
    phone TEXT,
    type TEXT NOT NULL DEFAULT 'buyer', -- 'buyer' or 'supplier'
    created_at TEXT NOT NULL,
    updated_at TEXT
);

-- 관리자 테이블
CREATE TABLE IF NOT EXISTS admins (
    id TEXT PRIMARY KEY,
    password TEXT NOT NULL,
    name TEXT NOT NULL,
    created_at TEXT NOT NULL
);

-- 상품 테이블
CREATE TABLE IF NOT EXISTS products (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
    quantity INTEGER NOT NULL,
    unit TEXT DEFAULT '개',
    min_price INTEGER NOT NULL,
    supplier_name TEXT NOT NULL,
    supplier_email TEXT,
    expiry_date TEXT NOT NULL,
    auction_start_date TEXT NOT NULL,
    auction_end_date TEXT NOT NULL,
    created_at TEXT NOT NULL,
    updated_at TEXT
);

-- 입찰 테이블
CREATE TABLE IF NOT EXISTS bids (
    id TEXT PRIMARY KEY,
    product_id TEXT NOT NULL,
    bidder_name TEXT NOT NULL,
    bidder_email TEXT,
    amount INTEGER NOT NULL,
    timestamp TEXT NOT NULL,
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
);

-- 배너 테이블
CREATE TABLE IF NOT EXISTS banners (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT,
    image_url TEXT,
    link_url TEXT,
    order_index INTEGER NOT NULL DEFAULT 0,
    active INTEGER NOT NULL DEFAULT 1, -- 0: 비활성, 1: 활성
    created_at TEXT NOT NULL,
    updated_at TEXT
);

-- 인덱스 생성
CREATE INDEX IF NOT EXISTS idx_products_supplier ON products(supplier_email);
CREATE INDEX IF NOT EXISTS idx_products_auction_end ON products(auction_end_date);
CREATE INDEX IF NOT EXISTS idx_bids_product ON bids(product_id);
CREATE INDEX IF NOT EXISTS idx_bids_bidder ON bids(bidder_email);
CREATE INDEX IF NOT EXISTS idx_banners_active ON banners(active);
CREATE INDEX IF NOT EXISTS idx_banners_order ON banners(order_index);

-- 기본 관리자 계정 삽입
INSERT OR IGNORE INTO admins (id, password, name, created_at) 
VALUES ('admin', 'admin123', '관리자', datetime('now'));
