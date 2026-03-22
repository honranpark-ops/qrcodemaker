# Vercel 환경 변수 (필수)

배포 후 앱이 Supabase와 통신하려면 **아래 3개**를 Vercel에 등록해야 합니다.

Vercel 대시보드 → 프로젝트 → **Settings** → **Environment Variables**

| 변수명 | 필수 | 설명 |
|--------|------|------|
| `NEXT_PUBLIC_SUPABASE_URL` | ✅ | Supabase 프로젝트 URL. **Project Settings → API → Project URL** |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | ✅ | **anon public** 키 (같은 API 화면). `service_role` 키는 절대 넣지 마세요. |
| `NEXT_PUBLIC_SITE_URL` | ✅ | 배포된 사이트의 **공개 URL** (예: `https://xxx.vercel.app` 또는 커스텀 도메인). 끝에 `/` 없이. |

### 환경 범위 (Environments)

- **Production**: 프로덕션 도메인용 값
- **Preview**: PR·브랜치 미리보기 URL이 다를 수 있으므로, `NEXT_PUBLIC_SITE_URL`은 Preview용으로 `https://*.vercel.app` 패턴을 쓰거나, Preview마다 수동으로 맞추기 어렵다면 **Production만** 정확히 맞추고 Preview는 테스트용 Supabase 프로젝트를 쓰는 방식도 가능합니다.

최소한 **Production**에는 위 3개가 모두 있어야 합니다.

### 빌드 시 주의

`NEXT_PUBLIC_*` 변수는 **빌드 시점**에 클라이언트 번들에 포함됩니다. 값을 바꾼 뒤에는 **Redeploy**가 필요합니다.

### Supabase 대시보드와 맞출 것

배포 URL이 정해지면:

1. **Authentication → URL Configuration**
   - **Site URL**: `https://배포주소` (또는 메인 도메인)
   - **Redirect URLs**에 추가: `https://배포주소/auth/callback`

2. 로컬 개발용도 쓰려면 `http://localhost:3000/auth/callback` 등도 Redirect URL에 유지합니다.

---

## 커밋하면 안 되는 것

- `.env.local`, `.env`, `.env.production.local` 등 **실제 키가 들어 있는 파일**
- `.vercel` 폴더(개인 토큰 포함 가능)

이 저장소의 `.gitignore`에 `.env*`가 있고 `!.env.example`만 예외로 두었습니다. **anon 키도 저장소에 올리지 않는 것**을 권장합니다 (공개 저장소일 때 특히).
