"use client";

import { LogOut, Menu, Palette } from "lucide-react";
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
import { parseTheme } from "@/lib/utils/theme";

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

// 하위 메뉴가 열릴 때만 그려지므로 서버에서 돌지 않는다. 지금 값은 `app/layout.tsx`가 박은 속성에서 읽는다
function ThemeOptions() {
	const root = document.documentElement;

	return (
		<DropdownMenuRadioGroup
			onValueChange={(value) => {
				// 서버 응답을 기다리지 않고 바로 바꾼다. 응답으로 다시 그려질 때도 같은 값이 온다
				const theme = parseTheme(value);
				if (theme === "system") delete root.dataset.theme;
				else root.dataset.theme = theme;
				setThemeAction(theme);
			}}
			value={parseTheme(root.dataset.theme)}
		>
			<DropdownMenuRadioItem value="dark">다크</DropdownMenuRadioItem>
			<DropdownMenuRadioItem value="light">라이트</DropdownMenuRadioItem>
			<DropdownMenuRadioItem value="system">시스템</DropdownMenuRadioItem>
		</DropdownMenuRadioGroup>
	);
}
