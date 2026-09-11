const MINUTE = 60_000;
const HOUR = 60 * MINUTE;
const DAY = 24 * HOUR;
const WEEK = 7 * DAY;

/**
 * 게시글 시각 표기. 일주일이 넘으면 상대 표현이 오히려 안 읽혀서 날짜로 바꾼다.
 *
 * 서버 컴포넌트에서만 부른다 — 클라이언트가 다시 렌더하면 시간이 흘러 값이 달라지고
 * 하이드레이션이 어긋난다. 대신 렌더 시점에 고정되므로 새로고침 전까지 갱신되지 않는다.
 *
 * 타임존을 못박는 이유: Vercel 런타임은 UTC라 그냥 두면 한국 새벽에 쓴 글이 전날로 찍힌다.
 */
export function formatRelativeTime(
	iso: string,
	now: Date = new Date(),
): string {
	const then = new Date(iso);
	const diff = now.getTime() - then.getTime();

	// 미래 시각(시계 오차)도 여기로 떨어진다. 음수 분을 보여주지 않는다
	if (diff < MINUTE) return "방금 전";
	if (diff < HOUR) return `${Math.floor(diff / MINUTE)}분 전`;
	if (diff < DAY) return `${Math.floor(diff / HOUR)}시간 전`;
	if (diff < WEEK) return `${Math.floor(diff / DAY)}일 전`;

	return then.toLocaleDateString("ko-KR", {
		timeZone: "Asia/Seoul",
		year: "numeric",
		month: "long",
		day: "numeric",
	});
}
