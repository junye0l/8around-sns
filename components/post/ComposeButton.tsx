"use client";

import { Plus } from "lucide-react";
import { ComposeDialog } from "@/components/ui/ComposeDialog";
import { DialogTrigger } from "@/components/ui/Dialog";
import { createPostAction } from "@/lib/actions/post";
import { POST_CONTENT_MAX } from "@/lib/utils/content";

/**
 * 레일의 "새로운 게시글". 어느 화면에서든 글을 쓸 수 있게 모달로 연다.
 * 추천 위쪽의 `ComposeRow`와 같은 모달이다.
 */
export function ComposeButton({
	className,
	labelClassName,
	authorName,
}: {
	className: string;
	labelClassName: string;
	/** 아바타에 쓸 이름. 입력칸 왼쪽에 선다 */
	authorName: string;
}) {
	return (
		<ComposeDialog
			action={createPostAction}
			authorName={authorName}
			maxLength={POST_CONTENT_MAX}
			placeholder="무슨 생각을 하고 있나요?"
			submitLabel="게시"
			title="새로운 게시글"
			trigger={
				<DialogTrigger className={className}>
					<Plus aria-hidden className="size-6 shrink-0" />
					<span className={labelClassName}>새로운 게시글</span>
				</DialogTrigger>
			}
		/>
	);
}
