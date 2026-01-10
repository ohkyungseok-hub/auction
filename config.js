// 마켓베르데 설정 파일
const CONFIG = {
    // 백오피스 도메인 설정
    // 별도 도메인을 사용하려면 여기에 설정하세요
    // 예: 'https://admin.marketverde.com' 또는 'https://backoffice.marketverde.com'
    BACKOFFICE_DOMAIN: '', // 빈 문자열이면 현재 도메인 사용
    
    // 프론트엔드 도메인 (백오피스에서 프론트로 이동할 때 사용)
    FRONTEND_DOMAIN: '', // 빈 문자열이면 현재 도메인 사용
    
    // 쇼핑몰 링크
    SHOPPING_MALL_URL: 'https://afoursshop.vercel.app/',
    
    // API 서버 URL
    API_BASE_URL: 'http://localhost:5000', // 프로덕션에서는 실제 API 서버 URL로 변경
};

// 백오피스 URL 생성 함수
function getBackofficeUrl(path = '') {
    if (CONFIG.BACKOFFICE_DOMAIN) {
        // 별도 도메인이 설정된 경우
        const domain = CONFIG.BACKOFFICE_DOMAIN.replace(/\/$/, ''); // 끝의 슬래시 제거
        if (path) {
            // 경로가 /로 시작하면 그대로 사용, 아니면 / 추가
            return domain + (path.startsWith('/') ? path : '/' + path);
        }
        return domain;
    }
    // 현재 도메인 사용
    const currentDomain = window.location.origin;
    const defaultPath = path || 'backoffice-login.html';
    return currentDomain + '/' + defaultPath.replace(/^\//, ''); // 시작의 슬래시 제거
}

// 프론트엔드 URL 생성 함수
function getFrontendUrl(path = '') {
    if (CONFIG.FRONTEND_DOMAIN) {
        // 별도 도메인이 설정된 경우
        const domain = CONFIG.FRONTEND_DOMAIN.replace(/\/$/, ''); // 끝의 슬래시 제거
        if (path) {
            // 경로가 /로 시작하면 그대로 사용, 아니면 / 추가
            return domain + (path.startsWith('/') ? path : '/' + path);
        }
        return domain;
    }
    // 현재 도메인 사용
    const currentDomain = window.location.origin;
    const defaultPath = path || 'index.html';
    return currentDomain + '/' + defaultPath.replace(/^\//, ''); // 시작의 슬래시 제거
}
