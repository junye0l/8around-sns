import { PenLine } from "lucide-react";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import type { ReactNode } from "react";
import { FollowButton } from "@/components/follow/FollowButton";
import { PageShell } from "@/components/layout/PageShell";
import { ComposeButton } from "@/components/post/ComposeButton";
import { PostList } from "@/components/post/PostList";
import { ProfileEditDialog } from "@/components/profile/ProfileEditDialog";
import { ProfileHeader } from "@/components/profile/ProfileHeader";
import { Button } from "@/components/ui/Button";
import { DialogTrigger } from "@/components/ui/Dialog";
import { EmptyState } from "@/components/ui/EmptyState";
import { isFollowing } from "@/lib/queries/follow";
import { listPostsByAuthor } from "@/lib/queries/post";
import { getCurrentProfile, getProfile } from "@/lib/queries/profile";
import { createClient } from "@/lib/supabase/server";

// 주소가 id라 제목에 쓸 사람 이름이 없다. 제목을 위해 프로필을 한 번 더 읽지 않는다
export const metadata: Metadata = {
	title: "프로필",
};

/**
 * 프로필 — 헤더 카드와 이 사람이 쓴 글. 수를 누르면 그 목록으로 간다
 * ([결정 0011](../../../docs/decisions/0011-profile-routes.md)).
 *
 * 내 프로필은 뒤로 가기 없이 큰 제목 "프로필"이다. 남의 프로필은 뒤로 가기만 두고 이름은 카드에만 쓴다.
 * 제목줄이 보이지 않아도 스크린리더가 이 화면이 누구인지 알도록 이름을 `h1`로 둔다.
 * 남의 프로필의 뒤로 가기는 전체로 간다. 어디서 왔는지 주소가 싣지 않는다.
 *
 * 프로필을 먼저 확인하고 나서 팔로우 여부와 글을 묻는 이유는 `app/(main)/post/[id]/page.tsx`와
 * 같다 — 없는 사람이면 404로 끝내야 하는데, id를 모르면 뒤 쿼리를 못 짠다.
 *
 * 로딩은 `loading.tsx`, 없는 사람은 `not-found.tsx`, 에러는 `app/error.tsx`가 받는다 (규칙 10).
 * @see docs/DESIGN.md 프로필
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

	const edit = (trigger: ReactNode) => (
		<ProfileEditDialog
			avatarPath={profile.avatar_path}
			bio={profile.bio}
			displayName={profile.display_name}
			interests={profile.interests}
			trigger={trigger}
			userId={profile.id}
		/>
	);

	return (
		<PageShell
			backHref={isMe ? undefined : "/"}
			backLabel={isMe ? undefined : "전체"}
			title={isMe ? "프로필" : profile.display_name}
			titleHidden={!isMe}
		>
			<div className="flex flex-col gap-3">
				<ProfileHeader
					action={
						isMe ? (
							edit(
								<DialogTrigger asChild>
									<Button className="w-full" variant="secondary">
										프로필 편집
									</Button>
								</DialogTrigger>,
							)
						) : (
							<FollowButton following={following} targetId={profile.id} />
						)
					}
					emptyInterests={
						isMe
							? edit(
									<DialogTrigger asChild>
										<Button className="-ml-3.5" size="sm" variant="ghost">
											관심사 추가
										</Button>
									</DialogTrigger>,
								)
							: undefined
					}
					profile={profile}
				/>

				<div>
					<h2 className="px-4.5 pt-2 pb-1 text-footnote font-semibold text-fg-muted">
						게시글 {posts.length}
					</h2>
					{posts.length === 0 ? (
						<EmptyState
							action={
								isMe ? (
									<ComposeButton
										authorAvatar={profile.avatar_path}
										authorId={profile.id}
										authorName={profile.display_name}
										trigger={
											<DialogTrigger asChild>
												<Button size="sm">첫 글 쓰기</Button>
											</DialogTrigger>
										}
									/>
								) : undefined
							}
							description={
								isMe
									? "첫 글을 남겨보세요."
									: `${profile.display_name}님이 글을 쓰면 여기에 보여요.`
							}
							icon={PenLine}
							title="아직 쓴 글이 없어요"
						/>
					) : (
						<PostList
							from={`/u/${profile.id}`}
							posts={posts}
							viewerId={viewer?.id}
						/>
					)}
				</div>
			</div>
		</PageShell>
	);
}
