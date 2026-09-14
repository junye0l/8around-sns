"use client";

import * as Primitive from "@radix-ui/react-dialog";
import type { ComponentProps, ReactNode } from "react";
import { cn } from "@/lib/utils/cn";

/**
 * shadcn 구조를 따라 radix 위에 우리 토큰만 입힌 얇은 껍데기.
 * 포커스 가두기, Esc 닫기, 바깥 클릭, 스크롤 잠금은 radix가 한다 — 직접 만들지 않는다.
 *
 * 열고 닫는 애니메이션은 없다. 레이아웃이 다 선 뒤에 얹는다.
 * @see docs/PLAN.md 애니메이션 절
 */
export const Dialog = Primitive.Root;
export const DialogTrigger = Primitive.Trigger;
export const DialogClose = Primitive.Close;
export const DialogTitle = Primitive.Title;
export const DialogDescription = Primitive.Description;

/**
 * 떠 있는 카드의 껍데기. 어두운 막과 1px 테두리를 두른 카드 면까지가 여기다.
 * 안에 무엇이 들어가는지는 부르는 쪽이 정한다 — 입력 모달과 확인 모달이 같이 쓴다 (규칙 2).
 *
 * 자리와 너비는 `className`으로 받는다. 가로 가운데 정렬만 여기서 한다.
 */
export function DialogShell({
	className,
	children,
	...props
}: ComponentProps<typeof Primitive.Content> & { children: ReactNode }) {
	return (
		<Primitive.Portal>
			<Primitive.Overlay className="fixed inset-0 z-40 bg-scrim/40" />
			<Primitive.Content
				className={cn(
					"fixed left-1/2 z-50 w-full -translate-x-1/2 px-4",
					className,
				)}
				{...props}
			>
				<div className="overflow-hidden rounded-xl border border-hairline bg-canvas">
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
