# 데이터베이스 전환 완료

기존 LocalStorage 기반 코드가 데이터베이스 API를 사용하도록 전환되었습니다.

## 전환 완료된 파일

### 핵심 파일
- ✅ `api_client.js` - 데이터베이스 API 클라이언트 (새로 생성)
- ✅ `script.js` - 메인 JavaScript (비동기 함수로 전환)
- ✅ `admin.js` - 백오피스 JavaScript (비동기 함수로 전환)

### HTML 파일
- ✅ `index.html` - api_client.js 추가
- ✅ `register.html` - API를 통한 상품 등록
- ✅ `login.html` - API를 통한 회원 인증
- ✅ `mypage.html` - API를 통한 데이터 조회
- ✅ `backoffice.html` - api_client.js 추가
- ✅ `backoffice-login.html` - API를 통한 관리자 인증

## 사용 방법

### 1. 데이터베이스 초기화
```bash
python3 database/init_db.py
```

### 2. API 서버 실행
```bash
pip3 install -r database/requirements_api.txt
python3 database/db_api.py
```

API 서버가 `http://localhost:5000`에서 실행됩니다.

### 3. 브라우저에서 사용
- API 서버가 실행 중이면 자동으로 데이터베이스를 사용합니다
- API 서버가 없으면 LocalStorage로 자동 폴백합니다

## 주요 변경 사항

### 비동기 처리
- 모든 데이터 조회/저장 함수가 `async/await`로 변경되었습니다
- `renderProducts()`, `renderAuctions()`, `renderMembers()` 등이 비동기 함수입니다

### 데이터 필드명 매핑
- 데이터베이스 필드명 (snake_case)과 JavaScript 필드명 (camelCase) 모두 지원
- 예: `min_price` ↔ `minPrice`, `supplier_name` ↔ `supplierName`

### 폴백 메커니즘
- API 서버가 없거나 오류 발생 시 자동으로 LocalStorage 사용
- 개발 및 테스트 환경에서 유연하게 사용 가능

## API 엔드포인트

모든 API는 `http://localhost:5000/api`를 기본 URL로 사용합니다.

- `GET /api/products` - 상품 목록
- `POST /api/products` - 상품 추가
- `GET /api/products/:id` - 상품 조회
- `DELETE /api/products/:id` - 상품 삭제
- `POST /api/bids` - 입찰 추가
- `GET /api/products/:id/bids` - 입찰 목록
- `GET /api/members` - 회원 목록
- `POST /api/members` - 회원 추가
- `GET /api/members/:email` - 회원 조회
- `GET /api/banners` - 배너 목록
- `POST /api/banners` - 배너 추가
- `POST /api/admin/login` - 관리자 로그인

## 주의사항

1. **CORS 설정**: API 서버의 CORS가 활성화되어 있어야 브라우저에서 호출 가능합니다
2. **API 서버 실행**: 데이터베이스를 사용하려면 반드시 API 서버를 실행해야 합니다
3. **폴백 동작**: API 서버가 없으면 LocalStorage로 자동 전환되지만, 데이터는 브라우저별로 저장됩니다

## 다음 단계

프로덕션 환경에서는:
1. 실제 데이터베이스 서버 사용 (PostgreSQL, MySQL 등)
2. 인증/인가 시스템 구현
3. API 보안 강화 (HTTPS, 토큰 인증 등)
4. 데이터 백업 및 복구 시스템
