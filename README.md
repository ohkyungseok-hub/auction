# 마켓베르데 경매 시스템

유통기한이 임박한 상품의 경매 플랫폼

## 프로젝트 소개

마켓베르데는 유통업체들이 유통기한이 임박한 상품을 등록하고, 매입업체들이 경매식으로 입찰할 수 있는 서비스입니다.

## 주요 기능

### 일반 사용자
- 경매 목록 조회
- 실시간 카운트다운 확인
- 블라인드 입찰 (다른 입찰자의 가격 비공개)
- 로그인/마이페이지

### 유통업체
- 상품 등록 (유통기한, 경매 종료 시간, 최저가 설정)
- 등록한 상품 관리

### 관리자 (백오피스)
- 경매목록 관리 (진행중, 종료, 예정)
- 회원관리
- 상품관리
- 배너관리

## 기술 스택

- HTML5
- CSS3
- JavaScript (Vanilla)
- LocalStorage (데이터 저장)

## 시작하기

1. 저장소 클론
```bash
git clone https://github.com/ohkyungseok-hub/auction.git
cd auction
```

2. 로컬 서버 실행 (선택사항)
```bash
# Python 3
python -m http.server 8000

# Node.js (http-server 설치 필요)
npx http-server -p 8000
```

3. 브라우저에서 열기
```
http://localhost:8000/index.html
```

## 파일 구조

```
auction/
├── index.html              # 메인 페이지 (경매 목록)
├── register.html           # 상품 등록 페이지
├── login.html              # 로그인 페이지
├── mypage.html             # 마이페이지
├── backoffice.html         # 백오피스 관리 페이지
├── backoffice-login.html   # 백오피스 로그인 페이지
├── script.js               # 메인 JavaScript 로직
├── admin.js                # 백오피스 JavaScript 로직
└── styles.css              # 공통 스타일시트
```

## 기본 계정

### 관리자 계정 (백오피스)
- ID: `admin`
- 비밀번호: `admin123`

## 회사 정보

- 브랜드명: 마켓베르데
- 회사명: 에이포스
- 대표자: 황지후

## 라이선스

Copyright © 2024 마켓베르데 (에이포스). All rights reserved.
