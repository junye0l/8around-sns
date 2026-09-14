"use client";

import { useState } from "react";
import { SignInForm } from "@/components/auth/SignInForm";
import { SignUpForm } from "@/components/auth/SignUpForm";
import { BrandMark } from "@/components/ui/BrandMark";
import { Button } from "@/components/ui/Button";

type Mode = "signup" | "signin";

const SWITCH = {
	signup: { ask: "이미 계정이 있나요?", action: "로그인하기" },
	signin: { ask: "처음 오셨나요?", action: "가입하기" },
} as const;

const PATH = { signup: "/signup", signin: "/login" } as const;

/**
 * 가입 · 로그인 한 컬럼. 폼 하나만 보이고 아래 한 줄로 반대쪽으로 건너간다.
 * Threads 로그인 화면의 배치다 ([결정 0016](../../docs/decisions/0016-threads-auth.md)).
 *
 * 로고는 왼쪽 레일과 같은 왼쪽 위 자리에 선다. 제목과 문구는 왼쪽 정렬이고, 건너가는 줄은
 * `hairline` 선 아래에 문구와 outline 버튼을 한 줄로 둔다. 추천의 글쓰기 줄과 같은 모양이다.
 * [결정 0027](../../docs/decisions/0027-auth-page-layout.md).
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
		// px-3.5 py-4는 SideNav와 같아 로고가 같은 자리에 선다. 안쪽 px-0.5를 더해 컬럼 옆은 전과 같은 16px이다
		<main className="flex flex-1 flex-col bg-canvas px-3.5 py-4">
			<BrandMark />

			<div className="flex flex-1 flex-col items-center justify-center px-0.5 py-8">
				<div className="w-full max-w-sm">
					{mode === "signup" ? <SignUpForm /> : <SignInForm />}

					<div className="mt-8 flex items-center justify-between gap-3 border-hairline border-t pt-6">
						<p className="text-body-sm text-fg-muted">{line.ask}</p>
						<Button onClick={toggle} variant="outline">
							{line.action}
						</Button>
					</div>
				</div>
			</div>
		</main>
	);
}
