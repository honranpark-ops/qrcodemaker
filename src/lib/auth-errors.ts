/**
 * Supabase Auth API 영문 오류 → 사용자 안내 문구
 */
export function formatAuthErrorMessage(message: string): string {
  const m = message.toLowerCase();
  if (
    m.includes("email rate limit") ||
    m.includes("rate limit exceeded") ||
    m.includes("too many requests")
  ) {
    return [
      "이메일 발송 한도를 초과했습니다.",
      "Supabase는 무료·기본 설정에서 시간당 보낼 수 있는 확인 메일 수가 제한됩니다.",
      "약 1시간 정도 지난 뒤 다시 시도하거나, 대시보드 Authentication → 이메일 재전송 횟수를 줄이세요.",
      "자주 테스트할 때는 Project Settings → Auth → Custom SMTP 설정을 검토해 보세요.",
    ].join(" ");
  }
  if (m.includes("user already registered") || m.includes("already been registered")) {
    return "이미 가입된 이메일입니다. 로그인을 시도하거나 비밀번호 재설정을 이용해 주세요.";
  }
  return message;
}
