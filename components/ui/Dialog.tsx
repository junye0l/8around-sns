"use client";

import * as Primitive from "@radix-ui/react-dialog";
import {
	type ComponentProps,
	createContext,
	type ReactNode,
	type RefObject,
	useContext,
	useEffect,
	useRef,
	useState,
} from "react";
import { Drawer } from "vaul";
import { Button } from "@/components/ui/Button";
import { useMediaQuery } from "@/hooks/useMediaQuery";
import { cn } from "@/lib/utils/cn";

/**
 * shadcn 구조를 따라 radix 위에 우리 토큰만 입힌 얇은 껍데기.
 * 포커스 가두기, Esc 닫기, 바깥 클릭, 스크롤 잠금은 radix가 한다 — 직접 만들지 않는다.
 * 768px 미만 바텀 시트는 shadcn Drawer와 같은 vaul이 끌어내리기를 더한다. vaul도 안에서 radix Dialog를 쓴다.
 * @see docs/DESIGN.md 드롭다운, 모달, 시트
 */
export const Dialog = Primitive.Root;
export const DialogTrigger = Primitive.Trigger;
export const DialogClose = Primitive.Close;
export const DialogTitle = Primitive.Title;
export const DialogDescription = Primitive.Description;

type SheetState = {
	drawer: boolean;
	content: RefObject<HTMLDivElement | null>;
	overlay: RefObject<HTMLDivElement | null>;
};

const SheetContext = createContext<SheetState | null>(null);

/**
 * 768px 미만은 끌어내릴 수 있는 바텀 시트, 이상은 radix 모달이다. 안에는 `DialogShell variant="sheet"`를 둔다.
 *
 * 닫는 모든 길(끌어내리기, 바깥 누르기, Esc, 닫기 버튼)이 `onOpenChange(false)` 하나로 온다.
 * 부르는 쪽이 닫지 않고 두면(닫기 확인을 띄울 때) 끌린 시트를 제자리로 되돌린다. 결정 0044.
 */
export function Sheet({
	open: openProp,
	onOpenChange,
	children,
}: {
	open?: boolean;
	onOpenChange?: (open: boolean) => void;
	children: ReactNode;
}) {
	const wide = useMediaQuery("(width >= 48rem)");
	const [openState, setOpenState] = useState(false);
	const open = openProp ?? openState;
	const content = useRef<HTMLDivElement>(null);
	const overlay = useRef<HTMLDivElement>(null);
	const latestOpen = useRef(open);
	useEffect(() => {
		latestOpen.current = open;
	});

	const change = (next: boolean) => {
		(onOpenChange ?? setOpenState)(next);
		if (next || wide) return;
		// vaul은 끌던 자리를 인라인 style로 남긴다. 닫힘이 거절돼 다음 프레임에도 열려 있으면 그 style을 걷는다
		requestAnimationFrame(() => {
			if (!latestOpen.current) return;
			content.current?.style.removeProperty("transform");
			overlay.current?.style.removeProperty("opacity");
		});
	};

	return (
		<SheetContext.Provider value={{ drawer: !wide, content, overlay }}>
			{wide ? (
				<Primitive.Root onOpenChange={change} open={open}>
					{children}
				</Primitive.Root>
			) : (
				<Drawer.Root onOpenChange={change} open={open}>
					{children}
				</Drawer.Root>
			)}
		</SheetContext.Provider>
	);
}

/**
 * 떠 있는 면의 껍데기. 막과 `canvas-raised` 면까지가 여기다.
 * 안에 무엇이 들어가는지는 부르는 쪽이 정한다 — 입력 모달과 확인 모달이 같이 쓴다 (규칙 2).
 *
 * 자리와 너비는 `className`으로 받는다. 가로 가운데 정렬만 여기서 한다.
 * `variant="sheet"`는 `Sheet` 안에서 쓴다. 768px 미만이면 화면 아래에 붙는 바텀 시트가 되고 `className`은 쓰지 않는다.
 */
