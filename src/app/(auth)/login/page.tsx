import { Suspense } from "react";

import { LoginForm } from "./login-form";

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-background p-4 text-muted-foreground">
          불러오는 중…
        </div>
      }
    >
      <LoginForm />
    </Suspense>
  );
}
