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

/**
 * 화면 가운데 카드. 제목은 반드시 받는다 — 접근성 트리에서 이 창이 무엇인지
 * 말하는 유일한 수단이고, radix도 없으면 경고한다.
 *
 * 위에서 96px 떨어뜨린다. 가운데에 띄우면 입력 중 키보드가 올라올 때 자리가 흔들린다.
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
		<Primitive.Portal>
			<Primitive.Overlay className="fixed inset-0 z-40 bg-fg/40" />
			<Primitive.Content
				className={cn(
					"fixed left-1/2 top-24 z-50 w-full max-w-2xl -translate-x-1/2 px-4",
					className,
				)}
				{...props}
			>
				<div className="overflow-hidden rounded-md border border-hairline bg-canvas">
					<Primitive.Title className="border-hairline border-b px-4 py-3 text-body font-semibold text-fg">
						{title}
					</Primitive.Title>
					{children}
				</div>
			</Primitive.Content>
		</Primitive.Portal>
	);
}
