-- 누가 무엇에 좋아요했는지는 본인만 본다. 글마다 좋아요 수는 계속 누구나 본다. 결정 0031.
--
-- 0003의 "좋아요는 누구나 본다"는 `using (true)`라, 다른 사람 id로 post_likes를 거르면
-- 그 사람이 좋아요한 글 목록이 그대로 나왔다. 화면이 부르지 않아도 anon 키로 요청을
-- 직접 보내면 뚫린다. 권한은 앱 코드가 아니라 RLS가 막는다 (규칙 9).
--
-- select를 본인 행으로 좁히면 `post_likes(count)` 임베드가 내 좋아요만 세어 수가 깨진다.
-- 그래서 수는 계산 컬럼 함수가 준다. 0004의 `liked_by_viewer`와 같은 모양이다.

drop policy "좋아요는 누구나 본다" on public.post_likes;

create policy "본인 좋아요만 본다"
on public.post_likes for select
using ((select auth.uid()) = user_id);

-- security definer다. RLS를 건너뛰어 모든 행을 세지만 돌려주는 것은 수 하나뿐이라
-- 누가 눌렀는지는 새지 않는다. 기본키 앞부분(post_id, 0003_post_likes.sql:15)이 받는다.
create function public.like_count(post public.posts)
returns integer
language sql
stable
security definer
set search_path = ''
as $$
	select count(*)::integer
	from public.post_likes
	where post_likes.post_id = post.id;
$$;
