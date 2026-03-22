# Supabase에서 꼭 실행할 SQL

에러가 나는 경우 대부분 **아래 SQL을 대시보드에서 실행하지 않은 경우**입니다.

## 1) 회원 프로필 (`profiles`)

파일: `supabase/migrations/20250322000000_profiles.sql`  
내용 전체를 복사 → Supabase **SQL Editor** → **Run**

## 2) 저장 QR — 테이블 `public.saved_qr_codes` 생성

파일: `supabase/migrations/20250322120000_saved_qr_codes.sql`  

- 파일 **전체**를 복사 → Supabase **SQL Editor** → **Run**  
- 실행 후 **Table Editor** → `public` 스키마에 **`saved_qr_codes`** 가 보이면 성공입니다.  
- `profiles` 테이블이 이미 있으면 관리자용 조회 정책도 함께 붙습니다. (`profiles` 없으면 일반 회원 정책만 적용)

## 이메일 확인 링크 (null / 접근 불가)

1. **Authentication → URL Configuration**
   - **Site URL**: 로컬 개발이면 `http://localhost:3000` (포트 포함, 실제 사용 포트와 동일)
   - **Redirect URLs**에 반드시 추가:
     - `http://localhost:3000/auth/callback`
     - 배포 시 `https://당신도메인/auth/callback`
2. `.env.local`의 `NEXT_PUBLIC_SITE_URL`이 **실제 접속 URL과 같아야** 합니다.  
   - `3001`로 띄우면 `http://localhost:3001` 로 맞출 것  
   - 잘못된 값(`null`, 빈 값, 다른 포트)이면 확인 메일 링크가 깨질 수 있습니다.
3. 설정을 바꾼 뒤 **가입/재전송 메일을 다시** 받아 링크를 테스트하세요.
