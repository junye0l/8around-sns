import type { Metadata } from "next";
import { cookies } from "next/headers";
import { parseTheme, THEME_COOKIE } from "@/lib/utils/theme";
import "./globals.css";

/**
 * `template`은 각 라우트가 준 제목 뒤에 앱 이름을 붙인다. 스크린리더는 라우트가
 * 바뀔 때 문서 제목으로 위치를 알므로, 모든 화면이 같은 제목이면 알 방법이 없다.
 */
export const metadata: Metadata = {
	title: { default: "8around", template: "%s · 8around" },
	description: "생각을 짧게 나누는 공간",
};

/**
 * 고른 테마를 쿠키에서 읽어 `data-theme`으로 박는다. 서버가 처음부터 맞는 색으로 그려서
 * 새로고침 때 반대 색이 번쩍이지 않는다. 시스템이면 속성을 두지 않고 CSS가 운영체제를 따른다. 결정 0040.
 */
export default async function RootLayout({ children }: LayoutProps<"/">) {
	const theme = parseTheme((await cookies()).get(THEME_COOKIE)?.value);

	return (
		<html
			lang="ko"
			className="h-full antialiased"
			data-theme={theme === "system" ? undefined : theme}
		>
			<body className="flex min-h-full flex-col">{children}</body>
		</html>
	);
}
