import { Users } from "lucide-react";
import type { Metadata } from "next";
import { PageShell } from "@/components/layout/PageShell";
import { PostList } from "@/components/post/PostList";
import { Button } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/EmptyState";
import { listFollowingIds } from "@/lib/queries/follow";
import { listFollowingFeed } from "@/lib/queries/post";
import { getCurrentProfile } from "@/lib/queries/profile";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = {
	title: "팔로잉 피드",
};

/**
 * 팔로잉 피드. 내가 팔로우하는 사람들의 글만 최신순으로 본다.
 *
 * 입력칸을 두지 않는다. 전체에 하나 있으면 되고, 여기서 할 일은 읽는 것이다.
 *
 * 프로필과 글을 나란히 읽는다. 누구를 팔로우하는지는 DB 함수가 JWT로 거르므로
 * 내 id를 먼저 알 필요가 없다 (결정 0025). 팔로우한 사람이 있는지는 글이 하나도 없을
 * 때만 따로 묻는다 — 빈 화면 문구가 두 가지라서다.
 *
 * 로딩은 `loading.tsx`, 에러는 `app/error.tsx`가 받는다 (규칙 10).
 */
export default async function FollowingPage() {
	const supabase = await createClient();
	const [profile, posts] = await Promise.all([
		getCurrentProfile(supabase),
		listFollowingFeed(supabase),
	]);

	// 미들웨어가 세션을 보장하지만 프로필 조회가 빌 수는 있다. 화면을 통째로 접지 않는다
	const followsAnyone =
		posts.length > 0 ||
		(profile !== null &&
			(await listFollowingIds(supabase, profile.id)).length > 0);

	return (
		<PageShell card={false} title="팔로잉">
			{posts.length === 0 ? (
				<EmptyState
					action={
						<Button href="/" size="sm">
							전체 글 둘러보기
						</Button>
					}
					description={
						followsAnyone
							? "팔로우한 사람들이 아직 글을 안 썼어요. 그동안 전체 글을 둘러보세요."
							: "전체 글에서 관심사가 맞는 사람을 찾아 팔로우해 보세요."
					}
					icon={Users}
					title={
						followsAnyone
							? "아직 새 글이 없어요"
							: "아직 팔로우한 사람이 없어요"
					}
				/>
			) : (
				<PostList card posts={posts} viewerId={profile?.id} />
			)}
		</PageShell>
	);
}
