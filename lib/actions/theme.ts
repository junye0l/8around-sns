"use server";

import { cookies } from "next/headers";
import { parseTheme, THEME_COOKIE } from "@/lib/utils/theme";

/**
 * 고른 테마를 쿠키에 남긴다. 브라우저를 닫아도 남도록 1년 둔다. 시스템이면 쿠키를 지운다.
 * 로그인하지 않아도 부를 수 있다. 모르는 값은 `parseTheme`이 시스템으로 읽는다.
 * @see app/layout.tsx
 */
export async function setThemeAction(value: string) {
	const store = await cookies();
	const theme = parseTheme(value);

	if (theme === "system") store.delete(THEME_COOKIE);
	else
		store.set(THEME_COOKIE, theme, {
			maxAge: 60 * 60 * 24 * 365,
			path: "/",
			sameSite: "lax",
		});
}
