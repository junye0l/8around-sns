-- 8around SNS 초기 스키마
--
-- 이 파일이 스키마의 유일한 출처다 (AGENTS.md 규칙 3).
-- 대시보드에서 손으로 고치지 않는다. 바꿀 일이 생기면 새 마이그레이션 파일을 만든다.
--
-- 권한은 전부 RLS에서 처리한다 (규칙 9). 앱 코드에 소유권 체크를 중복으로 두지 않는다.

-- ─────────────────────────────────────────────────────────────
-- profiles
-- ─────────────────────────────────────────────────────────────

create table public.profiles (
	id uuid primary key references auth.users (id) on delete cascade,
	username text not null unique,
	display_name text not null,
	bio text,
	created_at timestamptz not null default now(),

	-- 소문자 영숫자와 밑줄만. URL에 그대로 쓰기 위해서다
	constraint profiles_username_format check (username ~ '^[a-z0-9_]{3,20}$'),
	constraint profiles_display_name_length check (
		char_length(display_name) between 1 and 30
	),
	constraint profiles_bio_length check (bio is null or char_length(bio) <= 160)
);

-- 가입과 동시에 프로필을 만든다. 앱에서 두 번 나눠 쓰면 auth 유저만 남고
-- 프로필이 없는 상태가 생길 수 있다. 트리거면 같은 트랜잭션에서 끝난다.
create function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
	insert into public.profiles (id, username, display_name)
	values (
		new.id,
		new.raw_user_meta_data ->> 'username',
		coalesce(
			new.raw_user_meta_data ->> 'display_name',
			new.raw_user_meta_data ->> 'username'
		)
	);
	return new;
end;
$$;

create trigger on_auth_user_created
after insert on auth.users
for each row execute function public.handle_new_user();

-- ─────────────────────────────────────────────────────────────
-- posts
-- ─────────────────────────────────────────────────────────────

create table public.posts (
	id uuid primary key default gen_random_uuid(),
	author_id uuid not null references public.profiles (id) on delete cascade,
	content text not null,
	created_at timestamptz not null default now(),

	-- 길이 상한은 디자인 문서에 없다. 무한 입력만 막는 공학적 방어선이다
	constraint posts_content_length check (char_length(content) between 1 and 2000)
);

-- 피드는 최신순 단일 정렬이다
create index posts_created_at_idx on public.posts (created_at desc);
create index posts_author_id_idx on public.posts (author_id);

-- ─────────────────────────────────────────────────────────────
-- comments — parent_id 자기 참조로 대댓글을 만든다
-- ─────────────────────────────────────────────────────────────

create table public.comments (
	id uuid primary key default gen_random_uuid(),
	post_id uuid not null references public.posts (id) on delete cascade,
	author_id uuid not null references public.profiles (id) on delete cascade,
	parent_id uuid references public.comments (id) on delete cascade,
	content text not null,
	created_at timestamptz not null default now(),

	constraint comments_content_length check (
		char_length(content) between 1 and 1000
	)
);

create index comments_post_id_idx on public.comments (post_id, created_at);
create index comments_parent_id_idx on public.comments (parent_id);

-- ─────────────────────────────────────────────────────────────
-- follows
-- ─────────────────────────────────────────────────────────────

create table public.follows (
	follower_id uuid not null references public.profiles (id) on delete cascade,
	following_id uuid not null references public.profiles (id) on delete cascade,
	created_at timestamptz not null default now(),

	primary key (follower_id, following_id),
	constraint follows_no_self check (follower_id <> following_id)
);

-- 팔로워 목록 조회용. 팔로잉 목록은 기본키 앞부분이 커버한다
create index follows_following_id_idx on public.follows (following_id);

-- ─────────────────────────────────────────────────────────────
-- RLS — 읽기는 공개, 쓰기는 본인만
-- ─────────────────────────────────────────────────────────────

alter table public.profiles enable row level security;
alter table public.posts enable row level security;
alter table public.comments enable row level security;
alter table public.follows enable row level security;

-- profiles
create policy "프로필은 누구나 본다"
on public.profiles for select
using (true);

create policy "본인 프로필만 수정한다"
on public.profiles for update
using ((select auth.uid()) = id)
with check ((select auth.uid()) = id);

-- insert 정책은 두지 않는다. 프로필 생성은 handle_new_user 트리거만 한다

-- posts
create policy "게시글은 누구나 본다"
on public.posts for select
using (true);

create policy "본인만 게시글을 쓴다"
on public.posts for insert
with check ((select auth.uid()) = author_id);

create policy "본인 게시글만 수정한다"
on public.posts for update
using ((select auth.uid()) = author_id)
with check ((select auth.uid()) = author_id);

create policy "본인 게시글만 지운다"
on public.posts for delete
using ((select auth.uid()) = author_id);

-- comments
create policy "댓글은 누구나 본다"
on public.comments for select
using (true);

-- 대댓글은 1뎁스까지만 편다. 부모가 이미 자식이면 거절한다.
-- CHECK 제약은 다른 행을 볼 수 없어서 여기서 막는다.
-- ponytail: service_role은 RLS를 우회하므로 깊이 제한도 우회된다.
-- 관리자 경로가 생기면 트리거로 옮긴다.
create policy "본인만 댓글을 쓰고 대댓글은 1뎁스까지다"
on public.comments for insert
with check (
	(select auth.uid()) = author_id
	and (
		parent_id is null
		or exists (
			-- 바깥 행은 반드시 comments. 으로 한정한다.
			-- 한정하지 않으면 서브쿼리의 parent 컬럼으로 해석된다
			select 1
			from public.comments parent
			where parent.id = comments.parent_id
				and parent.parent_id is null
				and parent.post_id = comments.post_id
		)
	)
);

create policy "본인 댓글만 수정한다"
on public.comments for update
using ((select auth.uid()) = author_id)
with check ((select auth.uid()) = author_id);

create policy "본인 댓글만 지운다"
on public.comments for delete
using ((select auth.uid()) = author_id);

-- follows
create policy "팔로우 관계는 누구나 본다"
on public.follows for select
using (true);

create policy "본인 이름으로만 팔로우한다"
on public.follows for insert
with check ((select auth.uid()) = follower_id);

create policy "본인이 건 팔로우만 푼다"
on public.follows for delete
using ((select auth.uid()) = follower_id);
