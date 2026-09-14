"use client";

import type { ReactNode } from "react";
import { POST_COMPOSE } from "@/components/post/post-compose";
import { ComposeDialog } from "@/components/ui/ComposeDialog";

/**
 * 메뉴의 새 글 쓰기. 어느 화면에서든 글을 쓸 수 있게 모달로 연다.
 * 전체 위쪽의 `ComposeRow`와 같은 모달이다. 여는 버튼은 `DialogTrigger`로 받는다.
 */
export function ComposeButton({
	trigger,
	authorName,
	authorAvatar,
	authorId,
}: {
	trigger: ReactNode;
	/** 입력칸 왼쪽에 서는 이름 */
	authorName: string;
	/** 이름 옆 아바타에 쓸 `profiles.avatar_path` */
	authorAvatar: string | null;
	/** 사진 없는 아바타의 톤을 고르는 사용자 id */
	authorId?: string;
}) {
	return (
		<ComposeDialog
			{...POST_COMPOSE}
			authorAvatar={authorAvatar}
			authorId={authorId}
			authorName={authorName}
			trigger={trigger}
		/>
	);
}
