import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { PageShell } from "@/components/layout/PageShell";
import { UserRow } from "@/components/profile/UserRow";
import { Button } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/EmptyState";
import { GroupList } from "@/components/ui/GroupList";
import { SegmentLinks } from "@/components/ui/Segment";
import { listFollowing, listFollowingIds } from "@/lib/queries/follow";
import { getCurrentProfile, getProfile } from "@/lib/queries/profile";
import { createClient } from "@/lib/supabase/server";

// 주소가 id라 제목에 쓸 사람 이름이 없다. 제목을 위해 프로필을 한 번 더 읽지 않는다
export const metadata: Metadata = {
	title: "팔로잉",
};

/**
 * 이 사람이 팔로우하는 사람들. 큰 제목은 그 사람 이름이고, 아래 세그먼트로 팔로워와 팔로잉을 오간다.
 *
 * 행마다 팔로우 버튼이 선다. 보는 사람이 누구를 팔로우하는지 한 번에 읽어 행에 나눠 준다.
 * 누르면 그 행 버튼만 진행 중이 되고, 다시 그려도 목록 순서는 팔로우한 시각 그대로라 움직이지 않는다.
 *
 * 로딩과 없는 사람은 윗 폴더의 `loading.tsx` · `not-found.tsx`가 받는다 (규칙 10).
 * @see docs/DESIGN.md 팔로워 · 팔로잉
 */
export default async function Page({ params }: PageProps<"/u/[id]/following">) {
	const { id } = await params;
	const supabase = await createClient();

	const [viewer, profile] = await Promise.all([
		getCurrentProfile(supabase),
		getProfile(supabase, id),
	]);
	if (!profile) notFound();

	const [users, followingIds] = await Promise.all([
		listFollowing(supabase, profile.id),
		viewer ? listFollowingIds(supabase, viewer.id) : [],
	]);
	const followed = new Set(followingIds);

	return (
		<PageShell
			backHref={`/u/${profile.id}`}
			backLabel="프로필"
			title={profile.display_name}
		>
			<div className="flex flex-col gap-3">
				<SegmentLinks
					items={[
						{
							current: false,
							href: `/u/${profile.id}/followers`,
							label: `팔로워 ${profile.follower_count}`,
						},
						{
							current: true,
							href: `/u/${profile.id}/following`,
							label: `팔로잉 ${profile.following_count}`,
						},
					]}
					label="팔로워와 팔로잉"
				/>

				<GroupList
					empty={
						<EmptyState
							action={
								<Button href="/" size="sm">
									전체 글 둘러보기
								</Button>
							}
							inset
							title="아직 팔로우한 사람이 없어요"
						/>
					}
				>
					{users.map((user) => (
						<UserRow
							following={followed.has(user.id)}
							isMe={user.id === viewer?.id}
							key={user.id}
							user={user}
						/>
					))}
				</GroupList>
			</div>
		</PageShell>
	);
}
