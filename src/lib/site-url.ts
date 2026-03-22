/**
 * 회원가입/재전송 시 emailRedirectTo 에 넣을 사이트 베이스 URL.
 * 잘못된 NEXT_PUBLIC_SITE_URL(null, 상대경로 등)이면 브라우저 origin 사용.
 */
export function getTrustedSiteUrlForAuth(clientOrigin: string): string {
  const raw =
    typeof process !== "undefined"
      ? process.env.NEXT_PUBLIC_SITE_URL?.trim().replace(/\/$/, "") ?? ""
      : "";
  if (!raw || raw === "null" || raw === "undefined") {
    return clientOrigin;
  }
  if (!/^https?:\/\//i.test(raw)) {
    return clientOrigin;
  }
  try {
    const u = new URL(raw);
    if (!u.hostname || u.hostname === "null") {
      return clientOrigin;
    }
    return u.origin;
  } catch {
    return clientOrigin;
  }
}

/**
 * Route Handler에서 리다이렉트할 때 사용 (요청 호스트 기준, Vercel 프록시 대응)
 */
export function getRedirectOriginFromRequest(request: Request): string {
  const forwardedHost = request.headers.get("x-forwarded-host");
  const forwardedProto =
    request.headers.get("x-forwarded-proto")?.split(",")[0]?.trim() ||
    "https";
  if (forwardedHost) {
    const host = forwardedHost.split(",")[0].trim();
    return `${forwardedProto}://${host}`;
  }
  try {
    return new URL(request.url).origin;
  } catch {
    return "http://localhost:3000";
  }
}

/** 오픈 리다이렉트 방지 */
export function safeInternalPath(next: string | null): string {
  if (!next || !next.startsWith("/") || next.startsWith("//")) {
    return "/";
  }
  return next;
}