export function DialogShell({
	variant = "modal",
	className,
	children,
	...props
}: ComponentProps<typeof Primitive.Content> & {
	variant?: "modal" | "sheet";
	children: ReactNode;
}) {
	const sheet = useContext(SheetContext);

	if (variant === "sheet" && sheet?.drawer) {
		return (
			<Drawer.Portal>
				<Drawer.Overlay
					className="fixed inset-0 z-40 bg-scrim"
					ref={sheet.overlay}
				/>
				<Drawer.Content
					className={cn(
						"fixed inset-x-0 bottom-0 z-50 flex flex-col rounded-t-sheet bg-canvas-raised shadow-raised outline-none",
						// 허용: 시트 최대 높이와 아래 안전영역은 기기 뷰포트에 묶인 값이라 토큰이 없다
						"max-h-[90dvh] pb-[env(safe-area-inset-bottom)]",
					)}
					ref={sheet.content}
					{...props}
				>
					<span
						aria-hidden
						className="mx-auto mt-2 block h-1.25 w-9 shrink-0 rounded-full bg-hairline"
					/>
					<div className="overflow-y-auto">{children}</div>
				</Drawer.Content>
			</Drawer.Portal>
		);
	}

	return (
		<Primitive.Portal>
			<Primitive.Overlay className="fixed inset-0 z-40 animate-fade-in bg-scrim" />
			<Primitive.Content
				className={cn(
					"fixed left-1/2 z-50 w-full -translate-x-1/2 px-4",
					className,
				)}
				{...props}
			>
				<div className="overflow-hidden rounded-sheet bg-canvas-raised shadow-raised">
					{children}
				</div>
			</Primitive.Content>
		</Primitive.Portal>
	);
}

/**
 * 글쓰기 시트와 프로필 편집 시트의 머리 줄. 왼쪽 ghost "취소", 가운데 headline 제목, 오른쪽 primary sm 보내기.
 * 보내기는 `form` 속성으로 시트 안 폼에 붙는다. 보내는 중에는 취소가 꺼진다.
 * @see docs/DESIGN.md 글쓰기 시트
 */
export function SheetHeader({
	title,
	formId,
	submitLabel,
	canSubmit,
	pending,
	onCancel,
}: {
	title: string;
	formId: string;
	submitLabel: string;
	canSubmit: boolean;
	pending: boolean;
	onCancel: () => void;
}) {
	return (
		<div className="relative flex h-14 items-center justify-between px-3">
			<Button disabled={pending} onClick={onCancel} size="sm" variant="ghost">
				취소
			</Button>
			<Primitive.Title className="-translate-x-1/2 absolute left-1/2 text-headline text-fg">
				{title}
			</Primitive.Title>
			<Button
				disabled={!canSubmit}
				form={formId}
				loading={pending}
				size="sm"
				type="submit"
			>
				{submitLabel}
			</Button>
		</div>
	);
}

/**
 * 짧게 묻는 작은 모달. 가운데 제목과 설명 아래에 부르는 쪽이 버튼 둘을 나란히 둔다(`mt-5 flex gap-2`).
 * 글쓰기 닫기 확인과 삭제 확인이 같이 쓴다 (규칙 2). 첫 포커스는 radix대로 첫 버튼에 간다.
 * 안쪽 좌우 여백 16px씩을 더해 면이 320px이다.
 */
export function ConfirmContent({
	title,
	description,
	children,
	...props
}: ComponentProps<typeof Primitive.Content> & {
	title: string;
	description?: string;
	children: ReactNode;
}) {
	return (
		<DialogShell
			// 설명이 없으면 radix가 찾을 대상이 없다고 경고한다
			{...(description ? {} : { "aria-describedby": undefined })}
			className="-translate-y-1/2 top-1/2 max-w-88"
			{...props}
		>
			<div className="p-5 text-center">
				<Primitive.Title className="break-keep text-headline text-fg">
					{title}
				</Primitive.Title>
				{description && (
					<Primitive.Description className="mt-1 break-keep text-subhead font-normal text-fg-muted">
						{description}
					</Primitive.Description>
				)}
				{children}
			</div>
		</DialogShell>
	);
}

/**
 * 화면 가운데 카드. 제목은 반드시 받는다 — 접근성 트리에서 이 창이 무엇인지
 * 말하는 유일한 수단이고, radix도 없으면 경고한다.
 *
 * 위에서 96px 떨어뜨린다. 가운데에 띄우면 입력 중 키보드가 올라올 때 자리가 흔들린다.
 *
 * 제목줄 왼쪽에 "취소"가 선다. Esc와 바깥 클릭 말고도 눈에 보이는 닫는 길이 하나는 있어야 한다.
 */
export function DialogContent({
	title,
	className,
	children,
	...props
}: ComponentProps<typeof Primitive.Content> & {
	title: string;
	children: ReactNode;
}) {
	return (
		<DialogShell className={cn("top-24 max-w-2xl", className)} {...props}>
			<div className="relative flex h-15 items-center justify-center">
				<Primitive.Close className="absolute left-2 rounded-md px-2 py-1 text-body text-fg transition-colors duration-[var(--motion-fast)] ease-(--ease-standard) hover:bg-background focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary">
					취소
				</Primitive.Close>
				<Primitive.Title className="text-body font-semibold text-fg">
					{title}
				</Primitive.Title>
			</div>
			{children}
		</DialogShell>
	);
}
