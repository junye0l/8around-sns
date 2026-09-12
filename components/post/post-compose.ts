import { createPostAction } from "@/lib/actions/post";
import { POST_CONTENT_MAX } from "@/lib/utils/content";

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
