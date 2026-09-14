import type { Metadata } from "next";
import { PageShell } from "@/components/layout/PageShell";
import { PostList } from "@/components/post/PostList";
import { POST_COMPOSE } from "@/components/post/post-compose";
import { ComposeRow } from "@/components/ui/ComposeRow";
import { EmptyState } from "@/components/ui/EmptyState";
import { listFeed } from "@/lib/queries/post";
import { getCurrentProfile } from "@/lib/queries/profile";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = {
	title: "추천",
};

/**
 * 추천. 올라온 글을 전부 최신순으로 본다. 팔로잉 기준으로 거르는 화면이 옆에 따로 서기
 * 때문에 이름이 "피드"가 아니라 "추천"이다.
 *
 * 비로그인은 미들웨어가 `/login`으로 돌려보내므로 여기까지 오지 않는다
 * ([결정 0006](../docs/decisions/0006-feed-requires-login.md)).
 *
 * 로딩은 `loading.tsx`, 에러는 `app/error.tsx`가 받는다 (규칙 10).
 */
export default async function Home() {
	const supabase = await createClient();
	const [profile, posts] = await Promise.all([
		getCurrentProfile(supabase),
		listFeed(supabase),
	]);

	// 미들웨어가 세션을 보장하지만 프로필 조회가 빌 수는 있다. 화면을 통째로 접지 않는다
	const username = profile?.username ?? "나";
	const displayName = profile?.display_name ?? username;

	return (
		<PageShell title="추천">
			<ComposeRow
				{...POST_COMPOSE}
				authorAvatar={profile?.avatar_path}
				authorName={displayName}
			/>

			{posts.length === 0 ? (
				<EmptyState message="아직 올라온 글이 없어요. 첫 글을 남겨보세요." />
			) : (
				<PostList posts={posts} viewerUsername={profile?.username} />
			)}
		</PageShell>
	);
}
