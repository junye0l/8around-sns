import { describe, expect, it } from "vitest";
import { displayNameSchema } from "./display-name";

const parse = (value: unknown) => displayNameSchema.safeParse(value);

describe("displayNameSchema", () => {
	it("앞뒤 공백을 지우고 한글, 대문자, 기호를 받는다", () => {
		expect(parse("  홍길동 Hong! ").data).toBe("홍길동 Hong!");
	});

	it("공백뿐이거나 31자 이상이면 막는다", () => {
		expect(parse("   ").success).toBe(false);
		expect(parse("가".repeat(31)).success).toBe(false);
		expect(parse("가".repeat(30)).success).toBe(true);
	});
});
