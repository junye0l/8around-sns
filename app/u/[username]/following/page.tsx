import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { PageShell } from "@/components/layout/PageShell";
import { SideNav } from "@/components/layout/SideNav";
import { FollowTabs } from "@/components/profile/FollowTabs";
import { UserRow } from "@/components/profile/UserRow";
import { EmptyState } from "@/components/ui/EmptyState";
import { listFollowing } from "@/lib/queries/follow";
import { getCurrentProfile, getProfile } from "@/lib/queries/profile";
import { createClient } from "@/lib/supabase/server";

/** 주소의 별명만 쓴다. 제목을 위해 프로필을 한 번 더 읽지 않는다 */
export async function generateMetadata({
	params,
}: PageProps<"/u/[username]/following">): Promise<Metadata> {
	const { username } = await params;
	return { title: `@${username} 팔로잉` };
}

/**
 * 이 사람이 팔로우하는 사람들.
 *
 * 제목은 그 사람의 이름이고, 어느 목록인지는 맨 위 탭 줄이 말한다. 탭에서 반대쪽
 * 목록으로 바로 건너간다.
 *
 * 로딩과 없는 사람은 윗 폴더의 `loading.tsx` · `not-found.tsx`가 받는다 (규칙 10).
 */
export default async function FollowingPage({
	params,
}: PageProps<"/u/[username]/following">) {
	const { username } = await params;
	const supabase = await createClient();

	const [viewer, profile] = await Promise.all([
		getCurrentProfile(supabase),
		getProfile(supabase, username),
	]);
	if (!profile) notFound();

	const users = await listFollowing(supabase, profile.id);

	return (
		<PageShell
			backHref={`/u/${profile.username}`}
			nav={<SideNav profile={viewer} />}
			title={profile.display_name}
		>
			<FollowTabs current="following" profile={profile} />

			{users.length === 0 ? (
				<EmptyState message="아직 팔로우한 사람이 없어요." />
			) : (
				<ul>
					{users.map((user) => (
						<UserRow key={user.username} user={user} />
					))}
				</ul>
			)}
		</PageShell>
	);
}
