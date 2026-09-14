import { describe, expect, it } from "vitest";
import {
	interestLength,
	interestsError,
	normalizeInterests,
} from "./interests";

describe("normalizeInterests", () => {
	it("앞뒤 공백을 지우고 빈 값과 중복을 빼며 순서를 지킨다", () => {
		expect(normalizeInterests([" 운동", "", "  ", "AI", "운동 "])).toEqual([
			"운동",
			"AI",
		]);
	});
});

describe("interestsError", () => {
	it("3개, 한 개에 2글자까지 받는다", () => {
		expect(interestsError(["운동", "맛집", "AI"])).toBeNull();
		expect(interestsError([])).toBeNull();
	});

	it("4개 이상이거나 3글자 이상이면 막는다", () => {
		expect(interestsError(["운동", "맛집", "AI", "여행"])).not.toBeNull();
		expect(interestsError(["프론트"])).not.toBeNull();
	});
});

describe("interestLength", () => {
	it("이모지를 한 글자로 센다", () => {
		expect(interestLength("🏃")).toBe(1);
		expect(interestLength("운동")).toBe(2);
	});
});
