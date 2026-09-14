"use client";

import * as Primitive from "@radix-ui/react-dialog";
import type { ComponentProps, ReactNode } from "react";
import { cn } from "@/lib/utils/cn";

/**
 * shadcn 구조를 따라 radix 위에 우리 토큰만 입힌 얇은 껍데기.
 * 포커스 가두기, Esc 닫기, 바깥 클릭, 스크롤 잠금은 radix가 한다 — 직접 만들지 않는다.
 *
 * 여는 것만 움직인다. 막은 페이드로, 시트는 아래에서 올라온다.
 * @see docs/DESIGN.md 드롭다운, 모달, 시트
 */
export const Dialog = Primitive.Root;
export const DialogTrigger = Primitive.Trigger;
export const DialogClose = Primitive.Close;
export const DialogTitle = Primitive.Title;
export const DialogDescription = Primitive.Description;

/**
 * 떠 있는 면의 껍데기. 막과 `canvas-raised` 면까지가 여기다.
 * 안에 무엇이 들어가는지는 부르는 쪽이 정한다 — 입력 모달과 확인 모달이 같이 쓴다 (규칙 2).
 *
 * 자리와 너비는 `className`으로 받는다. 가로 가운데 정렬만 여기서 한다.
 * `variant="sheet"`면 768px 미만에서 화면 아래에 붙는 바텀 시트가 되고, 이상에서는 `className`의 자리를 따른다.
 * 시트 끌어내리기는 아직 없다. 리뉴얼 4단계(`docs/PLAN.md`)에서 닫기 확인과 같이 만든다.
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
	const sheet = variant === "sheet";

	return (
		<Primitive.Portal>
			<Primitive.Overlay className="fixed inset-0 z-40 animate-fade-in bg-scrim" />
			<Primitive.Content
				className={cn(
					"fixed left-1/2 z-50 w-full -translate-x-1/2 px-4",
					className,
					sheet &&
						"max-md:inset-x-0 max-md:top-auto max-md:bottom-0 max-md:max-w-none max-md:translate-x-0 max-md:animate-sheet-in max-md:px-0",
				)}
				{...props}
			>
				<div
					className={cn(
						"overflow-hidden rounded-sheet bg-canvas-raised shadow-raised",
						sheet &&
							// 허용: 시트 최대 높이와 아래 안전영역은 기기 뷰포트에 묶인 값이라 토큰이 없다
							"max-md:flex max-md:max-h-[90dvh] max-md:flex-col max-md:overflow-y-auto max-md:rounded-b-none max-md:pb-[env(safe-area-inset-bottom)]",
					)}
				>
					{sheet && (
						<span
							aria-hidden
							className="mx-auto mt-2 block h-1.25 w-9 shrink-0 rounded-full bg-hairline md:hidden"
						/>
					)}
					{children}
				</div>
			</Primitive.Content>
		</Primitive.Portal>
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
