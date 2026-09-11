import type { Metadata } from "next";
import "./globals.css";

/**
 * `template`은 각 라우트가 준 제목 뒤에 앱 이름을 붙인다. 스크린리더는 라우트가
 * 바뀔 때 문서 제목으로 위치를 알므로, 모든 화면이 같은 제목이면 알 방법이 없다.
 */
export const metadata: Metadata = {
	title: { default: "8around", template: "%s · 8around" },
	description: "생각을 짧게 나누는 공간",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
	return (
		<html lang="ko" className="h-full antialiased">
			<body className="flex min-h-full flex-col">{children}</body>
		</html>
	);
}
