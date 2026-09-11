"use client";

import { Plus } from "lucide-react";
import { useCallback, useState } from "react";
import { Composer } from "@/components/ui/Composer";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/Dialog";
import { createPostAction } from "@/lib/actions/post";
import { POST_CONTENT_MAX } from "@/lib/utils/content";

/**
 * 레일의 "새로운 게시글". 어느 화면에서든 글을 쓸 수 있게 모달로 연다.
 *
 * 추천 화면 위쪽의 입력칸은 그대로 둔다. 그건 피드를 보다가 바로 쓰는 자리고,
 * 이건 어디서든 부르는 자리다. 둘 다 같은 `Composer`와 같은 액션을 쓴다 (규칙 2).
 */
export function ComposeButton({
	className,
	authorName,
}: {
	className: string;
	/** 아바타에 쓸 이름. 입력칸 왼쪽에 선다 */
	authorName: string;
}) {
	const [open, setOpen] = useState(false);

	// Composer가 의존성으로 들고 있어서 매 렌더 새 함수를 주면 효과가 다시 돈다
	const close = useCallback(() => setOpen(false), []);

	return (
		<Dialog onOpenChange={setOpen} open={open}>
			<DialogTrigger className={className}>
				<Plus aria-hidden className="size-5 shrink-0" />
				새로운 게시글
			</DialogTrigger>

			<DialogContent title="새로운 게시글">
				<Composer
					action={createPostAction}
					authorName={authorName}
					maxLength={POST_CONTENT_MAX}
					onSuccess={close}
					pendingLabel="올리는 중"
					placeholder="무슨 생각을 하고 있나요?"
					submitLabel="올리기"
				/>
			</DialogContent>
		</Dialog>
	);
}
