-- 팔로잉 피드. 보는 사람이 팔로우하는 사람들의 글을 DB가 한 번에 거른다.
--
-- 앱은 지금 세 번을 차례로 간다 — 내 id, 팔로우 목록, 그 목록으로 글
-- (`lib/queries/post.ts`의 `listFollowingFeed`). PostgREST가 서브쿼리를 못 받아서 그랬다.
-- 함수로 옮기면 한 번이고, 보는 사람 id를 앱이 넘기지 않아도 된다 —
-- 0004와 같은 이유로 요청의 JWT에서 auth.uid()를 꺼낸다. 결정 0025.
--
-- setof posts 를 돌려주므로 PostgREST가 posts 테이블처럼 다룬다. 임베드(profiles, comments,
-- post_likes)와 계산 컬럼(liked_by_viewer), order, limit 이 그대로 붙는다.
--
-- security invoker(기본값)다. "게시글은 누구나 본다"(0001_init.sql) RLS가 그대로 적용된다.
-- `posts_author_id_idx`(0001_init.sql:69)가 in 필터를 받고, follows 는 기본키 앞부분
-- (follower_id)이 받는다.

create function public.following_posts()
returns setof public.posts
language sql
stable
set search_path = ''
as $$
	select posts.*
	from public.posts
	where posts.author_id in (
		select follows.following_id
		from public.follows
		where follows.follower_id = (select auth.uid())
	);
$$;
