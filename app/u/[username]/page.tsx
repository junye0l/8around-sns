import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { FollowButton } from "@/components/follow/FollowButton";
import { PageShell } from "@/components/layout/PageShell";
import { SideNav } from "@/components/layout/SideNav";
import { ProfileHeader } from "@/components/profile/ProfileHeader";
import { isFollowing } from "@/lib/queries/follow";
import { getCurrentProfile, getProfile } from "@/lib/queries/profile";
import { createClient } from "@/lib/supabase/server";

/** 주소의 별명만 쓴다. 제목을 위해 프로필을 한 번 더 읽지 않는다 */
export async function generateMetadata({
	params,
}: PageProps<"/u/[username]">): Promise<Metadata> {
	const { username } = await params;
	return { title: `@${username}` };
}

/**
 * 프로필 — 누구인지와 팔로워 · 팔로잉 수. 수를 누르면 그 목록으로 간다
 * ([결정 0011](../../../docs/decisions/0011-profile-routes.md)).
 *
 * 이 사람이 쓴 글은 아직 여기 없다. 요청 범위 밖이라 자리를 만들지 않는다.
 *
 * 프로필을 먼저 확인하고 나서 팔로우 여부를 묻는 이유는 `app/post/[id]/page.tsx`와
 * 같다 — 없는 사람이면 404로 끝내야 하는데, id를 모르면 두 번째 쿼리를 못 짠다.
 *
 * 로딩은 `loading.tsx`, 없는 사람은 `not-found.tsx`, 에러는 `app/error.tsx`가 받는다 (규칙 10).
 */
export default async function ProfilePage({
	params,
}: PageProps<"/u/[username]">) {
	const { username } = await params;
	const supabase = await createClient();

	const [viewer, profile] = await Promise.all([
		getCurrentProfile(supabase),
		getProfile(supabase, username),
	]);
	if (!profile) notFound();

	const isMe = viewer?.id === profile.id;
	const following = isMe
		? false
		: await isFollowing(supabase, viewer?.id ?? null, profile.id);

	return (
		<PageShell
			backHref="/"
			nav={<SideNav username={viewer?.username ?? null} />}
			title={profile.display_name}
		>
			<div className="overflow-hidden rounded-md border border-hairline bg-canvas">
				<ProfileHeader
					action={
						isMe ? undefined : (
							<FollowButton following={following} targetId={profile.id} />
						)
					}
					profile={profile}
				/>
			</div>
		</PageShell>
	);
}
