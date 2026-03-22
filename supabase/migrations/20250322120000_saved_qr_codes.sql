-- 회원별 저장 QR → public.saved_qr_codes 테이블 생성
-- Supabase 대시보드 → SQL Editor → 아래 전체 붙여넣기 → Run

create table if not exists public.saved_qr_codes (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  content text not null,
  note text not null default '',
  created_at timestamptz not null default now(),
  constraint saved_qr_codes_content_len check (char_length(content) <= 2048),
  constraint saved_qr_codes_note_len check (char_length(note) <= 200)
);

comment on table public.saved_qr_codes is '회원이 저장한 QR 페이로드(텍스트)';

create index if not exists saved_qr_codes_user_created_idx
  on public.saved_qr_codes (user_id, created_at desc);

-- JWT(authenticated) 클라이언트가 RLS와 함께 접근하도록
grant select, insert, delete on table public.saved_qr_codes to authenticated;
grant all on table public.saved_qr_codes to service_role;

alter table public.saved_qr_codes enable row level security;

drop policy if exists "saved_qr_select_own" on public.saved_qr_codes;
create policy "saved_qr_select_own"
  on public.saved_qr_codes
  for select
  to authenticated
  using (auth.uid() = user_id);

drop policy if exists "saved_qr_insert_own" on public.saved_qr_codes;
create policy "saved_qr_insert_own"
  on public.saved_qr_codes
  for insert
  to authenticated
  with check (auth.uid() = user_id);

drop policy if exists "saved_qr_delete_own" on public.saved_qr_codes;
create policy "saved_qr_delete_own"
  on public.saved_qr_codes
  for delete
  to authenticated
  using (auth.uid() = user_id);

-- 관리자 전체 조회 (public.profiles 가 이미 있을 때만 생성)
drop policy if exists "saved_qr_select_admin" on public.saved_qr_codes;
do $block$
begin
  if exists (
    select 1
    from information_schema.tables
    where table_schema = 'public'
      and table_name = 'profiles'
  ) then
    execute $policy$
      create policy "saved_qr_select_admin"
        on public.saved_qr_codes
        for select
        to authenticated
        using (
          exists (
            select 1 from public.profiles p
            where p.id = auth.uid() and p.role = 'admin'
          )
        )
    $policy$;
  end if;
end
$block$;
