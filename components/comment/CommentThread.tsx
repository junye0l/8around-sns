import Link from "next/link";
import { COMMENT_MENU } from "@/components/comment/comment-menu";
import { Avatar } from "@/components/ui/Avatar";
import {
	ContentMenu,
	type ContentMenuConfig,
} from "@/components/ui/ContentMenu";
import { GROUP_ROW } from "@/components/ui/GroupList";
import type { CommentReply, PostComment } from "@/lib/queries/comment";
import { commentHref } from "@/lib/utils/back-target";
import { formatRelativeTime } from "@/lib/utils/relative-time";

/**
 * 그룹 목록의 댓글 한 행. 아바타 34, 이름과 시각, 본문, 내 것이면 더 보기. 답글 화면의 답글 행도 같다.
 * 답글이 있으면 행 아래 `primary` 글자 "답글 N개 보기" 한 줄만 둔다. 답글 본문은 댓글 상세에서 본다.
 * 줄 간격 값은 docs/DESIGN.md 게시글 상세와 작업 중 사용자가 정한 값이다
 * @see docs/DESIGN.md 게시글 상세
 */
export function CommentThread({
	comment,
	viewerId,
	config = COMMENT_MENU,
	from,
}: {
	comment: CommentReply | PostComment;
	/** 지금 보는 사람의 id. 없으면 어느 행에도 메뉴가 붙지 않는다 */
	viewerId?: string;
	/** 더 보기가 무엇을 고치고 지우는지. 답글 행은 `REPLY_MENU` */
	config?: ContentMenuConfig;
	/** 게시글 상세가 받은 온 화면. 답글 링크에 실어 돌아올 때 뒤로 가기 이름이 남는다 */
	from?: string;
}) {
	const replies = "replies" in comment ? comment.replies.length : 0;

	return (
		<li className={`flex gap-3 ${GROUP_ROW}`}>
			<Avatar
				name={comment.author.display_name}
				path={comment.author.avatar_path}
				seed={comment.author.id}
				size={34}
			/>
			<div className="min-w-0 flex-1">
				<div className="flex min-w-0 items-center gap-1.5">
					<Link
						className="-m-1 min-w-0 truncate rounded-lg p-1 text-subhead font-bold text-fg focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
						href={`/u/${comment.author.id}`}
					>
						{comment.author.display_name}
					</Link>
					<time
						className="shrink-0 text-footnote text-fg-muted"
						dateTime={comment.created_at}
					>
						{formatRelativeTime(comment.created_at)}
					</time>
					{comment.author.id === viewerId && (
						<div className="-my-2 -mr-2 ml-auto">
							{commentMenu(comment, viewerId, config)}
						</div>
					)}
				</div>
				<p className="mt-0.5 whitespace-pre-line break-keep text-callout text-fg wrap-anywhere">
					{comment.content}
				</p>
				{replies > 0 && (
					<Link
						className="-m-1 mt-0.5 inline-block rounded-lg p-1 text-subhead font-semibold text-primary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary active:scale-97"
						href={commentHref(comment.id, from)}
					>
						답글 {replies}개 보기
					</Link>
				)}
			</div>
		</li>
	);
}

/** 내 칸이면 더보기 메뉴, 아니면 없음. 댓글 상세의 맥락 카드도 같은 판정을 쓴다 */
export function commentMenu(
	comment: CommentReply,
	viewerId: string | undefined,
	config: ContentMenuConfig,
) {
	if (comment.author.id !== viewerId) return undefined;

	return (
		<ContentMenu
			authorAvatar={comment.author.avatar_path}
			authorId={comment.author.id}
			authorName={comment.author.display_name}
			config={config}
			content={comment.content}
			id={comment.id}
		/>
	);
}
