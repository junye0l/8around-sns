"use client";

import { useState } from "react";
import { SignInForm } from "@/components/auth/SignInForm";
import { SignUpForm } from "@/components/auth/SignUpForm";
import { BrandMark } from "@/components/ui/BrandMark";

type Mode = "signup" | "signin";

const COPY = {
	signup: {
		title: "회원가입",
		ask: "이미 계정이 있나요?",
		action: "로그인하기",
	},
	signin: { title: "로그인", ask: "처음 오셨나요?", action: "회원가입하기" },
} as const;

const PATH = { signup: "/signup", signin: "/login" } as const;

/**
 * 가입과 로그인 화면. 위에서부터 로고, 큰 제목, 소개 한 줄, 폼, 반대쪽으로 건너가는 줄이다.
 *
 * 768px 미만은 `canvas` 한 면이 화면을 채우고 건너가는 줄이 바닥 가운데에 선다 (결정 0034).
 * 이상은 `background` 위 가운데 400px 카드이고 건너가는 줄은 폼 아래 선 밑에 선다.
 * 로고는 두 폭 모두 왼쪽 정렬로 제목 위에 선다 (결정 0043).
 *
 * 전환은 라우트 이동 없이 `replaceState`로 주소만 맞춘다. `/signup`과 `/login`이
 * 각자 살아 있어야 미들웨어가 보호 라우트에서 보낼 곳이 생긴다 (결정 0004에서 남긴 것).
 * @see docs/DESIGN.md 로그인, 회원가입
 */
export function AuthPanels({ initial }: { initial: Mode }) {
	const [mode, setMode] = useState<Mode>(initial);
	const other: Mode = mode === "signup" ? "signin" : "signup";
	const copy = COPY[mode];

	const toggle = () => {
		setMode(other);
		window.history.replaceState(null, "", PATH[other]);
	};

	return (
		<main className="flex flex-1 flex-col bg-canvas px-3 py-6 md:items-center md:justify-center md:bg-background">
			<div className="flex w-full flex-1 flex-col md:max-w-100 md:flex-none md:rounded-sheet md:bg-canvas md:p-8 md:shadow-card">
				<BrandMark />
				<h1 className="mt-6 text-large-title text-fg">{copy.title}</h1>
				<p className="mt-1 break-keep text-callout text-fg-muted wrap-anywhere">
					생각을 짧게 나누는 곳이에요
				</p>

				<div className="mt-8">
					{mode === "signup" ? <SignUpForm /> : <SignInForm />}
				</div>

				{/* 모바일은 mt-auto로 바닥에 붙는다. 폼이 길어도 pt-6이 폼과의 간격을 지킨다 */}
				<div className="mt-auto flex flex-wrap items-baseline justify-center gap-x-2 gap-y-1 pt-6 text-callout md:mt-6 md:justify-start md:border-hairline md:border-t md:pt-5">
					<p className="text-fg-muted">{copy.ask}</p>
					{/* -m-1 p-1 은 글자를 움직이지 않고 누를 자리만 넓힌다 */}
					<button
						className="-m-1 rounded-lg p-1 font-bold text-primary transition duration-(--motion-fast) ease-(--ease-standard) focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary active:scale-97"
						onClick={toggle}
						type="button"
					>
						{copy.action}
					</button>
				</div>
			</div>
		</main>
	);
}
