-- 좋아요한 글 피드. 보는 사람이 누른 좋아요를 누른 시각의 역순으로 읽는다.
--
-- 0003_post_likes.sql:17-19가 미뤄둔 인덱스다. user_id 단독 질의가 이제 생겼다.
-- 기본키 (post_id, user_id)는 user_id가 뒤라 이 질의를 받지 못한다.
--
-- 앱은 post_likes 테이블에서 출발해 posts를 임베드한다 (`lib/queries/post.ts`의 `listLikedFeed`).
-- where user_id = ? order by created_at desc limit 50 을 이 인덱스 하나가 정렬 없이 받는다.
-- 함수를 만들지 않는 이유는 결정 0029.

create index post_likes_user_id_created_at_idx
on public.post_likes (user_id, created_at desc);
