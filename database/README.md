# 데이터베이스 설정 가이드

마켓베르데 경매 시스템의 데이터베이스 설정 방법입니다.

## 옵션 1: SQLite (Python 백엔드)

### 초기화

```bash
python database/init_db.py
```

이 명령어는 `database/auction.db` 파일을 생성하고 스키마를 적용합니다.

### API 서버 실행

```bash
pip install -r database/requirements_api.txt
python database/db_api.py
```

API 서버가 `http://localhost:5000`에서 실행됩니다.

### API 엔드포인트

- `GET /api/products` - 모든 상품 조회
- `POST /api/products` - 상품 추가
- `GET /api/products/<id>` - 상품 조회
- `DELETE /api/products/<id>` - 상품 삭제
- `POST /api/bids` - 입찰 추가
- `GET /api/products/<id>/bids` - 상품의 입찰 목록
- `GET /api/members` - 모든 회원 조회
- `POST /api/members` - 회원 추가
- `GET /api/banners` - 모든 배너 조회
- `POST /api/banners` - 배너 추가
- `POST /api/admin/login` - 관리자 로그인

## 옵션 2: SQL.js (브라우저 직접 사용)

브라우저에서 직접 SQLite를 사용하려면 SQL.js를 사용합니다.

### HTML에 추가

```html
<script src="https://cdnjs.cloudflare.com/ajax/libs/sql.js/1.8.0/sql-wasm.js"></script>
<script src="database/db_manager.js"></script>
```

### 사용 예시

```javascript
// 데이터베이스 초기화
await dbManager.init();

// 상품 추가
const productId = dbManager.addProduct({
    name: '신선한 사과',
    quantity: 10,
    unit: 'kg',
    minPrice: 50000,
    supplierName: '에이포스',
    expiryDate: '2024-12-31',
    auctionEndDate: '2024-12-25'
});

// 상품 조회
const products = dbManager.getAllProducts();

// 입찰 추가
dbManager.addBid(productId, {
    bidderName: '홍길동',
    bidderEmail: 'hong@example.com',
    amount: 55000
});
```

## 데이터베이스 스키마

### 테이블 구조

1. **members** - 회원 정보
2. **admins** - 관리자 계정
3. **products** - 상품/경매 정보
4. **bids** - 입찰 정보
5. **banners** - 배너 정보

### 기본 관리자 계정

- ID: `admin`
- 비밀번호: `admin123`

## 데이터베이스 파일 위치

- SQLite 파일: `database/auction.db`
- 스키마 파일: `database/schema.sql`

## 주의사항

- SQL.js는 브라우저의 LocalStorage에 데이터를 저장합니다 (용량 제한 있음)
- Python API 서버를 사용하면 서버의 파일 시스템에 저장됩니다
- 프로덕션 환경에서는 PostgreSQL이나 MySQL 같은 더 강력한 데이터베이스를 권장합니다
