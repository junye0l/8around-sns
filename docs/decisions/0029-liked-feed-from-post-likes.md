# 0029. 좋아요한 글 피드는 `post_likes`에서 출발해 글을 임베드한다

- 상태: 확정
- 날짜: 2026-09-14

## 맥락

사용자가 요청한 화면이다. 내가 좋아요한 글만, **좋아요를 누른 시각**의 역순으로 본다.
글이 쓰인 시각이 아니다.

정렬 기준이 `post_likes.created_at`에 있다. 그런데 기존 피드 셋은 전부 `posts`의 행에
`POST_SELECT`를 붙이고 `posts.created_at`으로 줄 세운다 (`lib/queries/post.ts`).
팔로잉 피드는 거르는 일을 DB 함수 `following_posts()`에 맡겼다 (결정 0025).

`0003_post_likes.sql:17-19`가 user_id 단독 질의가 생기면 인덱스를 더하라고 미뤄뒀다.
기본키 `(post_id, user_id)`는 user_id가 뒤라 이 질의를 받지 못한다.

## 선택지

**A. `post_likes`에서 출발해 `posts`를 임베드한다** — 인덱스 하나만 더한다

- `post_likes?user_id=eq.<me>&order=created_at.desc&limit=50`에 `post:posts(POST_SELECT)`를 붙인다.
  한 번이고, 정렬이 PostgREST의 `order`로 명시된다
- 임베드 안에서 `POST_SELECT`와 `toFeedPost`를 그대로 쓴다. 앱 코드에 두 벌이 생기지 않는다 (규칙 2)
- 보는 사람 id를 앱이 넘긴다. `getSessionUserId`가 네트워크 없이 꺼내므로(결정 0023)
  왕복이 늘지 않고 프로필 조회와 나란히 간다
- 마이그레이션은 `(user_id, created_at desc)` 인덱스 하나다. 함수도 새 권한 표면도 없다

**B. `following_posts()`처럼 `liked_posts()` 함수가 `setof posts`를 돌려준다**

- 0025와 모양이 같다. id를 앱이 넘기지 않는다
- `setof posts`에는 좋아요 시각이 없다. PostgREST의 `order`는 돌려받은 행의 컬럼으로만
  정렬하므로 누른 시각으로 줄 세울 수 없다. 함수 안의 `order by`는 바깥 `select`가
  그 순서를 지킨다는 보장이 없다
- 시각을 꺼내려면 계산 컬럼(`liked_at(posts)`)을 하나 더 만들어야 하고, 행마다 `post_likes`를 다시 찾는다

**C. 좋아요 시각까지 담은 표 모양을 돌려주는 함수**

- 정렬은 함수 안에서 확실하다
- `returns table(...)`은 `posts`가 아니라서 `profiles`, `comments(count)` 같은 임베드와
  계산 컬럼이 붙지 않는다. `POST_SELECT`를 SQL로 다시 써야 한다 (규칙 2 위반)

## 결정

**A.** 정렬 기준이 있는 테이블에서 출발하는 것이 PostgREST가 순서를 보장하는 유일한 모양이고,
함수를 만들 이유(보는 사람 id를 앱이 모름)가 결정 0023 이후로 사라졌다.

RLS는 그대로다. "좋아요는 누구나 본다"(`0003_post_likes.sql`)와 "게시글은 누구나 본다"
(`0001_init.sql`)가 두 테이블을 각각 본다. `user_id` 필터는 권한이 아니라 "누구의 목록인가"다.

## 따라온 것

- `supabase/migrations/0006_post_likes_user_idx.sql` 인덱스 하나. 생성 타입에는 변화가 없다
- 좋아요 목록은 공개 정책이라, 같은 질의에 다른 사람 id를 넣으면 남이 좋아요한 글도 읽힌다.
  지금은 화면이 없고 막을 이유도 정책에 없다. 비공개로 바꾸려면 앱이 아니라 정책을 고친다 (규칙 9)
- 여기서 좋아요를 취소해도 글은 목록에 남는다. 결정 0024대로 화면을 다시 그리지 않아서다
