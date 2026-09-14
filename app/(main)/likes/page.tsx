import { Heart } from "lucide-react";
import type { Metadata } from "next";
import { PageShell } from "@/components/layout/PageShell";
import { PostList } from "@/components/post/PostList";
import { Button } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/EmptyState";
import { listLikedFeed } from "@/lib/queries/post";
import { getCurrentProfile } from "@/lib/queries/profile";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = {
	title: "좋아요한 글",
};

/**
 * 좋아요한 글. 내가 좋아요를 누른 글만, 최근에 누른 것부터 본다.
 *
 * 입력칸을 두지 않는다. 팔로잉과 같이 읽는 화면이다.
 *
 * 여기서 좋아요를 취소해도 글이 목록에서 바로 빠지지 않는다. 좋아요는 화면을 다시 그리지
 * 않고(결정 0024), 잘못 눌렀으면 그 자리에서 다시 누를 수 있다. 다음 방문 때 빠진다.
 *
 * 로딩은 `loading.tsx`, 에러는 `app/error.tsx`가 받는다 (규칙 10).
 */
export default async function LikesPage() {
	const supabase = await createClient();
	const [profile, posts] = await Promise.all([
		getCurrentProfile(supabase),
		listLikedFeed(supabase),
	]);

	return (
		<PageShell card={false} title="좋아요">
			{posts.length === 0 ? (
				<EmptyState
					action={
						<Button href="/" size="sm">
							전체 글 둘러보기
						</Button>
					}
					description="마음에 드는 글에 하트를 눌러 보세요."
					icon={Heart}
					title="아직 좋아요한 글이 없어요"
				/>
			) : (
				<PostList card from="/likes" posts={posts} viewerId={profile?.id} />
			)}
		</PageShell>
	);
}
