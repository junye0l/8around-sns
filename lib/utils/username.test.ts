import { describe, expect, it } from "vitest";
import { usernameSchema } from "./username";

const ok = (value: string) => usernameSchema.safeParse(value).success;

describe("usernameSchema", () => {
	it("영문 소문자·숫자·밑줄 3~20자를 통과시킨다", () => {
		expect(ok("abc")).toBe(true);
		expect(ok("hong_gil_dong_99")).toBe(true);
		expect(ok("a".repeat(20))).toBe(true);
	});

	it("길이를 벗어나면 막는다", () => {
		expect(ok("ab")).toBe(false);
		expect(ok("a".repeat(21))).toBe(false);
	});

	it("대문자·한글·공백·기호를 막는다", () => {
		expect(ok("Alice")).toBe(false);
		expect(ok("홍길동")).toBe(false);
		expect(ok("hong gil")).toBe(false);
		expect(ok("hong-gil")).toBe(false);
	});
});
