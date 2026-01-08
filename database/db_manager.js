/**
 * 데이터베이스 관리 모듈 (SQL.js 사용)
 * 브라우저에서 SQLite 데이터베이스를 사용하기 위한 래퍼
 */

// SQL.js 라이브러리 로드 필요: <script src="https://cdnjs.cloudflare.com/ajax/libs/sql.js/1.8.0/sql-wasm.js"></script>

class DatabaseManager {
    constructor() {
        this.db = null;
        this.initPromise = null;
    }

    async init() {
        if (this.initPromise) {
            return this.initPromise;
        }

        this.initPromise = (async () => {
            try {
                // SQL.js 초기화
                const SQL = await initSqlJs({
                    locateFile: file => `https://cdnjs.cloudflare.com/ajax/libs/sql.js/1.8.0/${file}`
                });

                // 데이터베이스 로드 또는 생성
                const dbData = localStorage.getItem('auction_db');
                if (dbData) {
                    const uint8Array = new Uint8Array(JSON.parse(dbData));
                    this.db = new SQL.Database(uint8Array);
                } else {
                    this.db = new SQL.Database();
                    await this.createSchema();
                }

                console.log('✅ 데이터베이스 초기화 완료');
            } catch (error) {
                console.error('❌ 데이터베이스 초기화 실패:', error);
                // 폴백: LocalStorage 사용
                console.log('LocalStorage로 폴백합니다.');
            }
        })();

        return this.initPromise;
    }

    async createSchema() {
        if (!this.db) return;

        const schema = `
            CREATE TABLE IF NOT EXISTS members (
                id TEXT PRIMARY KEY,
                name TEXT NOT NULL,
                email TEXT UNIQUE NOT NULL,
                password TEXT,
                company TEXT,
                phone TEXT,
                type TEXT NOT NULL DEFAULT 'buyer',
                created_at TEXT NOT NULL,
                updated_at TEXT
            );

            CREATE TABLE IF NOT EXISTS admins (
                id TEXT PRIMARY KEY,
                password TEXT NOT NULL,
                name TEXT NOT NULL,
                created_at TEXT NOT NULL
            );

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

            CREATE TABLE IF NOT EXISTS bids (
                id TEXT PRIMARY KEY,
                product_id TEXT NOT NULL,
                bidder_name TEXT NOT NULL,
                bidder_email TEXT,
                amount INTEGER NOT NULL,
                timestamp TEXT NOT NULL
            );

            CREATE TABLE IF NOT EXISTS banners (
                id TEXT PRIMARY KEY,
                title TEXT NOT NULL,
                description TEXT,
                image_url TEXT,
                link_url TEXT,
                order_index INTEGER NOT NULL DEFAULT 0,
                active INTEGER NOT NULL DEFAULT 1,
                created_at TEXT NOT NULL,
                updated_at TEXT
            );

            INSERT OR IGNORE INTO admins (id, password, name, created_at) 
            VALUES ('admin', 'admin123', '관리자', datetime('now'));
        `;

        this.db.run(schema);
        this.save();
    }

    save() {
        if (!this.db) return;
        const data = this.db.export();
        const buffer = Array.from(data);
        localStorage.setItem('auction_db', JSON.stringify(buffer));
    }

    // 회원 관리
    addMember(member) {
        if (!this.db) return null;
        const id = Date.now().toString();
        const now = new Date().toISOString();
        this.db.run(
            `INSERT INTO members (id, name, email, password, company, phone, type, created_at) 
             VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
            [id, member.name, member.email, member.password || '', member.company || '', 
             member.phone || '', member.type || 'buyer', now]
        );
        this.save();
        return id;
    }

    getMemberByEmail(email) {
        if (!this.db) return null;
        const result = this.db.exec(`SELECT * FROM members WHERE email = ?`, [email]);
        if (result.length > 0 && result[0].values.length > 0) {
            const row = result[0].values[0];
            const columns = result[0].columns;
            const member = {};
            columns.forEach((col, idx) => {
                member[col] = row[idx];
            });
            return member;
        }
        return null;
    }

    getAllMembers() {
        if (!this.db) return [];
        const result = this.db.exec(`SELECT * FROM members ORDER BY created_at DESC`);
        if (result.length === 0) return [];
        
        const members = [];
        const columns = result[0].columns;
        result[0].values.forEach(row => {
            const member = {};
            columns.forEach((col, idx) => {
                member[col] = row[idx];
            });
            members.push(member);
        });
        return members;
    }

    // 상품 관리
    addProduct(product) {
        if (!this.db) return null;
        const id = Date.now().toString();
        const now = new Date().toISOString();
        this.db.run(
            `INSERT INTO products (id, name, description, quantity, unit, min_price, supplier_name, 
             supplier_email, expiry_date, auction_start_date, auction_end_date, created_at) 
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [id, product.name, product.description || '', product.quantity, product.unit || '개',
             product.minPrice, product.supplierName, product.supplierEmail || '', 
             product.expiryDate, product.auctionStartDate || now, product.auctionEndDate, now]
        );
        this.save();
        return id;
    }

