import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { CommentThread, commentMenu } from "@/components/comment/CommentThread";
import { COMMENT_MENU, REPLY_MENU } from "@/components/comment/comment-menu";
import { PageShell } from "@/components/layout/PageShell";
import { AuthorLine } from "@/components/ui/AuthorLine";
import { ComposeRow } from "@/components/ui/ComposeRow";
import { EmptyState } from "@/components/ui/EmptyState";
import { GroupList } from "@/components/ui/GroupList";
import { createCommentAction } from "@/lib/actions/comment";
import { getComment, listCommentReplies } from "@/lib/queries/comment";
import { getPost } from "@/lib/queries/post";
import { getCurrentProfile } from "@/lib/queries/profile";
import { createClient } from "@/lib/supabase/server";
import { COMMENT_CONTENT_MAX } from "@/lib/utils/content-limits";

export const metadata: Metadata = {
	title: "댓글",
};

/**
 * 댓글 상세 — 맥락 카드(원글 한 줄과 대상 댓글)와 답글 그룹.
 * 원글 한 줄은 무엇에 대한 대화인지 끊기지 않게 남기고, 누르면 게시글로 간다
 * ([결정 0008](../../../docs/decisions/0008-reply-tree-on-post.md)).
 * 입력줄은 누르면 답글 시트를 연다 ([결정 0019](../../../docs/decisions/0019-comment-compose-modal.md)).
 *
 * 답글에는 자기 화면이 없다. 1뎁스가 끝이라 `getComment`가 답글의 주소를 없는 것으로
 * 친다 ([결정 0007](../../../docs/decisions/0007-comment-routes.md)).
 *
 * 순서대로 읽는 이유는 `app/(main)/post/[id]/page.tsx`와 같다. 이 화면에서 댓글을 지우면
 * 그 자리에 404가 뜬다 (결정 0022, 0037).
 *
 * 로딩은 `loading.tsx`, 없는 댓글은 `not-found.tsx`, 에러는 `app/error.tsx`가 받는다 (규칙 10).
 * @see docs/DESIGN.md 댓글 상세
 */
export default async function CommentPage({
	params,
}: PageProps<"/comment/[id]">) {
	const { id } = await params;
	const supabase = await createClient();

	const comment = await getComment(supabase, id);
	if (!comment) notFound();

	const [profile, post, replies] = await Promise.all([
		getCurrentProfile(supabase),
		getPost(supabase, comment.post_id),
		listCommentReplies(supabase, comment.id),
	]);

	// 글이 지워졌으면 댓글도 cascade로 같이 지워진다. 그래도 사이에 지워질 수는 있다
	if (!post) notFound();

	const displayName = profile?.display_name ?? "나";
	const postHref = `/post/${comment.post_id}`;

	const compose = {
		action: createCommentAction,
		authorAvatar: profile?.avatar_path,
		authorId: profile?.id,
		authorName: displayName,
		maxLength: COMMENT_CONTENT_MAX,
		// 내 댓글에 나에게 답글을 남기라고 하지 않는다
		placeholder:
			comment.author.id === profile?.id
				? "답글 남기기"
				: `${comment.author.display_name}님에게 답글 남기기`,
		submitLabel: "답글",
		title: "답글",
	};

	// 답글도 어느 글의 것인지 들고 있어야 한다 — RLS가 부모와 같은 글인지 본다 (`supabase/migrations/0001_init.sql:155-171`)
	const hidden = (
		<>
			<input name="post_id" type="hidden" value={comment.post_id} />
			<input name="parent_id" type="hidden" value={comment.id} />
		</>
	);

	return (
		<PageShell backHref={postHref} backLabel="게시글" card={false} title="댓글">
			<div className="flex flex-col gap-3">
				<article className="rounded-card bg-canvas px-5 py-4 shadow-card">
					<Link
						className="-mx-1 block truncate rounded-lg px-1 text-footnote text-fg-muted focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
						href={postHref}
					>
						{post.author.display_name} · {post.content}
					</Link>
					<div className="mt-3">
						<AuthorLine
							author={comment.author}
							createdAt={comment.created_at}
							menu={commentMenu(comment, profile?.id, COMMENT_MENU)}
						/>
					</div>
					<p className="mt-3 whitespace-pre-line break-keep text-headline font-normal text-fg wrap-anywhere">
						{comment.content}
					</p>
				</article>

				<div className="max-md:hidden">
					<ComposeRow {...compose}>{hidden}</ComposeRow>
				</div>

				<GroupList
					empty={
						<EmptyState
							description="먼저 남겨보세요."
							inset
							title="아직 답글이 없어요"
						/>
					}
					label={`답글 ${replies.length}`}
				>
					{replies.map((reply) => (
						<CommentThread
							comment={reply}
							config={REPLY_MENU}
							key={reply.id}
							viewerId={profile?.id}
						/>
					))}
				</GroupList>
			</div>

			<ComposeRow {...compose} variant="bar">
				{hidden}
			</ComposeRow>
		</PageShell>
	);
}
