/** 고른 테마를 담는 쿠키 이름. 서버(`app/layout.tsx`)가 읽고 더 보기 메뉴가 쓴다 */
export const THEME_COOKIE = "theme";

/** 사용자가 고를 수 있는 테마. `system`은 운영체제 설정을 따른다 */
export type Theme = "light" | "dark" | "system";

/**
 * 쿠키나 `data-theme` 값을 테마로 읽는다. 모르는 값은 기본값인 `system`이다.
 * @see docs/decisions/0040-theme-switch.md
 */
export function parseTheme(value: string | null | undefined): Theme {
	return value === "light" || value === "dark" ? value : "system";
}
