"use client";

import { useTransition } from "react";

import { Button } from "@/components/ui/button";

import { deleteSavedQr } from "./actions";

type Props = {
  id: string;
};

export function DeleteSavedQrButton({ id }: Props) {
  const [pending, startTransition] = useTransition();

  return (
    <Button
      type="button"
      variant="destructive"
      size="sm"
      disabled={pending}
      onClick={() => {
        if (!confirm("이 저장 항목을 삭제할까요?")) return;
        startTransition(async () => {
          await deleteSavedQr(id);
        });
      }}
    >
      {pending ? "삭제 중…" : "삭제"}
    </Button>
  );
}
