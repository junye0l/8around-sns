import type { ContentMenuConfig } from "@/components/ui/ContentMenu";
import {
	deleteCommentAction,
	updateCommentAction,
} from "@/lib/actions/comment";
import { COMMENT_CONTENT_MAX } from "@/lib/utils/content-limits";

/**
 * 내 댓글 더보기 메뉴의 설정. 게시글 화면과 답글 화면이 같이 쓴다. 결정 0037.
 * 최상위 댓글을 지우면 답글이 cascade로 같이 사라지므로 그것을 말한다 (`supabase/migrations/0001_init.sql:79`).
 */
export const COMMENT_MENU: ContentMenuConfig = {
	noun: "댓글",
	idName: "comment_id",
	updateAction: updateCommentAction,
	deleteAction: deleteCommentAction,
	maxLength: COMMENT_CONTENT_MAX,
	placeholder: "내용을 입력해 주세요",
	editTitle: "댓글 수정",
	deleteTitle: "댓글을 삭제하시겠어요?",
	deleteDescription: "달린 답글도 함께 삭제됩니다.",
};

/** 답글은 딸린 것이 없어 설명만 다르다 */
export const REPLY_MENU: ContentMenuConfig = {
	...COMMENT_MENU,
	noun: "답글",
	editTitle: "답글 수정",
	deleteTitle: "답글을 삭제하시겠어요?",
	deleteDescription: "삭제하면 되돌릴 수 없습니다.",
};
