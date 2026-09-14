import { describe, expect, it } from "vitest";
import { parseTheme } from "@/lib/utils/theme";

describe("parseTheme", () => {
	it("라이트와 다크는 그대로 읽는다", () => {
		expect(parseTheme("light")).toBe("light");
		expect(parseTheme("dark")).toBe("dark");
	});

	it("없거나 모르는 값은 시스템이다", () => {
		expect(parseTheme(undefined)).toBe("system");
		expect(parseTheme(null)).toBe("system");
		expect(parseTheme("")).toBe("system");
		expect(parseTheme("Dark")).toBe("system");
	});
});
