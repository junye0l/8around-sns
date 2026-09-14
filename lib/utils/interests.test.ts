import { describe, expect, it } from "vitest";
import {
	interestLength,
	interestsSchema,
	normalizeInterests,
} from "./interests";

const parse = (value: unknown) => interestsSchema.safeParse(value);

describe("normalizeInterests", () => {
	it("앞뒤 공백을 지우고 빈 값과 중복을 빼며 순서를 지킨다", () => {
		expect(normalizeInterests([" 운동", "", "  ", "AI", "운동 "])).toEqual([
			"운동",
			"AI",
		]);
	});
});

describe("interestsSchema", () => {
	it("다듬은 뒤 3개, 한 개에 2글자까지 받는다", () => {
		expect(parse([" 운동", "맛집", "AI", "운동"]).data).toEqual([
			"운동",
			"맛집",
			"AI",
		]);
		expect(parse([]).data).toEqual([]);
	});

	it("4개 이상, 3글자 이상, 배열이 아니거나 문자열이 아닌 원소는 막는다", () => {
		expect(parse(["운동", "맛집", "AI", "여행"]).success).toBe(false);
		expect(parse(["프론트"]).success).toBe(false);
		expect(parse("운동").success).toBe(false);
		expect(parse([1]).success).toBe(false);
	});
});

describe("interestLength", () => {
	it("이모지를 한 글자로 센다", () => {
		expect(interestLength("🏃")).toBe(1);
		expect(interestLength("운동")).toBe(2);
	});
});
