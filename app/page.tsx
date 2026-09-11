import { PageShell } from "@/components/layout/PageShell";
import { SideNav } from "@/components/layout/SideNav";
import { CommentCount } from "@/components/ui/CommentCount";
import { Composer } from "@/components/ui/Composer";
import { ContentCard } from "@/components/ui/ContentCard";
import { createPostAction } from "@/lib/actions/post";
import { listFeed } from "@/lib/queries/post";
import { getCurrentProfile } from "@/lib/queries/profile";
import { createClient } from "@/lib/supabase/server";
import { POST_CONTENT_MAX } from "@/lib/utils/content";

/**
 * 추천 — 올라온 글을 전부 최신순으로 본다. 팔로잉 기준으로 거르는 화면은
 * 이 옆에 따로 선다 (`docs/PLAN.md` §5). 그래서 이름이 "피드"가 아니라 "추천"이다.
 *
 * 비로그인은 미들웨어가 `/login`으로 돌려보내므로 여기까지 오지 않는다
 * ([결정 0006](../docs/decisions/0006-feed-requires-login.md)).
 *
 * 로딩은 `app/loading.tsx`, 에러는 `app/error.tsx`가 받는다 (규칙 10).
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
		<PageShell nav={<SideNav username={username} />} title="추천">
			<div className="overflow-hidden rounded-md border border-hairline bg-canvas">
				<Composer
					action={createPostAction}
					authorName={displayName}
					maxLength={POST_CONTENT_MAX}
					pendingLabel="올리는 중"
					placeholder="무슨 생각을 하고 있나요?"
					submitLabel="올리기"
				/>

				{posts.length === 0 ? (
					// 빈 상태는 한 줄로 이유를 말하고 다음 행동만 가리킨다 (DESIGN.md §4 · §6).
					// 작성칸이 바로 위에 있으므로 버튼을 따로 두지 않는다
					<p className="py-16 text-center text-body-sm text-fg-muted">
						아직 올라온 글이 없어요. 첫 글을 남겨보세요.
					</p>
				) : (
					posts.map((post) => (
						<ContentCard
							author={post.author}
							content={post.content}
							createdAt={post.created_at}
							footer={
								<CommentCount
									count={post.comment_count}
									href={`/post/${post.id}`}
									label="댓글"
								/>
							}
							key={post.id}
						/>
					))
				)}
			</div>
		</PageShell>
	);
}
