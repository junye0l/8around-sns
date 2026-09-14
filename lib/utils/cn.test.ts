import { describe, expect, it } from "vitest";
import { cn } from "@/lib/utils/cn";

describe("cn", () => {
	it("뒤에 온 클래스가 같은 속성을 이긴다", () => {
		expect(cn("w-full", "w-auto")).toBe("w-auto");
	});

	it("크기 토큰과 색 토큰은 둘 다 남는다", () => {
		expect(cn("text-body", "text-canvas")).toBe("text-body text-canvas");
	});

	it("크기 토큰끼리는 뒤가 이긴다", () => {
		expect(cn("text-body", "text-body-sm")).toBe("text-body-sm");
	});

	it("이름이 다른 색 토큰끼리도 뒤가 이긴다", () => {
		expect(cn("text-fg-muted hover:text-fg", "text-fg")).toBe(
			"hover:text-fg text-fg",
		);
	});

	it("거짓값은 건너뛴다", () => {
		expect(cn("text-fg", false, undefined, "")).toBe("text-fg");
	});
});
