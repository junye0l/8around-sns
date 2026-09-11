import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { PageShell } from "@/components/layout/PageShell";
import { SideNav } from "@/components/layout/SideNav";
import { Composer } from "@/components/ui/Composer";
import { ContentCard } from "@/components/ui/ContentCard";
import { EmptyState } from "@/components/ui/EmptyState";
import { createCommentAction } from "@/lib/actions/comment";
import { getComment, listCommentReplies } from "@/lib/queries/comment";
import { getPost } from "@/lib/queries/post";
import { getCurrentProfile } from "@/lib/queries/profile";
import { createClient } from "@/lib/supabase/server";
import { COMMENT_CONTENT_MAX } from "@/lib/utils/content";

export const metadata: Metadata = {
	title: "답글",
};

/**
 * 답글 화면 — 위에서부터 게시글 본문 · 답글 달 댓글 · 입력칸 · 이미 달린 답글.
 * 본문을 남겨두는 이유는 무엇에 대한 대화인지가 화면을 옮겨도 안 끊기게 하려는 것이다
 * ([결정 0008](../../../docs/decisions/0008-reply-tree-on-post.md)).
 *
 * 답글에는 자기 화면이 없다. 1뎁스가 끝이라 `getComment`가 답글의 주소를 없는 것으로
 * 친다 ([결정 0007](../../../docs/decisions/0007-comment-routes.md)).
 *
 * 순서대로 읽는 이유는 `app/post/[id]/page.tsx`와 같다 — uuid가 아닌 주소가 뒤쪽
 * 쿼리까지 가면 캐스팅에서 터져 에러 화면으로 샌다. 댓글을 먼저 확인하고 나면
 * 뒤에 넘기는 id는 이미 검증된 값이다.
 *
 * 로딩은 `loading.tsx`, 없는 댓글은 `not-found.tsx`, 에러는 `app/error.tsx`가 받는다 (규칙 10).
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

	const username = profile?.username ?? "나";
	const displayName = profile?.display_name ?? username;

	return (
		<PageShell
			backHref={`/post/${comment.post_id}`}
			nav={<SideNav profile={profile} />}
			title="답글"
		>
			<div className="overflow-hidden rounded-md border border-hairline bg-canvas">
				{/* 본문과 아래 댓글은 세로선으로 이어진다 — 무엇에 대한 대화인지가 안 끊긴다 */}
				<ContentCard
					author={post.author}
					connected
					content={post.content}
					createdAt={post.created_at}
				/>

				{/* 답글 달 댓글. 게시글 화면과 달리 들여쓰지 않는다 — 여기서는 이 댓글이
				    주인공이고, 옆에 나란히 설 다른 댓글이 없다 */}
				<ContentCard
					author={comment.author}
					content={comment.content}
					createdAt={comment.created_at}
				/>

				<Composer
					action={createCommentAction}
					authorName={displayName}
					maxLength={COMMENT_CONTENT_MAX}
					pendingLabel="남기는 중"
					placeholder={`${comment.author.username}님에게 답글 남기기`}
					submitLabel="답글"
				>
					{/* 답글도 어느 글의 것인지 들고 있어야 한다 — RLS가 부모와 같은 글인지 본다
					    (`supabase/migrations/0001_init.sql:155-171`) */}
					<input name="post_id" type="hidden" value={comment.post_id} />
					<input name="parent_id" type="hidden" value={comment.id} />
				</Composer>

				{replies.length === 0 ? (
					<EmptyState message="아직 답글이 없어요. 먼저 남겨보세요." />
				) : (
					replies.map((reply) => (
						<ContentCard
							author={reply.author}
							content={reply.content}
							createdAt={reply.created_at}
							key={reply.id}
						/>
					))
				)}
			</div>
		</PageShell>
	);
}
