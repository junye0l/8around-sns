import { z } from "zod";

/**
 * 본문 길이 상한. 값의 출처는 마이그레이션의 CHECK 제약이고 여기는 옮겨 적은 것이다 —
 * 게시글 1~2000(`supabase/migrations/0001_init.sql:64`), 댓글 1~1000(같은 파일 83-85).
 *
 * `lib/utils/username.ts`와 같은 이유로 두 곳에 적힌다(규칙 3) — 진짜 방어는 DB 제약이고
 * 이쪽은 문구와 입력 상한용이다. 어긋나면 이 파일을 SQL에 맞춘다.
 */
export const POST_CONTENT_MAX = 2000;
export const COMMENT_CONTENT_MAX = 1000;

/** 게시글과 댓글은 상한만 다르고 판정이 같다. 두 벌로 적지 않는다 (규칙 2) */
export function contentSchema(max: number) {
	return (
		z
			// DB 제약은 저장되는 값을 보므로, 잘라낸 뒤의 길이로 판정해야 어긋나지 않는다
			.string()
			.trim()
			.min(1, "내용을 입력해 주세요")
			.max(max, `${max}자까지 쓸 수 있어요`)
	);
}
