import type { Metadata } from "next";
import { PageShell } from "@/components/layout/PageShell";
import { SideNav } from "@/components/layout/SideNav";
import { CommentCount } from "@/components/ui/CommentCount";
import { ContentCard } from "@/components/ui/ContentCard";
import { EmptyState } from "@/components/ui/EmptyState";
import { listFollowingFeed } from "@/lib/queries/post";
import { getCurrentProfile } from "@/lib/queries/profile";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = {
	title: "팔로잉 피드",
};

/**
 * 팔로잉 피드. 내가 팔로우하는 사람들의 글만 최신순으로 본다.
 *
 * 입력칸을 두지 않는다. 추천에 하나 있으면 되고, 여기서 할 일은 읽는 것이다.
 *
 * 프로필을 먼저 읽는 이유는 팔로우 목록이 내 id로 걸리기 때문이다. 순서를
 * 병렬로 바꿀 수 없다.
 *
 * 로딩은 `loading.tsx`, 에러는 `app/error.tsx`가 받는다 (규칙 10).
 */
export default async function FollowingPage() {
	const supabase = await createClient();
	const profile = await getCurrentProfile(supabase);

	// 미들웨어가 세션을 보장하지만 프로필 조회가 빌 수는 있다. 화면을 통째로 접지 않는다
	const feed = profile
		? await listFollowingFeed(supabase, profile.id)
		: { posts: [], followsAnyone: false };

	return (
		<PageShell nav={<SideNav profile={profile} />} title="팔로잉">
			{feed.posts.length === 0 ? (
				<EmptyState
					message={
						feed.followsAnyone
							? "팔로우한 사람들이 아직 글을 안 썼어요."
							: "아직 팔로우한 사람이 없어요. 추천에서 마음에 드는 사람을 팔로우해 보세요."
					}
				/>
			) : (
				feed.posts.map((post) => (
					<ContentCard
						author={post.author}
						content={post.content}
						createdAt={post.created_at}
						footer={
							<CommentCount
								count={post.comment_count}
								href={`/post/${post.id}`}
								label="댓글"
							/>
						}
						key={post.id}
					/>
				))
			)}
		</PageShell>
	);
}
