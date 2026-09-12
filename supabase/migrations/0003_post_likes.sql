-- 게시글 좋아요.
--
-- 댓글에는 달지 않는다. 사용자가 요청한 범위가 게시글뿐이다 (결정 0020).
-- 나중에 댓글까지 넓히면 이 테이블을 고치지 않고 새 마이그레이션을 쓴다 (규칙 8).

create table public.post_likes (
	post_id uuid not null references public.posts (id) on delete cascade,
	user_id uuid not null references public.profiles (id) on delete cascade,
	created_at timestamptz not null default now(),

	-- 한 사람이 한 글에 한 번. 유일성을 기본키가 곧바로 보장한다.
	-- 앱에서 "이미 눌렀나"를 먼저 읽어 막지 않는다 — 그 읽기는 던지는 순간 낡는다
	primary key (post_id, user_id)
);

-- 인덱스를 따로 두지 않는다. 읽는 질의는 둘뿐이고 기본키가 둘 다 받는다.
-- 글마다 좋아요 수를 세는 것과(post_id 앞부분), 보는 사람이 눌렀는지 확인하는 것(전체 키).
-- "내가 좋아요한 글 목록" 같은 user_id 단독 질의가 생기면 그때 인덱스를 더한다

alter table public.post_likes enable row level security;

create policy "좋아요는 누구나 본다"
on public.post_likes for select
using (true);

create policy "본인 이름으로만 좋아요한다"
on public.post_likes for insert
with check ((select auth.uid()) = user_id);

create policy "본인이 누른 좋아요만 지운다"
on public.post_likes for delete
using ((select auth.uid()) = user_id);

-- update 정책은 두지 않는다. 좋아요에는 고칠 값이 없다. 취소는 삭제다
