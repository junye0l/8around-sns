"use client";

import { type ReactNode, useCallback, useState } from "react";
import { Composer } from "@/components/ui/Composer";
import { Dialog, DialogContent } from "@/components/ui/Dialog";
import { createPostAction } from "@/lib/actions/post";
import { POST_CONTENT_MAX } from "@/lib/utils/content";

/**
 * 새 글 모달. 여는 자리는 둘이다, 레일의 `ComposeButton`과 추천 위쪽의 `ComposeRow`.
 * 둘 다 이 안에 `DialogTrigger`를 두고, 모달과 저장 액션은 여기 하나다 (규칙 2).
 */
export function ComposeDialog({
	authorName,
	children,
}: {
	/** 아바타에 쓸 이름. 입력칸 왼쪽에 선다 */
	authorName: string;
	/** 모달을 여는 `DialogTrigger`들 */
	children: ReactNode;
}) {
	const [open, setOpen] = useState(false);

	// Composer가 의존성으로 들고 있어서 매 렌더 새 함수를 주면 효과가 다시 돈다
	const close = useCallback(() => setOpen(false), []);

	return (
		<Dialog onOpenChange={setOpen} open={open}>
			{children}

			{/* 기본은 첫 버튼(취소)에 포커스가 간다. 쓰려고 연 창이라 입력칸으로 보낸다 */}
			<DialogContent
				onOpenAutoFocus={(event) => {
					event.preventDefault();
					(event.currentTarget as HTMLElement | null)
						?.querySelector("textarea")
						?.focus();
				}}
				title="새로운 게시글"
			>
				<Composer
					action={createPostAction}
					authorName={authorName}
					maxLength={POST_CONTENT_MAX}
					onSuccess={close}
					placeholder="무슨 생각을 하고 있나요?"
					submitLabel="게시"
				/>
			</DialogContent>
		</Dialog>
	);
}
