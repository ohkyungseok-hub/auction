# 백오피스 별도 도메인 설정 가이드

백오피스를 별도 도메인으로 분리하여 운영하는 방법을 안내합니다.

## 설정 방법

### 1. config.js 파일 수정

`config.js` 파일을 열어서 백오피스 도메인을 설정하세요:

```javascript
const CONFIG = {
    // 백오피스 도메인 설정
    // 별도 도메인을 사용하려면 여기에 설정하세요
    BACKOFFICE_DOMAIN: 'https://admin.marketverde.com', // 예시
    
    // 프론트엔드 도메인 (백오피스에서 프론트로 이동할 때 사용)
    FRONTEND_DOMAIN: 'https://marketverde.com', // 예시
    
    // 쇼핑몰 링크
    SHOPPING_MALL_URL: 'https://afoursshop.vercel.app/',
    
    // API 서버 URL
    API_BASE_URL: 'http://localhost:5000',
};
```

### 2. 도메인 설정 옵션

#### 옵션 A: 같은 저장소, 같은 도메인 (기본)
```javascript
BACKOFFICE_DOMAIN: '', // 빈 문자열
FRONTEND_DOMAIN: '', // 빈 문자열
```
- 백오피스: `https://ohkyungseok-hub.github.io/auction/backoffice-login.html`
- 프론트엔드: `https://ohkyungseok-hub.github.io/auction/index.html`

#### 옵션 B: 별도 서브도메인
```javascript
BACKOFFICE_DOMAIN: 'https://admin.marketverde.com',
FRONTEND_DOMAIN: 'https://marketverde.com',
```
- 백오피스: `https://admin.marketverde.com`
- 프론트엔드: `https://marketverde.com`

#### 옵션 C: 완전히 별도 도메인
```javascript
BACKOFFICE_DOMAIN: 'https://backoffice.marketverde.com',
FRONTEND_DOMAIN: 'https://www.marketverde.com',
```

## 배포 방법

### 방법 1: 같은 저장소에서 배포 (현재 방식)
- 모든 파일이 같은 저장소에 있음
- GitHub Pages 하나로 프론트엔드와 백오피스 모두 배포
- `config.js`에서 도메인만 다르게 설정

### 방법 2: 별도 저장소로 분리
1. 백오피스 전용 저장소 생성
   ```bash
   # 새 저장소 생성 (예: auction-backoffice)
   git clone https://github.com/ohkyungseok-hub/auction-backoffice.git
   ```

2. 백오피스 파일만 복사
   - `backoffice.html`
   - `backoffice-login.html`
   - `admin.js`
   - `api_client.js`
   - `config.js`
   - `styles.css` (또는 백오피스 전용 스타일)

3. 별도 GitHub Pages 배포
   - 새 저장소의 Settings → Pages에서 배포 설정
   - 백오피스 전용 도메인 연결

### 방법 3: Vercel/Netlify 등 별도 호스팅
1. 백오피스 파일들을 별도 프로젝트로 배포
2. 커스텀 도메인 설정
3. `config.js`에서 해당 도메인 설정

## 도메인 연결 방법

### GitHub Pages 커스텀 도메인
1. GitHub 저장소 → Settings → Pages
2. Custom domain에 도메인 입력
3. DNS 설정:
   - A 레코드: `185.199.108.153`, `185.199.109.153`, `185.199.110.153`, `185.199.111.153`
   - 또는 CNAME: `your-username.github.io`

### Vercel 커스텀 도메인
1. Vercel 프로젝트 → Settings → Domains
2. 도메인 추가
3. DNS 설정 안내에 따라 CNAME 또는 A 레코드 설정

## 보안 고려사항

1. **백오피스 접근 제한**
   - 백오피스는 관리자만 접근 가능하도록 설정
   - IP 화이트리스트 (서버 측에서)
   - VPN 접근 권장

2. **HTTPS 필수**
   - 모든 백오피스 통신은 HTTPS 사용
   - 인증서 자동 갱신 설정

3. **CORS 설정**
   - API 서버에서 백오피스 도메인만 허용
   - 프론트엔드와 백오피스 도메인 분리

## 현재 설정 확인

현재 `config.js`의 `BACKOFFICE_DOMAIN`이 빈 문자열이면 같은 도메인을 사용합니다.
별도 도메인을 사용하려면 해당 도메인을 설정하고 재배포하세요.
