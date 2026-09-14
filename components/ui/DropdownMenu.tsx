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
const SURFACE =
	"z-50 min-w-56 origin-(--radix-dropdown-menu-content-transform-origin) animate-menu-open overflow-hidden rounded-menu border border-hairline bg-canvas-raised p-1.5 shadow-raised";

// radix는 키보드와 포인터 강조를 같은 data 속성으로 준다
const ITEM =
	"flex cursor-pointer select-none items-center gap-3 rounded-xl px-3 py-2.5 text-body text-fg outline-none transition-colors duration-(--motion-fast) ease-(--ease-standard) data-highlighted:bg-fill";

/**
 * 무엇으로 열었는지와 그 트리거가 무엇인지. 닫을 때 포커스를 어떻게 돌려줄지가 여기서 갈린다.
 * 상태가 아니라 ref다 — 값이 바뀌어도 다시 그릴 이유가 없다.
 */
type Opener = { byPointer: boolean; node: HTMLElement | null };

const OpenerContext = createContext<{ current: Opener } | null>(null);

export function DropdownMenu(props: ComponentProps<typeof Primitive.Root>) {
	const opener = useRef<Opener>({ byPointer: false, node: null });

	return (
		<OpenerContext.Provider value={opener}>
			<Primitive.Root {...props} />
		</OpenerContext.Provider>
	);
}

/**
 * 무엇으로 열었는지 기록한다. 핸들러를 스프레드 뒤에 두는 이유는 `DropdownMenuItem`과 같다 —
 * 앞에 두면 호출자가 넘긴 것이 이걸 덮어쓴다.
 */
export function DropdownMenuTrigger(
	props: ComponentProps<typeof Primitive.Trigger>,
) {
	const opener = useContext(OpenerContext);

	return (
		<Primitive.Trigger
			{...props}
			onKeyDown={(event) => {
				props.onKeyDown?.(event);
				if (opener) opener.current.byPointer = false;
			}}
			onPointerDown={(event) => {
				props.onPointerDown?.(event);
				if (opener) opener.current.byPointer = true;
			}}
			ref={(node) => {
				if (opener) opener.current.node = node;
				// 스프레드 뒤라 부르는 쪽 ref를 덮는다. 그 ref에도 같이 넘긴다
				const { ref } = props;
				if (typeof ref === "function") ref(node);
				else if (ref) ref.current = node;
			}}
		/>
	);
}

/**
 * 떠 있는 면. 라이트는 그림자와 1px 선이, 다크는 `canvas-raised` 면 색과 선이 뒤와 가른다.
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
	const opener = useContext(OpenerContext);

	return (
		<Primitive.Portal>
			<Primitive.Content
				align={align}
				className={cn(SURFACE, className)}
				collisionPadding={8}
				// 포커스는 어느 쪽이든 트리거로 돌아간다. 안 그러면 닫은 뒤 Tab이 문서
				// 처음부터 시작한다. 마우스로 열었을 때만 링을 끈다 — 되돌리는 것은
				// 프로그램적 포커스인데 크롬이 그걸 키보드 포커스로 쳐서 파란 링을 남긴다
				onCloseAutoFocus={(event) => {
					onCloseAutoFocus?.(event);
					if (!opener?.current.byPointer) return;

					event.preventDefault();
					// `focusVisible`는 lib.dom의 FocusOptions에 아직 없다. 브라우저는 받는다
					opener.current.node?.focus({
						focusVisible: false,
						preventScroll: true,
					} as FocusOptions & { focusVisible: boolean });
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
			className={cn(ITEM, danger && "text-danger", className)}
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

/** 하나만 고르는 칸 묶음. `value`와 `onValueChange`를 받는다 */
export const DropdownMenuRadioGroup = Primitive.RadioGroup;

/**
 * 고를 수 있는 칸 하나. 모양은 부르는 쪽이 `className`으로 준다. 켜진 칸은 `aria-checked`가 붙는다.
 * 세그먼트처럼 한 줄에 나란히 두어도 위아래 화살표 키로 옮겨 다닌다.
 * 손을 뗄 때 실행되지 않게 막는 이유는 `DropdownMenuItem`과 같다.
 */
export function DropdownMenuRadioItem({
	onPointerUp,
	...props
}: ComponentProps<typeof Primitive.RadioItem>) {
	return (
		<Primitive.RadioItem
			onPointerUp={(event) => {
				onPointerUp?.(event);
				event.preventDefault();
			}}
			{...props}
		/>
	);
}
