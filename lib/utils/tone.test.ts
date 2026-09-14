import { describe, expect, it } from "vitest";
import { TONES, toneOf } from "@/lib/utils/tone";

describe("toneOf", () => {
	it("같은 입력은 늘 같은 톤이다", () => {
		expect(toneOf("사진")).toBe(toneOf("사진"));
	});

	it("빈 글자도 톤 하나를 돌려준다", () => {
		expect(TONES).toContain(toneOf(""));
	});

	it("입력이 달라지면 여섯 톤이 다 나온다", () => {
		const seen = new Set(
			Array.from({ length: 200 }, (_, i) => toneOf(`user-${i}`)),
		);
		expect(seen.size).toBe(TONES.length);
	});

	it("이모지처럼 두 코드 유닛인 글자도 받는다", () => {
		expect(TONES).toContain(toneOf("\u{1F3B8}"));
	});
});
