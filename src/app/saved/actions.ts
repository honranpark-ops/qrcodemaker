"use server";

import { revalidatePath } from "next/cache";

import { createClient } from "@/lib/supabase/server";
import { sanitizeQrInput } from "@/lib/qr";

export async function saveQrCode(content: string, note: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "로그인이 필요합니다." as const };
  }

  const sanitized = sanitizeQrInput(content);
  if (!sanitized.ok) {
    return { error: sanitized.error };
  }

  const n = note.trim().slice(0, 200);
  if (n.length > 200) {
    return { error: "메모는 200자 이하입니다." as const };
  }

  const { error } = await supabase.from("saved_qr_codes").insert({
    user_id: user.id,
    content: sanitized.value,
    note: n,
  });

  if (error) {
    if (
      error.message.includes("saved_qr_codes") ||
      error.message.includes("schema cache")
    ) {
      return {
        error:
          "저장용 테이블(saved_qr_codes)이 Supabase에 없습니다. 저장소의 supabase/migrations/20250322120000_saved_qr_codes.sql 을 SQL Editor에서 실행하세요." as const,
      };
    }
    return { error: error.message };
  }

  revalidatePath("/saved");
  revalidatePath("/");
  return { success: true as const };
}

export async function deleteSavedQr(id: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "로그인이 필요합니다." as const };
  }

  const { error } = await supabase
    .from("saved_qr_codes")
    .delete()
    .eq("id", id)
    .eq("user_id", user.id);

  if (error) {
    if (
      error.message.includes("saved_qr_codes") ||
      error.message.includes("schema cache")
    ) {
      return {
        error:
          "저장용 테이블이 없습니다. supabase/migrations/20250322120000_saved_qr_codes.sql 을 Supabase SQL Editor에서 실행하세요." as const,
      };
    }
    return { error: error.message };
  }

  revalidatePath("/saved");
  return { success: true as const };
}
