# 데이터베이스 전환 가이드

기존 LocalStorage 기반 코드가 데이터베이스 API를 사용하도록 전환되었습니다.

## 설정 방법

### 1. 데이터베이스 초기화

```bash
python3 database/init_db.py
```

이 명령어는 `database/auction.db` SQLite 데이터베이스를 생성합니다.

### 2. API 서버 실행

```bash
pip3 install -r database/requirements_api.txt
python3 database/db_api.py
```

API 서버가 `http://localhost:5000`에서 실행됩니다.

### 3. 브라우저에서 사용

모든 HTML 파일에 `api_client.js`가 포함되어 있습니다. API 서버가 실행 중이면 자동으로 데이터베이스를 사용하고, 실행되지 않으면 LocalStorage로 폴백합니다.

## 변경 사항

### API 클라이언트 (`api_client.js`)
- 모든 데이터베이스 작업을 REST API로 처리
- API 서버가 없을 경우 LocalStorage로 자동 폴백

### 주요 파일 수정
- `script.js` - 비동기 함수로 변경 (async/await)
- `admin.js` - 비동기 함수로 변경
- `register.html` - API를 통한 상품 등록
- `login.html` - API를 통한 회원 인증
- `backoffice-login.html` - API를 통한 관리자 인증

## 데이터베이스 스키마

- **members** - 회원 정보
- **admins** - 관리자 계정
- **products** - 상품/경매 정보
- **bids** - 입찰 정보
- **banners** - 배너 정보

## API 엔드포인트

- `GET /api/products` - 모든 상품 조회
- `POST /api/products` - 상품 추가
- `GET /api/products/<id>` - 상품 조회
- `DELETE /api/products/<id>` - 상품 삭제
- `POST /api/bids` - 입찰 추가
- `GET /api/products/<id>/bids` - 상품의 입찰 목록
- `GET /api/members` - 모든 회원 조회
- `POST /api/members` - 회원 추가
- `GET /api/members/<email>` - 회원 조회
- `GET /api/banners` - 모든 배너 조회
- `POST /api/banners` - 배너 추가
- `POST /api/admin/login` - 관리자 로그인

## 주의사항

1. API 서버가 실행 중이어야 데이터베이스가 사용됩니다
2. API 서버가 없으면 자동으로 LocalStorage로 폴백합니다
3. CORS 설정이 되어 있어야 브라우저에서 API를 호출할 수 있습니다
