import { redirect } from "next/navigation";

import { AppHeader } from "@/components/app-header";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createClient } from "@/lib/supabase/server";
import type { Profile } from "@/types/profile";

import { updateDisplayName } from "./actions";

export default async function ProfilePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: row, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .maybeSingle();

  if (error) {
    return (
      <div className="min-h-screen bg-background p-6">
        <p className="text-destructive">
          프로필을 불러오지 못했습니다. Supabase에 `profiles` 테이블 마이그레이션을
          적용했는지 확인해 주세요. ({error.message})
        </p>
      </div>
    );
  }

  const profile = row as Profile | null;

  return (
    <div className="min-h-screen bg-background">
      <AppHeader
        title="내 정보"
        subtitle={user.email ?? undefined}
        profile={profile}
      />
      <main className="mx-auto max-w-md px-4 py-10">
        <Card>
          <CardHeader>
            <CardTitle>프로필</CardTitle>
            <CardDescription>
              표시 이름은 QR 앱 내에서만 사용됩니다. 이메일은 Supabase Auth에서
              관리됩니다.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form action={updateDisplayName} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">이메일 (읽기 전용)</Label>
                <Input
                  id="email"
                  type="email"
                  value={user.email ?? ""}
                  readOnly
                  disabled
                  className="opacity-80"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="display_name">표시 이름</Label>
                <Input
                  id="display_name"
                  name="display_name"
                  defaultValue={profile?.display_name ?? ""}
                  placeholder="이름 또는 닉네임"
                  maxLength={120}
                  autoComplete="nickname"
                />
              </div>
              <div className="text-sm text-muted-foreground">
                역할:{" "}
                <span className="font-medium text-foreground">
                  {profile?.role === "admin" ? "관리자" : "회원"}
                </span>
              </div>
              <Button type="submit">저장</Button>
            </form>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
