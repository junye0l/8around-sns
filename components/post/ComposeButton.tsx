"use client";

import { Plus } from "lucide-react";
import { ComposeDialog } from "@/components/post/ComposeDialog";
import { DialogTrigger } from "@/components/ui/Dialog";

/**
 * 레일의 "새로운 게시글". 어느 화면에서든 글을 쓸 수 있게 모달로 연다.
 * 추천 위쪽의 `ComposeRow`와 같은 모달이다.
 */
export function ComposeButton({
	className,
	authorName,
}: {
	className: string;
	/** 아바타에 쓸 이름. 입력칸 왼쪽에 선다 */
	authorName: string;
}) {
	return (
		<ComposeDialog authorName={authorName}>
			<DialogTrigger className={className}>
				<Plus aria-hidden className="size-6 shrink-0" />
				<span className="sr-only">새로운 게시글</span>
			</DialogTrigger>
		</ComposeDialog>
	);
}
