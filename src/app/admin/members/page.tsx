import Link from "next/link";
import { redirect } from "next/navigation";

import { AppHeader } from "@/components/app-header";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { createClient } from "@/lib/supabase/server";
import type { Profile } from "@/types/profile";

export default async function AdminMembersPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: me, error: meErr } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .maybeSingle();

  if (meErr || !me) {
    return (
      <div className="min-h-screen bg-background p-6">
        <p className="text-destructive">
          프로필을 불러올 수 없습니다. DB 마이그레이션을 적용했는지 확인하세요.
        </p>
        <Link href="/" className="mt-4 inline-block text-primary underline">
          홈으로
        </Link>
      </div>
    );
  }

  const profile = me as Profile;

  if (profile.role !== "admin") {
    redirect("/");
  }

  const { data: members, error: listErr } = await supabase
    .from("profiles")
    .select("id, email, display_name, role, created_at, updated_at")
    .order("created_at", { ascending: false });

  return (
    <div className="min-h-screen bg-background">
      <AppHeader
        title="회원 관리"
        subtitle="관리자 전용"
        profile={profile}
      />
      <main className="mx-auto max-w-4xl px-4 py-8">
        <Card>
          <CardHeader>
            <CardTitle>등록 회원</CardTitle>
            <CardDescription>
              Supabase `public.profiles` 와 연동됩니다. 첫 관리자는 SQL로
              지정하세요 (README 참고).
            </CardDescription>
          </CardHeader>
          <CardContent className="overflow-x-auto">
            {listErr ? (
              <p className="text-destructive">{listErr.message}</p>
            ) : (
              <table className="w-full min-w-[640px] border-collapse text-left text-sm">
                <thead>
                  <tr className="border-b border-border">
                    <th className="p-2 font-medium">이메일</th>
                    <th className="p-2 font-medium">표시 이름</th>
                    <th className="p-2 font-medium">역할</th>
                    <th className="p-2 font-medium">가입일</th>
                  </tr>
                </thead>
                <tbody>
                  {(members as Profile[] | null)?.map((m) => (
                    <tr
                      key={m.id}
                      className="border-b border-border/60 hover:bg-muted/40"
                    >
                      <td className="p-2">{m.email ?? "—"}</td>
                      <td className="p-2">{m.display_name || "—"}</td>
                      <td className="p-2">
                        {m.role === "admin" ? "관리자" : "회원"}
                      </td>
                      <td className="p-2 text-muted-foreground">
                        {m.created_at
                          ? new Date(m.created_at).toLocaleString("ko-KR")
                          : "—"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
