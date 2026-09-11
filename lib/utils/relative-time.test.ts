import { describe, expect, it } from "vitest";
import { formatRelativeTime } from "./relative-time";

const NOW = new Date("2026-09-11T12:00:00Z");
const ago = (ms: number) => new Date(NOW.getTime() - ms).toISOString();

describe("formatRelativeTime", () => {
	it("1분 미만은 '방금 전'이다", () => {
		expect(formatRelativeTime(ago(0), NOW)).toBe("방금 전");
		expect(formatRelativeTime(ago(59_000), NOW)).toBe("방금 전");
	});

	it("분·시간·일 단위로 내려간다", () => {
		expect(formatRelativeTime(ago(60_000), NOW)).toBe("1분 전");
		expect(formatRelativeTime(ago(90 * 60_000), NOW)).toBe("1시간 전");
		expect(formatRelativeTime(ago(3 * 86_400_000), NOW)).toBe("3일 전");
	});

	it("일주일이 넘으면 한국 시각 기준 날짜로 바꾼다", () => {
		// UTC로 읽으면 9월 3일이다. Asia/Seoul(+9)이라야 9월 4일이 된다
		expect(formatRelativeTime("2026-09-03T16:30:00Z", NOW)).toBe(
			"2026년 9월 4일",
		);
	});

	it("미래 시각도 음수로 새지 않는다", () => {
		expect(formatRelativeTime(ago(-60_000), NOW)).toBe("방금 전");
	});
});
