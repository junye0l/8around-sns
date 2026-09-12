-- 보는 사람이 이 글에 좋아요를 눌렀는지. PostgREST의 계산 컬럼이다
-- (인자가 테이블 행 하나인 함수는 그 테이블의 컬럼처럼 select 된다).
--
-- 0003과 같은 작업이지만 파일을 나눈다. 0003은 이미 원격에 적용됐고
-- 적용된 마이그레이션은 고치지 않는다 (규칙 8).
--
-- 앱에서 "보는 사람의 id"를 질의마다 넘기지 않는 이유:
-- 넘기려면 화면이 프로필을 먼저 읽고 나서 글을 읽어야 한다. 지금은 둘을 동시에
-- 던지고 있어서(`app/page.tsx`) 왕복이 한 번 늘어난다. id는 이미 요청의 JWT에
-- 있으므로 DB가 그걸 그대로 쓴다.
--
-- 좋아요 수는 이 함수로 세지 않는다. `post_likes(count)` 임베드가 댓글 수와
-- 같은 방식으로 받는다 (규칙 2).

create function public.liked_by_viewer(post public.posts)
returns boolean
language sql
stable
set search_path = ''
as $$
	select exists (
		select 1
		from public.post_likes
		where post_likes.post_id = post.id
			and post_likes.user_id = (select auth.uid())
	);
$$;