    getAllProducts() {
        if (!this.db) return [];
        const result = this.db.exec(`SELECT * FROM products ORDER BY created_at DESC`);
        if (result.length === 0) return [];
        
        const products = [];
        const columns = result[0].columns;
        result[0].values.forEach(row => {
            const product = {};
            columns.forEach((col, idx) => {
                product[col] = row[idx];
            });
            products.push(product);
        });
        return products;
    }

    getProductById(id) {
        if (!this.db) return null;
        const result = this.db.exec(`SELECT * FROM products WHERE id = ?`, [id]);
        if (result.length > 0 && result[0].values.length > 0) {
            const row = result[0].values[0];
            const columns = result[0].columns;
            const product = {};
            columns.forEach((col, idx) => {
                product[col] = row[idx];
            });
            return product;
        }
        return null;
    }

    deleteProduct(id) {
        if (!this.db) return false;
        this.db.run(`DELETE FROM products WHERE id = ?`, [id]);
        this.db.run(`DELETE FROM bids WHERE product_id = ?`, [id]);
        this.save();
        return true;
    }

    // 입찰 관리
    addBid(productId, bid) {
        if (!this.db) return null;
        const id = Date.now().toString();
        const now = new Date().toISOString();
        this.db.run(
            `INSERT INTO bids (id, product_id, bidder_name, bidder_email, amount, timestamp) 
             VALUES (?, ?, ?, ?, ?, ?)`,
            [id, productId, bid.bidderName, bid.bidderEmail || '', bid.amount, now]
        );
        this.save();
        return id;
    }

    getBidsByProductId(productId) {
        if (!this.db) return [];
        const result = this.db.exec(
            `SELECT * FROM bids WHERE product_id = ? ORDER BY amount DESC`, 
            [productId]
        );
        if (result.length === 0) return [];
        
        const bids = [];
        const columns = result[0].columns;
        result[0].values.forEach(row => {
            const bid = {};
            columns.forEach((col, idx) => {
                bid[col] = row[idx];
            });
            bids.push(bid);
        });
        return bids;
    }

    // 배너 관리
    addBanner(banner) {
        if (!this.db) return null;
        const id = Date.now().toString();
        const now = new Date().toISOString();
        this.db.run(
            `INSERT INTO banners (id, title, description, image_url, link_url, order_index, active, created_at) 
             VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
            [id, banner.title, banner.description || '', banner.imageUrl || '', 
             banner.link || '', banner.order || 0, banner.active ? 1 : 0, now]
        );
        this.save();
        return id;
    }

    getAllBanners() {
        if (!this.db) return [];
        const result = this.db.exec(`SELECT * FROM banners ORDER BY order_index ASC`);
        if (result.length === 0) return [];
        
        const banners = [];
        const columns = result[0].columns;
        result[0].values.forEach(row => {
            const banner = {};
            columns.forEach((col, idx) => {
                banner[col] = col === 'active' ? (row[idx] === 1) : row[idx];
            });
            banners.push(banner);
        });
        return banners;
    }

    // 관리자 인증
    authenticateAdmin(adminId, password) {
        if (!this.db) return null;
        const result = this.db.exec(
            `SELECT * FROM admins WHERE id = ? AND password = ?`, 
            [adminId, password]
        );
        if (result.length > 0 && result[0].values.length > 0) {
            const row = result[0].values[0];
            const columns = result[0].columns;
            const admin = {};
            columns.forEach((col, idx) => {
                admin[col] = row[idx];
            });
            return admin;
        }
        return null;
    }
}

// 전역 인스턴스 생성
const dbManager = new DatabaseManager();

// 초기화
dbManager.init().then(() => {
    console.log('데이터베이스 준비 완료');
});
