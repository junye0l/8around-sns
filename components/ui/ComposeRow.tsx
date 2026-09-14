"use client";

import { ArrowUp } from "lucide-react";
import { Avatar } from "@/components/ui/Avatar";
import {
	ComposeDialog,
	type ComposeDialogProps,
} from "@/components/ui/ComposeDialog";
import { DialogTrigger } from "@/components/ui/Dialog";

/**
 * 글쓰기 시트를 여는 줄. 새 글, 댓글, 답글이 같이 쓴다
 * ([결정 0019](../../docs/decisions/0019-comment-compose-modal.md)).
 * 여기서 직접 쓰지 않는다. 입력은 시트 하나에서만 받는다 (규칙 2).
 *
 * - `card`: 글 카드와 같은 면에 줄 전체가 버튼 하나다. 내 아바타, `fg-muted` 안내, 꺼진 원형 보내기
 * - `bar`: 768px 미만 상세 화면의 아래 입력줄. 하단 탭 바로 위 `canvas` 띠에 `fill` 알약이 선다.
 *   흐름 밖(`fixed`)이라 같은 높이의 빈 자리를 흐름에 남겨 마지막 줄이 가리지 않게 한다
 * @see docs/DESIGN.md 글쓰기 줄
 */
export function ComposeRow({
	variant = "card",
	...props
}: Omit<ComposeDialogProps, "trigger"> & { variant?: "card" | "bar" }) {
	if (variant === "bar") {
		return (
			<>
				<div aria-hidden className="h-14 md:hidden" />
				<ComposeDialog
					{...props}
					trigger={
						<div
							className={
								// 허용: 하단 탭 높이(h-16)와 기기 안전영역을 더한 자리라 토큰이 없다
								"fixed inset-x-0 bottom-[calc(4rem+env(safe-area-inset-bottom))] z-10 border-hairline border-t bg-canvas px-3 py-2 md:hidden"
							}
						>
							<DialogTrigger className="flex h-10 w-full items-center gap-2 rounded-full bg-fill pr-1 pl-4 text-left transition duration-(--motion-fast) ease-(--ease-standard) focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary active:scale-97">
								<span className="min-w-0 flex-1 truncate text-body text-fg-muted">
									{props.placeholder}
								</span>
								<span
									aria-hidden
									className="flex size-8 shrink-0 items-center justify-center rounded-full bg-hairline text-fg-disabled"
								>
									<ArrowUp className="size-4" />
								</span>
							</DialogTrigger>
						</div>
					}
				/>
			</>
		);
	}

	return (
		<ComposeDialog
			{...props}
			trigger={
				<DialogTrigger className="flex w-full items-center gap-3 rounded-card bg-canvas px-5 py-4 text-left shadow-card transition duration-(--motion-fast) ease-(--ease-standard) focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary active:scale-97">
					<Avatar
						name={props.authorName}
						path={props.authorAvatar}
						seed={props.authorId}
						size={40}
					/>
					<span className="min-w-0 flex-1 truncate text-body text-fg-muted">
						{props.placeholder}
					</span>
					{/* 보낼 글이 없는 줄이라 늘 꺼진 모양이다. 누르면 줄 전체가 시트를 연다 */}
					<span
						aria-hidden
						className="flex size-9.5 shrink-0 items-center justify-center rounded-full bg-hairline text-fg-disabled"
					>
						<ArrowUp className="size-5" />
					</span>
				</DialogTrigger>
			}
		/>
	);
}
