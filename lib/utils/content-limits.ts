/**
 * 본문 길이 상한. 값의 출처는 마이그레이션의 CHECK 제약이고 여기는 옮겨 적은 것이다 —
 * 게시글 1~2000(`supabase/migrations/0001_init.sql:64`), 댓글 1~1000(같은 파일 83-85).
 *
 * `lib/utils/username.ts`와 같은 이유로 두 곳에 적힌다(규칙 3) — 진짜 방어는 DB 제약이고
 * 이쪽은 문구와 입력 상한용이다. 어긋나면 이 파일을 SQL에 맞춘다.
 *
 * 스키마(`lib/utils/content.ts`)와 다른 파일에 있는 이유: 이 숫자는 클라이언트 컴포넌트
 * (`components/post/post-compose.ts`)까지 가는데, 같은 파일에 zod가 있으면 그 숫자 하나
 * 때문에 zod 전체가 브라우저 번들에 딸려 간다. 프로덕션은 트리셰이킹이 걷어내지만
 * dev 번들에서 1 MB였다.
 */
export const POST_CONTENT_MAX = 2000;
export const COMMENT_CONTENT_MAX = 1000;
