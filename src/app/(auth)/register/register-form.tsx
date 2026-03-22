"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { formatAuthErrorMessage } from "@/lib/auth-errors";
import { createClient } from "@/lib/supabase/client";
import { getTrustedSiteUrlForAuth } from "@/lib/site-url";

export function RegisterForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [messageTone, setMessageTone] = useState<"info" | "success" | "error">(
    "info",
  );
  const [loading, setLoading] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const [awaitingConfirm, setAwaitingConfirm] = useState(false);

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setMessage(null);
    setAwaitingConfirm(false);
    if (password.length < 8) {
      setMessageTone("error");
      setMessage("비밀번호는 8자 이상으로 설정해 주세요.");
      return;
    }
    setLoading(true);
    const supabase = createClient();
    const siteUrl = getTrustedSiteUrlForAuth(window.location.origin);
    const redirectTo = `${siteUrl.replace(/\/$/, "")}/auth/callback`;

    const { data, error } = await supabase.auth.signUp({
      email: email.trim(),
      password,
      options: {
        emailRedirectTo: redirectTo,
      },
    });
    setLoading(false);

    if (error) {
      setMessageTone("error");
      setMessage(formatAuthErrorMessage(error.message));
      return;
    }

    // 이메일 확인이 꺼져 있거나 즉시 세션이 있으면 → 확인 메일 없이 가입 완료
    if (data.session) {
      setMessageTone("success");
      setMessage(
        "가입이 완료되었습니다. 이메일 확인 없이 바로 로그인할 수 있습니다. 아래에서 로그인해 주세요.",
      );
      return;
    }

    // 세션 없음 + 사용자 있음 → 대부분 ‘이메일 확인 대기’ (Supabase가 확인 메일 발송 시도)
    if (data.user) {
      setMessageTone("info");
      setAwaitingConfirm(true);
      setMessage(
        "이메일 확인이 켜져 있으면 확인 메일이 발송됩니다. 받은편지함·스팸함을 확인해 주세요. 몇 분 걸릴 수 있습니다.",
      );
      return;
    }

    setMessageTone("error");
    setMessage("응답을 처리하지 못했습니다. 잠시 후 다시 시도해 주세요.");
  };

  const onResend = async () => {
    const trimmed = email.trim();
    if (!trimmed) {
      setMessageTone("error");
      setMessage("이메일 주소를 입력한 뒤 다시 시도해 주세요.");
      return;
    }
    setResendLoading(true);
    setMessage(null);
    const supabase = createClient();
    const siteUrl = getTrustedSiteUrlForAuth(window.location.origin);
    const { error } = await supabase.auth.resend({
      type: "signup",
      email: trimmed,
      options: {
        emailRedirectTo: `${siteUrl.replace(/\/$/, "")}/auth/callback`,
      },
    });
    setResendLoading(false);
    if (error) {
      setMessageTone("error");
      setMessage(formatAuthErrorMessage(error.message));
      return;
    }
    setMessageTone("info");
    setMessage("확인 메일 재전송을 요청했습니다. 스팸함도 확인해 주세요.");
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>회원가입</CardTitle>
          <CardDescription>
            <strong>이메일 확인(Confirm email)</strong>을 켠 경우에만 확인 메일이
            갑니다. 무료 플랜은 <strong>시간당 발송 한도</strong>가 있어, 연속
            가입·재전송 시 &quot;rate limit&quot; 오류가 날 수 있습니다. 잠시 후
            다시 시도하거나 스팸함을 확인해 주세요.
          </CardDescription>
        </CardHeader>
        <form onSubmit={onSubmit}>
          <CardContent className="space-y-4">
            {message ? (
              <p
                className={
                  messageTone === "error"
                    ? "text-sm text-destructive"
                    : messageTone === "success"
                      ? "text-sm text-green-700 dark:text-green-400"
                      : "text-sm text-muted-foreground"
                }
                role="status"
              >
                {message}
              </p>
            ) : null}
            <div className="space-y-2">
              <Label htmlFor="reg-email">이메일</Label>
              <Input
                id="reg-email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="reg-password">비밀번호 (8자 이상)</Label>
              <Input
                id="reg-password"
                type="password"
                autoComplete="new-password"
                required
                minLength={8}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
            {awaitingConfirm ? (
              <Button
                type="button"
                variant="outline"
                className="w-full"
                disabled={resendLoading}
                onClick={onResend}
              >
                {resendLoading ? "요청 중…" : "확인 메일 다시 보내기"}
              </Button>
            ) : null}
          </CardContent>
          <CardFooter className="flex flex-col gap-3 sm:flex-row sm:justify-between">
            <Button type="submit" disabled={loading}>
              {loading ? "처리 중…" : "가입하기"}
            </Button>
            <Link
              href="/login"
              className="inline-flex items-center justify-center text-sm font-medium text-primary underline-offset-4 hover:underline"
            >
              로그인으로
            </Link>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
