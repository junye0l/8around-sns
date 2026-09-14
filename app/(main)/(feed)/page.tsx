import { PenLine } from "lucide-react";
import type { Metadata } from "next";
import { PageShell } from "@/components/layout/PageShell";
import { ComposeButton } from "@/components/post/ComposeButton";
import { PostList } from "@/components/post/PostList";
import { POST_COMPOSE } from "@/components/post/post-compose";
import { Button } from "@/components/ui/Button";
import { ComposeRow } from "@/components/ui/ComposeRow";
import { DialogTrigger } from "@/components/ui/Dialog";
import { EmptyState } from "@/components/ui/EmptyState";
import { listFeed } from "@/lib/queries/post";
import { getCurrentProfile } from "@/lib/queries/profile";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = {
	title: "전체",
};

/**
 * 전체. 올라온 글을 전부 최신순으로 본다. 누가 골라주지 않으므로 "추천"이라 부르지 않는다 (결정 0044).
 * 주소 `/`와 그룹 이름 `(feed)`는 공유된 링크가 깨지지 않게 그대로 둔다.
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
	const displayName = profile?.display_name ?? "나";

	return (
		<PageShell card={false} title="전체">
			<div className="flex flex-col gap-3">
				<ComposeRow
					{...POST_COMPOSE}
					authorAvatar={profile?.avatar_path}
					authorId={profile?.id}
					authorName={displayName}
					card
				/>

				{posts.length === 0 ? (
					<EmptyState
						action={
							<ComposeButton
								authorAvatar={profile?.avatar_path ?? null}
								authorId={profile?.id}
								authorName={displayName}
								trigger={
									<DialogTrigger asChild>
										<Button size="sm">첫 글 쓰기</Button>
									</DialogTrigger>
								}
							/>
						}
						description="첫 글을 남겨보세요."
						icon={PenLine}
						title="아직 올라온 글이 없어요"
					/>
				) : (
					<PostList card posts={posts} viewerId={profile?.id} />
				)}
			</div>
		</PageShell>
	);
}
