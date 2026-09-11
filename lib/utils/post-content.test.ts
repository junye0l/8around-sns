import { describe, expect, it } from "vitest";
import { POST_CONTENT_MAX, postContentSchema } from "./post-content";

const parse = (value: string) => postContentSchema.safeParse(value);

describe("postContentSchema", () => {
	it("앞뒤 공백을 잘라낸 값을 돌려준다", () => {
		const result = parse("  안녕  ");
		expect(result.success && result.data).toBe("안녕");
	});

	it("공백만 있으면 막는다", () => {
		expect(parse("   \n ").success).toBe(false);
		expect(parse("").success).toBe(false);
	});

	it("상한은 잘라낸 뒤 길이로 잰다", () => {
		// 공백 포함 2002자지만 잘라내면 2000자다. DB 제약도 저장값을 본다
		expect(parse(` ${"가".repeat(POST_CONTENT_MAX)} `).success).toBe(true);
		expect(parse("가".repeat(POST_CONTENT_MAX + 1)).success).toBe(false);
	});
});
