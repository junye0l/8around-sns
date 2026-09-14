import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { FollowButton } from "@/components/follow/FollowButton";
import { PageShell } from "@/components/layout/PageShell";
import { PostList } from "@/components/post/PostList";
import { ProfileEditDialog } from "@/components/profile/ProfileEditDialog";
import { ProfileHeader } from "@/components/profile/ProfileHeader";
import { EmptyState } from "@/components/ui/EmptyState";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { isFollowing } from "@/lib/queries/follow";
import { listPostsByAuthor } from "@/lib/queries/post";
import { getCurrentProfile, getProfile } from "@/lib/queries/profile";
import { createClient } from "@/lib/supabase/server";

// 주소가 id라 제목에 쓸 사람 이름이 없다. 제목을 위해 프로필을 한 번 더 읽지 않는다
export const metadata: Metadata = {
	title: "프로필",
};

/**
 * 프로필 — 누구인지와 팔로워 · 팔로잉 수, 그 아래 이 사람이 쓴 글. 수를 누르면
 * 그 목록으로 간다 ([결정 0011](../../../docs/decisions/0011-profile-routes.md)).
 *
 * 프로필을 먼저 확인하고 나서 팔로우 여부와 글을 묻는 이유는 `app/(main)/post/[id]/page.tsx`와
 * 같다 — 없는 사람이면 404로 끝내야 하는데, id를 모르면 뒤 쿼리를 못 짠다.
 *
 * 로딩은 `loading.tsx`, 없는 사람은 `not-found.tsx`, 에러는 `app/error.tsx`가 받는다 (규칙 10).
 */
export default async function ProfilePage({ params }: PageProps<"/u/[id]">) {
	const { id } = await params;
	const supabase = await createClient();

	const [viewer, profile] = await Promise.all([
		getCurrentProfile(supabase),
		getProfile(supabase, id),
	]);
	if (!profile) notFound();

	const isMe = viewer?.id === profile.id;
	const [following, posts] = await Promise.all([
		isMe ? false : isFollowing(supabase, viewer?.id ?? null, profile.id),
		listPostsByAuthor(supabase, profile.id),
	]);

	return (
		<PageShell backHref="/" title={profile.display_name}>
			<ProfileHeader
				action={
					isMe ? (
						<ProfileEditDialog
							avatarPath={profile.avatar_path}
							bio={profile.bio}
							displayName={profile.display_name}
							interests={profile.interests}
						/>
					) : (
						<FollowButton following={following} targetId={profile.id} />
					)
				}
				profile={profile}
			/>

			<SectionHeading label="게시글" />

			{posts.length === 0 ? (
				<EmptyState
					message={
						isMe
							? "아직 쓴 글이 없어요. 첫 글을 남겨보세요."
							: "아직 쓴 글이 없어요."
					}
				/>
			) : (
				<PostList posts={posts} viewerId={viewer?.id} />
			)}
		</PageShell>
	);
}
