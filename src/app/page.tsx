import { redirect } from "next/navigation";

import { AppHeader } from "@/components/app-header";
import { QrGenerator } from "@/components/qr-generator";
import { createClient } from "@/lib/supabase/server";
import type { Profile } from "@/types/profile";

export default async function HomePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: profileRow } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .maybeSingle();

  const profile = profileRow as Profile | null;

  return (
    <div className="min-h-screen bg-background">
      <AppHeader
        title="QR 코드 생성기"
        subtitle={user.email ?? undefined}
        profile={profile}
      />
      <main className="mx-auto flex max-w-3xl flex-col items-center px-4 py-10">
        {!profile ? (
          <p className="mb-6 max-w-md text-center text-sm text-destructive">
            `profiles` 테이블이 없거나 행이 없습니다. Supabase SQL
            마이그레이션을 실행한 뒤 새로고침하세요.
          </p>
        ) : null}
        <QrGenerator />
      </main>
    </div>
  );
}
