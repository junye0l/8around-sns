"use client";

import { Menu } from "lucide-react";
import { useState } from "react";
import { useFormStatus } from "react-dom";
import { Button, buttonStyles } from "@/components/ui/Button";
import {
	DialogShell,
	DialogTitle,
	DialogTrigger,
	Sheet,
} from "@/components/ui/Dialog";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuRadioGroup,
	DropdownMenuRadioItem,
	DropdownMenuTrigger,
} from "@/components/ui/DropdownMenu";
import { SEGMENT, SEGMENT_ITEM } from "@/components/ui/Segment";
import { signOutAction } from "@/lib/actions/auth";
import { setThemeAction } from "@/lib/actions/theme";
import { cn } from "@/lib/utils/cn";
import { parseTheme, type Theme } from "@/lib/utils/theme";

const THEMES = [
	{ value: "light", label: "라이트" },
	{ value: "dark", label: "다크" },
	{ value: "system", label: "시스템" },
] as const;

const GROUP_LABEL = "mb-2 text-footnote font-semibold text-fg-muted";
/**
 * "더 보기". 디자인(테마 고르기)과 로그아웃이 들어 있다.
 *
 * 768px 미만은 `PageShell` 제목줄 오른쪽 버튼이 바텀 시트를 열고, 이상은 메뉴 맨 아래 항목이
 * 드롭다운을 연다. 여는 자리가 폭마다 달라 모양도 `variant`로 나눈다.
 * 시트의 세그먼트는 라디오 입력이라 화살표 키로 고른다. 드롭다운은 radix 항목이라 위아래 화살표로 옮긴다.
 * @see docs/DESIGN.md 더 보기
 */
export function MoreMenu({
	variant,
	className,
	labelClassName,
}: {
	variant: "sheet" | "dropdown";
	className: string;
	labelClassName?: string;
}) {
	const trigger = (
		<>
			<Menu aria-hidden className="size-5.5 shrink-0" />
			<span className={labelClassName ?? "sr-only"}>더 보기</span>
		</>
	);

	if (variant === "sheet") {
		return (
			<Sheet>
				<DialogTrigger className={className}>{trigger}</DialogTrigger>
				<DialogShell
					aria-describedby={undefined}
					className="top-24 max-w-100"
					variant="sheet"
				>
					<div className="px-5 pt-3 pb-6">
						<DialogTitle className="text-headline text-fg">더 보기</DialogTitle>
						<SheetThemes />
						<form action={signOutAction} className="mt-4">
							<SignOutButton />
						</form>
					</div>
				</DialogShell>
			</Sheet>
		);
	}

	return (
		<DropdownMenu>
			<DropdownMenuTrigger className={className}>{trigger}</DropdownMenuTrigger>
			<DropdownMenuContent className="w-65">
				<div className="p-1.5">
					<p className={GROUP_LABEL}>디자인</p>
					<DropdownThemes />
					{/* 서버 액션을 폼으로 부른다. radix가 항목을 div로 그리므로 버튼을 안에 둔다 */}
					<form action={signOutAction} className="mt-4">
						<SignOutItem />
					</form>
				</div>
			</DropdownMenuContent>
		</DropdownMenu>
	);
}

// 시트나 드롭다운이 열릴 때만 그려지므로 서버에서 돌지 않는다. 처음 값은 `app/layout.tsx`가 박은 속성에서 읽는다.
// 서버 응답을 기다리지 않고 바로 바꾼다. 응답으로 다시 그려질 때도 같은 값이 온다
function useTheme() {
	const [theme, setTheme] = useState(() =>
		parseTheme(document.documentElement.dataset.theme),
	);
	const choose = (value: string) => {
		const next = parseTheme(value);
		applyTheme(next);
		setTheme(next);
		setThemeAction(next);
	};
	return [theme, choose] as const;
}

function SheetThemes() {
	const [theme, choose] = useTheme();

	return (
		<fieldset className="mt-4">
			<legend className={GROUP_LABEL}>디자인</legend>
			<div className={SEGMENT}>
				{THEMES.map(({ value, label }) => (
					<label
						className={cn(
							SEGMENT_ITEM,
							"has-checked:bg-canvas has-checked:text-fg has-checked:shadow-card has-focus-visible:outline-2 has-focus-visible:outline-offset-2 has-focus-visible:outline-primary",
						)}
						key={value}
					>
						<input
							checked={theme === value}
							className="sr-only"
							name="theme"
							onChange={() => choose(value)}
							type="radio"
							value={value}
						/>
						{label}
					</label>
				))}
			</div>
		</fieldset>
	);
}

// 골라도 메뉴를 닫지 않는다. 켜진 칸이 옮겨가는 것을 보고 다른 테마와 바로 견줘 볼 수 있다
function DropdownThemes() {
	const [theme, choose] = useTheme();

	return (
		<DropdownMenuRadioGroup
			aria-label="디자인"
			className={SEGMENT}
			onValueChange={choose}
			value={theme}
		>
			{THEMES.map(({ value, label }) => (
				<DropdownMenuRadioItem
					className={cn(
						SEGMENT_ITEM,
						"aria-checked:bg-canvas aria-checked:text-fg aria-checked:shadow-card focus-visible:outline-solid focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary",
					)}
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

function SignOutButton() {
	const { pending } = useFormStatus();

	return (
		<Button loading={pending} size="lg" type="submit" variant="danger">
			로그아웃
		</Button>
	);
}

// 선택 시 메뉴가 닫히면 폼이 언마운트돼 브라우저가 제출을 취소한다. 리다이렉트가 닫는다.
// 항목 클래스가 버튼 모양을 덮지 않게 같은 버튼 모양을 뒤에 한 번 더 준다
function SignOutItem() {
	const { pending } = useFormStatus();

	return (
		<DropdownMenuItem
			asChild
			className={cn(
				buttonStyles({ size: "lg", variant: "danger" }),
				// 항목 기본값의 outline-none이 링 모양까지 끄므로 키보드 포커스에서 다시 켠다
				"data-highlighted:bg-danger-soft focus-visible:outline-solid",
			)}
			onSelect={(event) => event.preventDefault()}
		>
			<Button loading={pending} size="lg" type="submit" variant="danger">
				로그아웃
			</Button>
		</DropdownMenuItem>
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
