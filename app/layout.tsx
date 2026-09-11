import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
	title: "8around",
	description: "생각을 짧게 나누는 공간",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
	return (
		<html lang="ko" className="h-full antialiased">
			<body className="flex min-h-full flex-col">{children}</body>
		</html>
	);
}
