import { describe, expect, it } from "vitest";
import { escapeLike } from "./escape-like";

describe("escapeLike", () => {
	it("와일드카드와 역슬래시를 글자로 바꾼다", () => {
		expect(escapeLike("hong_gil%\\")).toBe("hong\\_gil\\%\\\\");
	});

	it("특수 문자가 없으면 그대로다", () => {
		expect(escapeLike("홍길동")).toBe("홍길동");
	});
});
