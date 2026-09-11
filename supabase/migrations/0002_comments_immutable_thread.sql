-- 댓글의 스레드 위치를 고정한다.
--
-- 0001의 INSERT 정책은 대댓글을 1뎁스로 막지만 UPDATE는 author_id만 본다.
-- RLS의 WITH CHECK는 NEW 행만 보므로 "이 컬럼은 이전 값과 같아야 한다"를 표현할 수 없다.
-- 그래서 트리거로 막는다.
--
-- 막지 않으면 이런 우회가 가능하다:
--   1. C1(최상위) 작성 → 통과
--   2. C2(parent = C1) 작성 → depth 1, 통과
--   3. update comments set parent_id = C2.id where id = C1.id
--      → C1 ↔ C2 순환 참조. 1뎁스 불변식이 깨진다
--
-- post_id도 같다. 본인 댓글을 다른 글의 스레드로 옮길 수 있다.

create function public.freeze_comment_thread()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
	if new.parent_id is distinct from old.parent_id then
		raise exception '댓글의 부모는 바꿀 수 없습니다';
	end if;

	if new.post_id is distinct from old.post_id then
		raise exception '댓글이 달린 게시글은 바꿀 수 없습니다';
	end if;

	return new;
end;
$$;

-- 트리거는 service_role도 거친다. RLS와 달리 우회되지 않는다
create trigger comments_freeze_thread
before update on public.comments
for each row execute function public.freeze_comment_thread();
