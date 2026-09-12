"use client";

import * as Primitive from "@radix-ui/react-dropdown-menu";
import type { ComponentProps } from "react";
import { cn } from "@/lib/utils/cn";

/**
 * shadcn 구조를 따라 radix 위에 우리 토큰만 입힌 얇은 껍데기.
 * 포커스, 화살표 이동, 타입어헤드, Esc 닫기는 radix가 한다 — 직접 만들지 않는다.
 *
 * 열고 닫는 애니메이션은 없다. 레이아웃이 다 선 뒤에 얹는다.
 * @see docs/PLAN.md 애니메이션 절
 */
export const DropdownMenu = Primitive.Root;
export const DropdownMenuTrigger = Primitive.Trigger;

/**
 * 떠 있는 면. 그림자를 쓰지 않으므로 1px 선이 분리를 맡는다.
 * 기본값은 버튼 오른쪽 위 정렬이다 — 레일이 화면 왼쪽 끝에 붙어 있어 아래로 열 자리가 없다.
 */
export function DropdownMenuContent({
	className,
	side = "right",
	align = "end",
	sideOffset = 8,
	...props
}: ComponentProps<typeof Primitive.Content>) {
	return (
		<Primitive.Portal>
			<Primitive.Content
				align={align}
				className={cn(
					"z-50 min-w-56 overflow-hidden rounded-md border border-hairline bg-canvas py-1",
					className,
				)}
				collisionPadding={8}
				side={side}
				sideOffset={sideOffset}
				{...props}
			/>
		</Primitive.Portal>
	);
}

/**
 * 한 줄. `danger`면 문구가 빨강이 된다 — 로그아웃처럼 되돌리기 어려운 것에만 쓴다.
 *
 * 누른 적 없는 항목 위에서 손을 떼도 radix가 `click()`을 부른다. 메뉴가 포인터 밑으로
 * 열리면 그것만으로 항목이 실행되므로, `pointerup`의 기본 동작을 막아 그 경로를 끈다.
 * 선택은 항목 위에서 누르고 떼거나 키보드로만 된다.
 */
export function DropdownMenuItem({
	className,
	danger = false,
	onPointerUp,
	...props
}: ComponentProps<typeof Primitive.Item> & { danger?: boolean }) {
	return (
		<Primitive.Item
			className={cn(
				"flex cursor-pointer select-none items-center gap-3 px-4 py-3 text-body outline-none transition-colors duration-[var(--motion-fast)] ease-(--ease-standard)",
				// radix는 키보드와 포인터 강조를 같은 data 속성으로 준다
				"data-highlighted:bg-background",
				danger ? "text-danger" : "text-fg",
				className,
			)}
			// 호출자 핸들러와 합친다. 스프레드 앞에 그냥 두면 호출자가 넘긴 것이 이걸 덮어쓴다
			onPointerUp={(event) => {
				onPointerUp?.(event);
				event.preventDefault();
			}}
			{...props}
		/>
	);
}

/** 그룹 사이 구분선. 카드 구분선과 같은 1px이다 */
export function DropdownMenuSeparator({
	className,
	...props
}: ComponentProps<typeof Primitive.Separator>) {
	return (
		<Primitive.Separator
			className={cn("my-1 h-px bg-hairline", className)}
			{...props}
		/>
	);
}
