/** QR에 넣을 문자열 검증 (길이·제어 문자·위험 스킴 완화) */
const MAX_LEN = 2048;

export type QrSanitizeResult =
  | { ok: true; value: string }
  | { ok: false; error: string };

export function sanitizeQrInput(raw: string): QrSanitizeResult {
  const trimmed = raw.trim().slice(0, MAX_LEN);
  if (trimmed.length === 0) {
    return { ok: false, error: "내용을 입력해 주세요." };
  }
  if (/[\u0000-\u0008\u000B\u000C\u000E-\u001F]/.test(trimmed)) {
    return { ok: false, error: "허용되지 않는 문자가 포함되어 있습니다." };
  }
  const lower = trimmed.slice(0, 32).toLowerCase();
  if (lower.startsWith("javascript:") || lower.startsWith("data:text/html")) {
    return { ok: false, error: "이 형식의 내용은 사용할 수 없습니다." };
  }
  return { ok: true, value: trimmed };
}
