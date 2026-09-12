import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { PageShell } from "@/components/layout/PageShell";
import { SideNav } from "@/components/layout/SideNav";
import { UserRow } from "@/components/profile/UserRow";
import { EmptyState } from "@/components/ui/EmptyState";
import { listFollowers } from "@/lib/queries/follow";
import { getCurrentProfile, getProfile } from "@/lib/queries/profile";
import { createClient } from "@/lib/supabase/server";

/** 주소의 별명만 쓴다. 제목을 위해 프로필을 한 번 더 읽지 않는다 */
export async function generateMetadata({
	params,
}: PageProps<"/u/[username]/followers">): Promise<Metadata> {
	const { username } = await params;
	return { title: `@${username} 팔로워` };
}

/**
 * 이 사람을 팔로우하는 사람들.
 *
 * 제목에 누구인지를 넣지 않는다 — 뒤로 버튼이 바로 그 프로필을 가리키고,
 * `PageShell`에는 부제 자리가 없다. 긴 별명을 제목에 넣으면 줄이 넘친다.
 *
 * 로딩과 없는 사람은 윗 폴더의 `loading.tsx` · `not-found.tsx`가 받는다 (규칙 10).
 */
export default async function FollowersPage({
	params,
}: PageProps<"/u/[username]/followers">) {
	const { username } = await params;
	const supabase = await createClient();

	const [viewer, profile] = await Promise.all([
		getCurrentProfile(supabase),
		getProfile(supabase, username),
	]);
	if (!profile) notFound();

	const users = await listFollowers(supabase, profile.id);

	return (
		<PageShell
			backHref={`/u/${profile.username}`}
			nav={<SideNav profile={viewer} />}
			title="팔로워"
		>
			{users.length === 0 ? (
				<EmptyState message="아직 팔로워가 없어요." />
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
