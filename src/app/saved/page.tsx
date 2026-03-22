import Link from "next/link";
import { redirect } from "next/navigation";

import { AppHeader } from "@/components/app-header";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { createClient } from "@/lib/supabase/server";
import type { Profile } from "@/types/profile";
import type { SavedQrCode } from "@/types/saved-qr";

import { DeleteSavedQrButton } from "./delete-button";

export default async function SavedQrPage() {
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

  const { data: rows, error } = await supabase
    .from("saved_qr_codes")
    .select("id, user_id, content, note, created_at")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  const items = (rows ?? []) as SavedQrCode[];

  return (
    <div className="min-h-screen bg-background">
      <AppHeader
        title="저장된 QR"
        subtitle={user.email ?? undefined}
        profile={profile}
      />
      <main className="mx-auto max-w-3xl px-4 py-8">
        {error ? (
          <p className="text-destructive">
            목록을 불러오지 못했습니다. `saved_qr_codes` 마이그레이션을 적용했는지
            확인하세요. ({error.message})
          </p>
        ) : items.length === 0 ? (
          <Card>
            <CardHeader>
              <CardTitle>저장된 항목이 없습니다</CardTitle>
              <CardDescription>
                홈에서 QR을 만든 뒤 「서버에 저장」을 눌러 보세요.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Link href="/" className={cn(buttonVariants())}>
                QR 만들기
              </Link>
            </CardContent>
          </Card>
        ) : (
          <ul className="space-y-3">
            {items.map((item) => (
              <li key={item.id}>
                <Card>
                  <CardHeader className="flex flex-row flex-wrap items-start justify-between gap-2 pb-2">
                    <div className="min-w-0 flex-1 space-y-1">
                      <CardTitle className="break-all text-base font-medium">
                        {item.content}
                      </CardTitle>
                      {item.note ? (
                        <CardDescription className="text-foreground/80">
                          메모: {item.note}
                        </CardDescription>
                      ) : null}
                      <p className="text-xs text-muted-foreground">
                        {new Date(item.created_at).toLocaleString("ko-KR")}
                      </p>
                    </div>
                    <DeleteSavedQrButton id={item.id} />
                  </CardHeader>
                </Card>
              </li>
            ))}
          </ul>
        )}
      </main>
    </div>
  );
}
