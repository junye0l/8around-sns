"use client";

import { LogOut, Menu, Palette } from "lucide-react";
import { useState } from "react";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuRadioGroup,
	DropdownMenuRadioItem,
	DropdownMenuSub,
	DropdownMenuSubContent,
	DropdownMenuSubTrigger,
	DropdownMenuTrigger,
} from "@/components/ui/DropdownMenu";
import { signOutAction } from "@/lib/actions/auth";
import { setThemeAction } from "@/lib/actions/theme";
import { parseTheme, type Theme } from "@/lib/utils/theme";

/**
 * "더 보기". 레일 맨 아래에, 모바일에서는 `PageShell` 제목줄 오른쪽에 선다.
 * 디자인(테마 고르기)과 로그아웃이 들어 있다.
 *
 * 메뉴로 감싸는 이유는 여기가 설정이 쌓일 자리이기 때문이다.
 * 항목이 레일에 그냥 나와 있으면 항목이 늘 때마다 레일이 길어진다.
 *
 * 로그아웃만 빨강이다. 되돌리려면 다시 로그인해야 한다.
 */
export function MoreMenu({
	className,
	labelClassName,
	side,
}: {
	className: string;
	labelClassName: string;
	/** 레일에서는 기본값(오른쪽), 모바일 제목줄에서는 아래로 연다 */
	side?: "right" | "bottom";
}) {
	return (
		<DropdownMenu>
			<DropdownMenuTrigger className={className}>
				<Menu aria-hidden className="size-6 shrink-0" />
				<span className={labelClassName}>더 보기</span>
			</DropdownMenuTrigger>

			<DropdownMenuContent side={side}>
				<DropdownMenuSub>
					<DropdownMenuSubTrigger>
						<Palette aria-hidden className="size-5 shrink-0" />
						디자인
					</DropdownMenuSubTrigger>
					<DropdownMenuSubContent>
						<ThemeOptions />
					</DropdownMenuSubContent>
				</DropdownMenuSub>

				{/* 서버 액션을 폼으로 부른다. radix가 항목을 div로 그리므로 버튼을 안에 둔다 */}
				<form action={signOutAction}>
					{/* 선택 시 메뉴가 닫히면 폼이 언마운트돼 브라우저가 제출을 취소한다. 리다이렉트가 닫는다 */}
					<DropdownMenuItem
						asChild
						danger
						onSelect={(event) => event.preventDefault()}
					>
						<button className="w-full" type="submit">
							<LogOut aria-hidden className="size-5 shrink-0" />
							로그아웃
						</button>
					</DropdownMenuItem>
				</form>
			</DropdownMenuContent>
		</DropdownMenu>
	);
}

/**
 * 화면 전체를 한 장으로 겹쳐 바꾼다. 요소마다 두면 `transition-colors`가 있는 것만 늦게 따라와
 * 바탕은 이미 바뀌었는데 버튼 채움은 옛 색으로 남는다. 겹치는 동안은 그 전환을 끈다. 결정 0041
 */
function applyTheme(theme: Theme) {
	const root = document.documentElement;
	const set = () => {
		if (theme === "system") delete root.dataset.theme;
		else root.dataset.theme = theme;
	};

	// 모르는 브라우저는 겹치지 않고 바로 바꾼다
	if (!document.startViewTransition) return set();

	root.dataset.themeSwitching = "";
	const transition = document.startViewTransition(set);
	latestTransition = transition;
	// 빨리 연달아 고르면 앞 전환이 건너뛰어지며 먼저 끝난다. 뒤 전환이 겹치는 중에 전환을 다시 켜지 않게 마지막 것만 푼다
	transition.finished.finally(() => {
		if (latestTransition === transition) delete root.dataset.themeSwitching;
	});
}

let latestTransition: ViewTransition | null = null;

const THEMES = [
	{ value: "dark", label: "다크" },
	{ value: "light", label: "라이트" },
	{ value: "system", label: "시스템" },
] as const;

// 하위 메뉴가 열릴 때만 그려지므로 서버에서 돌지 않는다. 처음 값은 `app/layout.tsx`가 박은 속성에서 읽는다.
// 골라도 메뉴를 닫지 않는다. 체크가 옮겨가는 것을 보고 다른 테마와 바로 견줘 볼 수 있다
function ThemeOptions() {
	const [theme, setTheme] = useState(() =>
		parseTheme(document.documentElement.dataset.theme),
	);

	return (
		<DropdownMenuRadioGroup
			onValueChange={(value) => {
				// 서버 응답을 기다리지 않고 바로 바꾼다. 응답으로 다시 그려질 때도 같은 값이 온다
				const next = parseTheme(value);
				applyTheme(next);
				setTheme(next);
				setThemeAction(next);
			}}
			value={theme}
		>
			{THEMES.map(({ value, label }) => (
				<DropdownMenuRadioItem
					key={value}
					onSelect={(event) => event.preventDefault()}
					value={value}
				>
					{label}
				</DropdownMenuRadioItem>
			))}
		</DropdownMenuRadioGroup>
	);
}
