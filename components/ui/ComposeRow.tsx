"use client";

import { Avatar } from "@/components/ui/Avatar";
import { Button } from "@/components/ui/Button";
import {
	ComposeDialog,
	type ComposeDialogProps,
} from "@/components/ui/ComposeDialog";
import { DialogTrigger } from "@/components/ui/Dialog";

/**
 * 모달을 여는 한 줄. 아바타, 문구, 버튼이 한 줄이고 누르면 모달이 열린다.
 * 추천의 글쓰기와 상세 화면의 댓글·답글이 같이 쓴다
 * ([결정 0019](../../docs/decisions/0019-comment-compose-modal.md)).
 *
 * 여기서 직접 쓰지 않는다. 입력은 모달 하나에서만 받는다 (규칙 2).
 *
 * 문구와 버튼이 각각 트리거다. 버튼 안에 버튼을 넣을 수 없어 줄 전체를 하나로 묶지 않는다.
 */
export function ComposeRow(props: Omit<ComposeDialogProps, "trigger">) {
	return (
		<ComposeDialog
			{...props}
			trigger={
				<div className="flex items-center gap-3 border-hairline border-b px-6 py-4">
					<Avatar name={props.authorName} />
					{/* -m-2 p-2 는 글자를 움직이지 않고 누를 자리만 넓힌다. 아바타와의 12px 간격이
					    그대로 남는다. `ContentCard`의 이름 링크가 쓰는 방식과 같다 */}
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
