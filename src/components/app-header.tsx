import Link from "next/link";

import { LogoutButton } from "@/components/logout-button";
import type { Profile } from "@/types/profile";

type Props = {
  title: string;
  subtitle?: string | null;
  profile: Profile | null;
};

export function AppHeader({ title, subtitle, profile }: Props) {
  const isAdmin = profile?.role === "admin";

  return (
    <header className="border-b border-border bg-card/50">
      <div className="mx-auto flex max-w-3xl flex-wrap items-center justify-between gap-3 px-4 py-3">
        <div>
          <h1 className="font-heading text-lg font-semibold text-foreground">
            {title}
          </h1>
          {subtitle ? (
            <p className="text-xs text-muted-foreground">{subtitle}</p>
          ) : null}
        </div>
        <nav className="flex flex-wrap items-center gap-2">
          <Link
            href="/"
            className="text-sm font-medium text-primary underline-offset-4 hover:underline"
          >
            QR
          </Link>
          <Link
            href="/saved"
            className="text-sm font-medium text-primary underline-offset-4 hover:underline"
          >
            저장된 QR
          </Link>
          <Link
            href="/profile"
            className="text-sm font-medium text-primary underline-offset-4 hover:underline"
          >
            내 정보
          </Link>
          {isAdmin ? (
            <Link
              href="/admin/members"
              className="text-sm font-medium text-primary underline-offset-4 hover:underline"
            >
              회원 관리
            </Link>
          ) : null}
          <LogoutButton />
        </nav>
      </div>
    </header>
  );
}
