import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { CommentThread } from "@/components/comment/CommentThread";
import { PageShell } from "@/components/layout/PageShell";
import { LikeButton } from "@/components/post/LikeButton";
import { PostMenu } from "@/components/post/PostMenu";
import { ComposeRow } from "@/components/ui/ComposeRow";
import { ContentCard } from "@/components/ui/ContentCard";
import { EmptyState } from "@/components/ui/EmptyState";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { createCommentAction } from "@/lib/actions/comment";
import { listPostComments } from "@/lib/queries/comment";
import { getPost } from "@/lib/queries/post";
import { getCurrentProfile } from "@/lib/queries/profile";
import { createClient } from "@/lib/supabase/server";
import { COMMENT_CONTENT_MAX } from "@/lib/utils/content-limits";

export const metadata: Metadata = {
	title: "게시글",
};

/**
 * 게시글 상세 — 글 하나와 거기 달린 댓글. 답글은 하나면 부모 댓글 아래에 세로선으로 이어
 * 보이고 둘 이상이면 접힌다. **다는** 것은 댓글 상세에서 한다
 * ([결정 0007](../../../docs/decisions/0007-comment-routes.md) ·
 * [0008](../../../docs/decisions/0008-reply-tree-on-post.md) ·
 * [0019](../../../docs/decisions/0019-comment-compose-modal.md)).
 *
 * 댓글을 게시글과 같이 읽지 않고 나눠 읽는 이유: 없는 글이면 404로 끝내야 하는데,
 * uuid가 아닌 주소까지 같이 던지면 댓글 쿼리가 먼저 터져 에러 화면으로 샌다.
 * 글을 먼저 확인하고 나면 뒤에 넘기는 id는 이미 검증된 값이다.
 *
 * 로딩은 `loading.tsx`, 없는 글은 `not-found.tsx`, 에러는 `app/error.tsx`가 받는다 (규칙 10).
 */
export default async function PostPage({ params }: PageProps<"/post/[id]">) {
	const { id } = await params;
	const supabase = await createClient();

	const post = await getPost(supabase, id);
	if (!post) notFound();

	const [profile, comments] = await Promise.all([
		getCurrentProfile(supabase),
		listPostComments(supabase, post.id),
	]);

	const displayName = profile?.display_name ?? "나";

	return (
		<PageShell backHref="/" title="게시글">
			{/* 댓글 수는 다시 붙이지 않는다. 이 글이 화면의 주인공이고 목록이 바로 아래에 있다.
			    좋아요는 여기서도 누를 수 있어야 해서 남는다 */}
			<ContentCard
				author={post.author}
				content={post.content}
				createdAt={post.created_at}
				footer={
					<LikeButton
						count={post.like_count}
						liked={post.liked}
						postId={post.id}
					/>
				}
				menu={
					post.author.id === profile?.id ? (
						<PostMenu
							authorAvatar={post.author.avatar_path}
							authorName={post.author.display_name}
							content={post.content}
							postId={post.id}
						/>
					) : undefined
				}
			/>

			<ComposeRow
				action={createCommentAction}
				authorAvatar={profile?.avatar_path}
				authorName={displayName}
				maxLength={COMMENT_CONTENT_MAX}
				placeholder={`${post.author.display_name}님에게 답글 남기기`}
				submitLabel="댓글"
				title="댓글"
			>
				<input name="post_id" type="hidden" value={post.id} />
			</ComposeRow>

			<SectionHeading label="댓글" />

			{comments.length === 0 ? (
				<EmptyState message="아직 댓글이 없어요. 먼저 남겨보세요." />
			) : (
				comments.map((comment) => (
					<CommentThread comment={comment} key={comment.id} />
				))
			)}
		</PageShell>
	);
}
