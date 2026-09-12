"use client";

import * as Primitive from "@radix-ui/react-dropdown-menu";
import { type ComponentProps, createContext, useContext, useRef } from "react";
import { cn } from "@/lib/utils/cn";

/**
 * shadcn 구조를 따라 radix 위에 우리 토큰만 입힌 얇은 껍데기.
 * 포커스, 화살표 이동, 타입어헤드, Esc 닫기는 radix가 한다 — 직접 만들지 않는다.
 *
 * 여는 애니메이션만 있다. 닫을 때는 radix가 바로 언마운트해서 보이지 않는다.
 * @see docs/PLAN.md 애니메이션 절
 */
/**
 * 이 메뉴를 포인터로 열었는지. 닫을 때 포커스를 트리거로 되돌릴지가 여기서 갈린다.
 * 상태가 아니라 ref다 — 값이 바뀌어도 다시 그릴 이유가 없다.
 */
const OpenedByPointer = createContext<{ current: boolean } | null>(null);

export function DropdownMenu(props: ComponentProps<typeof Primitive.Root>) {
	const openedByPointer = useRef(false);

	return (
		<OpenedByPointer.Provider value={openedByPointer}>
			<Primitive.Root {...props} />
		</OpenedByPointer.Provider>
	);
}

/**
 * 무엇으로 열었는지 기록한다. 핸들러를 스프레드 뒤에 두는 이유는 `DropdownMenuItem`과 같다 —
 * 앞에 두면 호출자가 넘긴 것이 이걸 덮어쓴다.
 */
export function DropdownMenuTrigger(
	props: ComponentProps<typeof Primitive.Trigger>,
) {
	const openedByPointer = useContext(OpenedByPointer);

	return (
		<Primitive.Trigger
			{...props}
			onKeyDown={(event) => {
				props.onKeyDown?.(event);
				if (openedByPointer) openedByPointer.current = false;
			}}
			onPointerDown={(event) => {
				props.onPointerDown?.(event);
				if (openedByPointer) openedByPointer.current = true;
			}}
		/>
	);
}

/**
 * 떠 있는 면. 그림자를 쓰지 않으므로 1px 선이 분리를 맡는다.
 * 기본값은 버튼 오른쪽 위 정렬이다 — 레일이 화면 왼쪽 끝에 붙어 있어 아래로 열 자리가 없다.
 *
 * 열릴 때 트리거 쪽 모서리에서 펼쳐진다. 어느 모서리인지는 radix가 자리를 잡고 나서
 * `--radix-dropdown-menu-content-transform-origin`으로 알려준다 — 위로 열리든 오른쪽으로
 * 열리든 나온 곳에서 자란다. 상태로 거르지 않는 이유는 닫히는 순간 언마운트되기 때문이다.
 */
export function DropdownMenuContent({
	className,
	side = "right",
	align = "end",
	sideOffset = 8,
	onCloseAutoFocus,
	...props
}: ComponentProps<typeof Primitive.Content>) {
	const openedByPointer = useContext(OpenedByPointer);

	return (
		<Primitive.Portal>
			<Primitive.Content
				align={align}
				className={cn(
					"z-50 min-w-56 origin-(--radix-dropdown-menu-content-transform-origin) animate-menu-open overflow-hidden rounded-md border border-hairline bg-canvas py-1",
					className,
				)}
				collisionPadding={8}
				// 마우스로 열었으면 포커스를 트리거로 되돌리지 않는다. 되돌리면 크롬이 그걸
				// 키보드 포커스로 쳐서 파란 링이 남고, 누른 사람은 왜 떴는지 모른다.
				// 키보드로 열었을 때는 되돌려야 한다 — 안 그러면 탭 자리를 잃는다
				onCloseAutoFocus={(event) => {
					onCloseAutoFocus?.(event);
					if (openedByPointer?.current) event.preventDefault();
				}}
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
