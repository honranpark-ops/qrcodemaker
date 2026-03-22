# GitHub 푸시 전 — Supabase 비밀 유출 방지

## 1. 커밋되지 않는지 확인

터미널에서 (프로젝트 루트):

```bash
git status
```

다음 파일이 **추적 대상(staged/committed)에 나오면 안 됩니다.**

| 파일 | 이유 |
|------|------|
| `.env.local` | 실제 URL·anon 키 |
| `.env` | 동일 |
| `.env.production` | 동일 |

`.env.example`은 **예시만** 있고 비어 있거나 플레이스홀더이므로 커밋해도 됩니다.

### 실수로 한 번 커밋했다면

1. 해당 커밋에서 파일 제거 후 **Supabase 대시보드에서 anon 키 재발급(rotate)** 을 권장합니다.  
2. 공개 저장소라면 히스토리에 남은 키는 **유출로 간주**하고 재발급하세요.

## 2. `git check-ignore`로 확인

```bash
git check-ignore -v .env.local
```

`.gitignore` 규칙이 적용되면 경로가 출력됩니다.

## 3. 코드 안에 키를 넣지 않기

- `NEXT_PUBLIC_SUPABASE_ANON_KEY` 등은 **환경 변수**로만 읽습니다.  
- 소스 코드에 JWT 문자열을 붙여 넣지 마세요.

## 4. anon 키도 “공개”지만 저장소에는 올리지 않기

`anon` 키는 브라우저에 노출되도록 설계되어 있지만, **GitHub에 상시 노출**하면 스크립트로 API 호출·남용이 쉬워집니다.  
`.env.local` / Vercel 환경 변수로만 관리하는 것이 좋습니다.

**`service_role` 키**는 서버 전용이며 **클라이언트·저장소·Vercel의 `NEXT_PUBLIC_*`에 절대 넣지 마세요.**
