# 배포 가이드

## GitHub Pages 배포

### 자동 배포 (권장)

1. GitHub 저장소 설정에서 Pages 활성화:
   - 저장소 → Settings → Pages
   - Source: "GitHub Actions" 선택
   - 저장

2. `main` 브랜치에 푸시하면 자동으로 배포됩니다.

### 수동 배포

```bash
# gh-pages 브랜치 생성 및 푸시
git checkout -b gh-pages
git push origin gh-pages
```

## API 서버 배포

프로덕션 환경에서는 별도의 서버에 API를 배포해야 합니다.

### 옵션 1: Heroku
```bash
heroku create auction-api
git push heroku main
```

### 옵션 2: Railway
```bash
railway init
railway up
```

### 옵션 3: Render
- Render 대시보드에서 새 Web Service 생성
- `database/db_api.py`를 실행 파일로 설정

## 환경 변수

프로덕션 환경에서는 다음 환경 변수를 설정하세요:

- `FLASK_ENV=production`
- `DATABASE_URL` (프로덕션 데이터베이스 URL)

## 주의사항

1. **데이터베이스 파일**: `database/auction.db`는 `.gitignore`에 추가되어 커밋되지 않습니다.
2. **API 서버**: GitHub Pages는 정적 파일만 호스팅하므로, API 서버는 별도로 배포해야 합니다.
3. **CORS 설정**: 프로덕션 API 서버의 CORS 설정을 프론트엔드 도메인에 맞게 수정해야 합니다.
