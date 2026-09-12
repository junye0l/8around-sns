"use client";

import { ComposeDialog } from "@/components/post/ComposeDialog";
import { Avatar } from "@/components/ui/Avatar";
import { Button } from "@/components/ui/Button";
import { DialogTrigger } from "@/components/ui/Dialog";

/**
 * 추천 위쪽의 글쓰기 줄. 아바타, 문구, 게시 버튼이 한 줄이고 누르면 모달이 열린다.
 * 여기서 직접 쓰지 않는다. 입력은 모달 하나에서만 받아 레일 버튼과 같은 길을 탄다 (규칙 2).
 *
 * 문구와 버튼이 각각 트리거다. 버튼 안에 버튼을 넣을 수 없어 줄 전체를 하나로 묶지 않는다.
 */
export function ComposeRow({ authorName }: { authorName: string }) {
	return (
		<ComposeDialog authorName={authorName}>
			<div className="flex items-center gap-3 border-hairline border-b px-6 py-3">
				<Avatar name={authorName} />
				<DialogTrigger className="min-w-0 flex-1 truncate rounded-md text-left text-body text-fg-muted focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary">
					무슨 생각을 하고 있나요?
				</DialogTrigger>
				<DialogTrigger asChild>
					<Button size="sm" variant="outline">
						게시
					</Button>
				</DialogTrigger>
			</div>
		</ComposeDialog>
	);
}
