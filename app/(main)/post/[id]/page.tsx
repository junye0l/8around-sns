import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { CommentThread } from "@/components/comment/CommentThread";
import { PageShell } from "@/components/layout/PageShell";
import { LikeButton } from "@/components/post/LikeButton";
import { POST_MENU } from "@/components/post/post-compose";
import { AuthorLine } from "@/components/ui/AuthorLine";
import { CommentCount } from "@/components/ui/CommentCount";
import { ComposeRow } from "@/components/ui/ComposeRow";
import { ContentMenu } from "@/components/ui/ContentMenu";
import { EmptyState } from "@/components/ui/EmptyState";
import { GroupList } from "@/components/ui/GroupList";
import { createCommentAction } from "@/lib/actions/comment";
import { listPostComments } from "@/lib/queries/comment";
import { getPost } from "@/lib/queries/post";
import { getCurrentProfile } from "@/lib/queries/profile";
import { createClient } from "@/lib/supabase/server";
import { backTarget } from "@/lib/utils/back-target";
import { COMMENT_CONTENT_MAX } from "@/lib/utils/content-limits";

export const metadata: Metadata = {
	title: "게시글",
};

/**
 * 게시글 상세 — 원글 카드와 댓글 그룹. 답글은 댓글 행 아래 "답글 N개 보기"로만 알리고,
 * 보는 것과 다는 것은 댓글 상세에서 한다
 * ([결정 0007](../../../docs/decisions/0007-comment-routes.md) ·
 * [0019](../../../docs/decisions/0019-comment-compose-modal.md)).
 *
 * 뒤로 가기는 주소의 `from`이 가리키는 화면으로 간다 (`lib/utils/back-target.ts`).
 * 입력줄은 768px 미만이면 화면 아래, 이상이면 원글 카드 바로 아래 글쓰기 줄이다.
 *
 * 댓글을 게시글과 같이 읽지 않고 나눠 읽는 이유: 없는 글이면 404로 끝내야 하는데,
 * uuid가 아닌 주소까지 같이 던지면 댓글 쿼리가 먼저 터져 에러 화면으로 샌다.
 *
 * 로딩은 `loading.tsx`, 없는 글은 `not-found.tsx`, 에러는 `app/error.tsx`가 받는다 (규칙 10).
 * @see docs/DESIGN.md 게시글 상세
 */
export default async function PostPage({
	params,
	searchParams,
}: PageProps<"/post/[id]">) {
	const [{ id }, { from }] = await Promise.all([params, searchParams]);
	const supabase = await createClient();

	const post = await getPost(supabase, id);
	if (!post) notFound();

	const [profile, comments] = await Promise.all([
		getCurrentProfile(supabase),
		listPostComments(supabase, post.id),
	]);

	const displayName = profile?.display_name ?? "나";
	const back = backTarget(from);
	const mine = post.author.id === profile?.id;

	const compose = {
		action: createCommentAction,
		authorAvatar: profile?.avatar_path,
		authorId: profile?.id,
		authorName: displayName,
		maxLength: COMMENT_CONTENT_MAX,
		// 내 글에 나에게 댓글을 남기라고 하지 않는다
		placeholder: mine
			? "댓글 남기기"
			: `${post.author.display_name}님에게 댓글 남기기`,
		submitLabel: "댓글",
		title: "댓글",
	};

	return (
		<PageShell backHref={back.href} backLabel={back.label} title="게시글">
			<div className="flex flex-col gap-3">
				<article className="rounded-card bg-canvas px-5 py-4 shadow-card">
					<AuthorLine
						author={post.author}
						createdAt={post.created_at}
						menu={
							mine ? (
								<ContentMenu
									authorAvatar={post.author.avatar_path}
									authorId={post.author.id}
									authorName={post.author.display_name}
									config={POST_MENU}
									content={post.content}
									id={post.id}
								/>
							) : undefined
						}
					/>
					<p className="mt-3 whitespace-pre-line break-keep text-title text-fg wrap-anywhere">
						{post.content}
					</p>
					<div className="mt-4 flex flex-wrap items-start gap-2">
						<LikeButton
							count={post.like_count}
							liked={post.liked}
							postId={post.id}
						/>
						<CommentCount count={post.comment_count} label="댓글" />
					</div>
				</article>

				<div className="max-md:hidden">
					<ComposeRow {...compose}>
						<input name="post_id" type="hidden" value={post.id} />
					</ComposeRow>
				</div>

				<GroupList
					empty={
						<EmptyState
							description="먼저 남겨보세요."
							inset
							title="아직 댓글이 없어요"
						/>
					}
					label={`댓글 ${comments.length}`}
				>
					{comments.map((comment) => (
						<CommentThread
							comment={comment}
							from={back.href}
							key={comment.id}
							viewerId={profile?.id}
						/>
					))}
				</GroupList>
			</div>

			<ComposeRow {...compose} variant="bar">
				<input name="post_id" type="hidden" value={post.id} />
			</ComposeRow>
		</PageShell>
	);
}
