"use client";

import { useState } from "react";
import { SignInForm } from "@/components/auth/SignInForm";
import { SignUpForm } from "@/components/auth/SignUpForm";
import { Button } from "@/components/ui/Button";

type Mode = "signup" | "signin";

const PANEL = {
	signup: {
		title: "이미 계정이 있나요?",
		body: "로그인하면 보던 글을 이어서 볼 수 있어요.",
		action: "로그인하기",
	},
	signin: {
		title: "처음 오셨나요?",
		body: "생각을 짧게 나누는 공간, 8around예요.",
		action: "가입하기",
	},
} as const;

const PATH = { signup: "/signup", signin: "/login" } as const;

/**
 * 가입 · 로그인 2단 카드. 오버레이가 비활성 쪽을 덮으며 미끄러진다.
 *
 * 슬라이드를 넣으면 두 폼이 한 DOM에 같이 있어야 한다. 거기서 오는 비용 셋을 막는다.
 * - 접근성 — 덮인 폼은 눈에만 안 보이지 Tab과 스크린리더에는 그대로 잡힌다. `inert`로 끈다
 * - URL — 라우트 이동 없이 바꾸므로 replaceState로 주소만 맞춰 둔다.
 *   /signup, /login 이 각자 살아 있어야 미들웨어가 보호 라우트에서 보낼 곳이 생긴다
 * - 자동완성 — 비밀번호 칸이 둘이라 new-password / current-password 를 각 폼에 붙였다
 *
 * 모바일(<md)에서는 슬라이드하지 않는다. 400px에 2단을 밀어 넣으면 읽히지 않는다
 * (DESIGN.md §5 Responsive). 활성 폼만 보여주고 아래 버튼으로 바꾼다.
 */
export function AuthPanels({ initial }: { initial: Mode }) {
	const [mode, setMode] = useState<Mode>(initial);
	const other: Mode = mode === "signup" ? "signin" : "signup";
	const panel = PANEL[mode];

	const toggle = () => {
		setMode(other);
		// 라우트를 갈아타면 컴포넌트가 다시 마운트되어 슬라이드가 끊긴다.
		// 주소만 바꿔 새로고침·공유 때 맞는 화면이 열리게 한다.
		window.history.replaceState(null, "", PATH[other]);
	};

	return (
		<main className="flex flex-1 items-center justify-center px-4 py-12">
			<div className="relative w-full max-w-3xl overflow-hidden rounded-md border border-hairline bg-canvas">
				<div className="grid md:grid-cols-2">
					<div
						className={`p-8 ${mode === "signup" ? "" : "hidden md:block"}`}
						inert={mode !== "signup"}
					>
						<SignUpForm />
					</div>
					<div
						className={`p-8 ${mode === "signin" ? "" : "hidden md:block"}`}
						inert={mode !== "signin"}
					>
						<SignInForm />
					</div>
				</div>

				{/* 데스크톱에서만 미끄러진다. 비활성 쪽을 덮는다 */}
				<div
					className={`absolute inset-y-0 left-0 hidden w-1/2 flex-col items-center justify-center gap-4 bg-brand-tint p-8 text-center transition-transform duration-[var(--motion-page)] ease-(--ease-standard) md:flex ${
						mode === "signup" ? "translate-x-full" : "translate-x-0"
					}`}
				>
					<h2 className="text-title text-fg">{panel.title}</h2>
					<p className="text-body-sm text-fg-muted">{panel.body}</p>
					<Button
						className="mt-2 w-auto px-8"
						onClick={toggle}
						variant="outline"
					>
						{panel.action}
					</Button>
				</div>

				{/* 모바일 전환 */}
				<div className="border-hairline border-t p-8 pt-6 text-center md:hidden">
					<p className="text-body-sm text-fg-muted">{panel.title}</p>
					<Button className="mt-4" onClick={toggle} variant="outline">
						{panel.action}
					</Button>
				</div>
			</div>
		</main>
	);
}
