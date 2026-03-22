# QR 코드 생성기 (Next.js + Supabase + shadcn)

Vercel 배포를 전제로 한 QR 코드 생성 웹앱입니다.

- **UI 테마**: `npx shadcn@latest add https://tweakcn.com/r/themes/twitter.json` (Twitter 테마)
- **인증**: Supabase Auth (이메일/비밀번호, 회원가입·로그인·로그아웃)
- **회원 DB**: `public.profiles` (회원 메타), `public.saved_qr_codes` (회원별 저장 QR 텍스트, RLS)
- **보안**: `anon` 키만 사용, 입력값 검증, 미들웨어에서 세션 쿠키 갱신

## 로컬 실행

1. 의존성 설치

   ```bash
   npm install
   ```

2. 환경 변수

   `.env.example`을 복사해 `.env.local`을 만들고 값을 채웁니다.

   ```bash
   cp .env.example .env.local
   ```

   - `NEXT_PUBLIC_SUPABASE_URL`: **Project Settings → API → Project URL** (`.env.example`은 예시만, 실제 값은 본인 프로젝트)
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`: **anon public** 키 (`service_role` 사용 금지)
   - `NEXT_PUBLIC_SITE_URL`: 로컬은 `http://localhost:3000` (포트에 맞게)

3. Supabase 대시보드 설정

   - **Authentication → URL Configuration**
     - **Site URL**: 로컬이면 `http://localhost:3000`, 배포 후에는 Vercel URL
     - **Redirect URLs**에 다음을 추가:
       - `http://localhost:3000/auth/callback`
       - `https://<your-vercel-domain>/auth/callback`

4. **회원 테이블 마이그레이션 (필수)**

   Supabase 대시보드 → **SQL Editor** → New query → 아래 파일 내용을 붙여넣고 **Run** 합니다.

   - 저장소 파일: `supabase/migrations/20250322000000_profiles.sql`

   또는 Supabase CLI 사용 시: `supabase db push` (로컬에 CLI·링크 설정 필요)

   적용 후 **Table Editor**에 `profiles` 테이블이 보이고, **Authentication → Users**에 있는 기존 사용자도 백필됩니다.

   이어서 **저장 QR 기능**을 쓰려면 아래 파일도 SQL Editor에서 **Run** 합니다.

   - `supabase/migrations/20250322120000_saved_qr_codes.sql`

5. **첫 관리자 지정 (선택)**

   회원 관리 페이지(`/admin/members`)는 `role = 'admin'` 인 계정만 접근할 수 있습니다. SQL Editor에서 한 번 실행합니다 (이메일을 본인 것으로 바꿉니다).

   ```sql
   update public.profiles
   set role = 'admin'
   where email = 'your-email@example.com';
   ```

6. 개발 서버

   ```bash
   npm run dev
   ```

   - 홈 `/`: QR 생성 · **PNG 저장** / **서버에 저장** · 상단 네비
   - `/saved`: 내가 서버에 저장한 QR 목록·삭제
   - `/profile`: 표시 이름 수정
   - `/admin/members`: 전체 회원 목록 (관리자만)

## GitHub 푸시 · 비밀 정보

- **`.env.local`은 커밋하지 마세요.** (`.gitignore`에 포함됨) — 자세한 점검은 [`docs/GITHUB_SECURITY.md`](docs/GITHUB_SECURITY.md)
- 저장소에는 **`.env.example`**(플레이스홀더만)만 올립니다.

## Vercel 배포

1. GitHub에 푸시 후 Vercel에서 프로젝트 import
2. **Environment Variables**에 아래 변수를 넣습니다. (설명·주의사항은 **[`docs/VERCEL_ENV.md`](docs/VERCEL_ENV.md)** 참고)

   | 변수 | 필수 |
   |------|------|
   | `NEXT_PUBLIC_SUPABASE_URL` | ✅ Supabase Project URL |
   | `NEXT_PUBLIC_SUPABASE_ANON_KEY` | ✅ anon public 키 |
   | `NEXT_PUBLIC_SITE_URL` | ✅ 배포 URL (예: `https://프로젝트.vercel.app`, 끝 `/` 없음) |

3. Supabase **Authentication → URL Configuration** → **Redirect URLs**에 `https://배포주소/auth/callback` 추가
4. 로컬에서 `npm run build` 확인 후 배포 (환경 변수 변경 시 **Redeploy**)

## 가입 확인 메일이 안 올 때

코드는 `signUp` 결과에 따라 안내 문구를 바꿉니다. 메일이 오지 않으면 **Supabase 쪽 설정**을 확인하세요.

1. **Authentication → Providers → Email** → **Confirm email** 이 켜져 있어야 확인 메일이 발송됩니다. 꺼져 있으면 메일 없이 가입만 되고, 앱에서는 “바로 로그인할 수 있습니다”로 안내됩니다.
2. **Authentication → URL Configuration** → **Redirect URLs**에 `http://localhost:3000/auth/callback`(및 배포 URL)이 포함되어 있어야 합니다.
3. 기본 발송 메일은 **스팸함**에 들어가는 경우가 많습니다.
4. 프로덕션에서는 **Custom SMTP** 설정을 권장합니다. (Supabase 문서 참고)

회원가입 화면의 **「확인 메일 다시 보내기」**는 `auth.resend({ type: 'signup' })`를 호출합니다.

## MCP / 조직

Supabase **조직·프로젝트 생성·키 확인**은 Cursor의 Supabase MCP로 대시보드와 동일하게 처리할 수 있습니다. **키·`.env.local`은 Git에 올리지 마세요.**

## 스크립트

| 명령        | 설명        |
| ----------- | ----------- |
| `npm run dev` | 개발 서버 |
| `npm run build` | 프로덕션 빌드 |
| `npm run start` | 프로덕션 실행 |
| `npm run lint` | ESLint |
