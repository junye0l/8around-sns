import type { ContentMenuConfig } from "@/components/ui/ContentMenu";
import {
	createPostAction,
	deletePostAction,
	updatePostAction,
} from "@/lib/actions/post";
import { POST_CONTENT_MAX } from "@/lib/utils/content-limits";

/**
 * 새 글 모달의 설정. 레일 버튼과 추천 위쪽 줄이 같은 모달을 여므로 값은 여기 한 곳에 있다 (규칙 2).
 * @see components/ui/ComposeDialog.tsx 받는 쪽
 */
export const POST_COMPOSE = {
	action: createPostAction,
	maxLength: POST_CONTENT_MAX,
	placeholder: "무슨 생각을 하고 있나요?",
	submitLabel: "게시",
	title: "새로운 게시글",
} as const;

/** 내 글 더보기 메뉴의 설정. 목록과 상세가 같이 쓴다 */
export const POST_MENU: ContentMenuConfig = {
	noun: "글",
	idName: "post_id",
	updateAction: updatePostAction,
	deleteAction: deletePostAction,
	maxLength: POST_CONTENT_MAX,
	placeholder: POST_COMPOSE.placeholder,
	editTitle: "글 수정",
	deleteTitle: "게시물을 삭제하시겠어요?",
	deleteDescription: "좋아요와 댓글도 함께 삭제됩니다.",
};
