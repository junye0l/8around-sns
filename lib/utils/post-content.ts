import { z } from "zod";

/**
 * 본문 길이 상한. 값의 출처는 `supabase/migrations/0001_init.sql:66`의
 * `posts_content_length` 제약(1~2000)이고, 여기는 같은 값을 옮겨 적은 것이다.
 *
 * `lib/utils/username.ts`와 같은 이유로 둘에 적힌다(규칙 3) — 진짜 방어는 DB 제약이고
 * 이쪽은 문구와 입력 상한용이다. 어긋나면 이 파일을 SQL에 맞춘다.
 */
export const POST_CONTENT_MAX = 2000;

export const postContentSchema = z
	// DB 제약은 저장되는 값을 보므로, 잘라낸 뒤의 길이로 판정해야 어긋나지 않는다
	.string()
	.trim()
	.min(1, "내용을 입력해 주세요")
	.max(POST_CONTENT_MAX, `${POST_CONTENT_MAX}자까지 쓸 수 있어요`);
