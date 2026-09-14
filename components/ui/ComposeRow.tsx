"use client";

import { ArrowUp } from "lucide-react";
import { Avatar } from "@/components/ui/Avatar";
import { Button } from "@/components/ui/Button";
import {
	ComposeDialog,
	type ComposeDialogProps,
} from "@/components/ui/ComposeDialog";
import { DialogTrigger } from "@/components/ui/Dialog";

/**
 * 글쓰기 시트를 여는 줄. 새 글, 댓글, 답글이 같이 쓴다
 * ([결정 0019](../../docs/decisions/0019-comment-compose-modal.md)).
 *
 * 여기서 직접 쓰지 않는다. 입력은 시트 하나에서만 받는다 (규칙 2).
 *
 * `card`면 글 카드와 같은 면에 줄 전체가 버튼 하나다. 내 아바타, `fg-muted` 안내, 꺼진 원형 보내기.
 * 아니면 리뉴얼 전 한 줄 모양이다. 상세 화면이 리뉴얼 5단계(`docs/PLAN.md`)에서 옮기면 이 갈래를 지운다.
 * @see docs/DESIGN.md 글쓰기 줄
 */
export function ComposeRow({
	card = false,
	...props
}: Omit<ComposeDialogProps, "trigger"> & { card?: boolean }) {
	if (card) {
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

	return (
		<ComposeDialog
			{...props}
			trigger={
				<div className="flex items-center gap-3 border-hairline border-b px-4 py-4 md:px-6">
					<Avatar path={props.authorAvatar} />
					{/* -m-2 p-2 는 글자를 움직이지 않고 누를 자리만 넓힌다 */}
					<DialogTrigger className="-m-2 min-w-0 flex-1 truncate rounded-md p-2 text-left text-body text-fg-muted transition-colors duration-[var(--motion-fast)] ease-(--ease-standard) hover:bg-background hover:text-fg focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary">
						{props.placeholder}
					</DialogTrigger>
					<DialogTrigger asChild>
						<Button size="sm" variant="outline">
							{props.submitLabel}
						</Button>
					</DialogTrigger>
				</div>
			}
		/>
	);
}
