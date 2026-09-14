"use client";

import { useState } from "react";
import { SignInForm } from "@/components/auth/SignInForm";
import { SignUpForm } from "@/components/auth/SignUpForm";
import { BrandMark } from "@/components/ui/BrandMark";

type Mode = "signup" | "signin";

const SWITCH = {
	signup: { ask: "이미 계정이 있나요?", action: "로그인하기" },
	signin: { ask: "처음 오셨나요?", action: "회원가입하기" },
} as const;

const PATH = { signup: "/signup", signin: "/login" } as const;

/**
 * 가입 · 로그인 한 컬럼. 폼 하나만 보이고 아래 한 줄로 반대쪽으로 건너간다.
 * Threads 로그인 화면의 배치다 ([결정 0016](../../docs/decisions/0016-threads-auth.md)).
 *
 * 로고는 왼쪽 레일과 같은 왼쪽 위 자리에 선다. 제목과 문구는 왼쪽 정렬이고, 건너가는 줄은
 * `hairline` 선 아래에 회색 문구와 검정 굵은 글자를 가로로 잇는다.
 * 768px 미만은 레일이 없으니 로고가 가운데로 오고, 폼은 위에서 시작하며, 건너가는 줄은 화면 바닥 가운데에 선다.
 * [결정 0034](../../docs/decisions/0034-auth-responsive.md).
 *
 * 바탕이 흰색이다. 카드가 없어졌으니 페이지가 곧 카드다. 회색 바탕 위에서는
 * 입력칸 테두리 `fg-muted`도 2.72:1이라 경계로 못 서고, 흰 바탕에서만 3.04:1이 된다 (결정 0016).
 * 입력칸 라벨이 테두리를 끊을 때 칠하는 색도 이 흰색이다 (결정 0026).
 *
 * 전환은 라우트 이동 없이 `replaceState`로 주소만 맞춘다. `/signup`과 `/login`이
 * 각자 살아 있어야 미들웨어가 보호 라우트에서 보낼 곳이 생긴다 (결정 0004에서 남긴 것).
 * 폼이 하나만 렌더되므로 덮인 폼을 `inert`로 끌 일은 없어졌다.
 */
export function AuthPanels({ initial }: { initial: Mode }) {
	const [mode, setMode] = useState<Mode>(initial);
	const other: Mode = mode === "signup" ? "signin" : "signup";
	const line = SWITCH[mode];

	const toggle = () => {
		setMode(other);
		window.history.replaceState(null, "", PATH[other]);
	};

	return (
		// md 이상의 px-3.5 py-4는 SideNav와 같아 로고가 같은 자리에 선다. 안쪽 px-0.5를 더해 컬럼 옆은 16px이다
		<main className="flex flex-1 flex-col bg-canvas px-4 pt-4 pb-6 md:px-3.5 md:py-4">
			<div className="self-center md:self-start">
				<BrandMark />
			</div>

			<div className="flex flex-1 flex-col items-center pt-8 md:justify-center md:px-0.5 md:py-8">
				<div className="flex w-full flex-1 flex-col md:max-w-sm md:flex-none">
					{mode === "signup" ? <SignUpForm /> : <SignInForm />}

					{/* 모바일은 mt-auto로 바닥에 붙는다. 폼이 길어도 pt-8이 폼과의 간격을 지킨다 */}
					<div className="mt-auto flex flex-wrap items-baseline justify-center gap-x-2 gap-y-1 pt-8 text-body-sm md:mt-8 md:justify-start md:border-hairline md:border-t md:pt-6">
						<p className="text-fg-muted">{line.ask}</p>
						{/* -m-1 p-1 은 글자를 움직이지 않고 누를 자리만 넓힌다. `ContentCard`의 이름 링크와 같다 */}
						<button
							className="-m-1 rounded-md p-1 font-semibold text-fg transition-colors duration-[var(--motion-fast)] ease-(--ease-standard) hover:bg-background active:bg-hairline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
							onClick={toggle}
							type="button"
						>
							{line.action}
						</button>
					</div>
				</div>
			</div>
		</main>
	);
}
