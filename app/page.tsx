import { SideNav } from "@/components/layout/SideNav";
import { PostCard } from "@/components/post/PostCard";
import { PostComposer } from "@/components/post/PostComposer";
import { listFeed } from "@/lib/queries/post";
import { getCurrentProfile } from "@/lib/queries/profile";
import { createClient } from "@/lib/supabase/server";

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
		<>
			<SideNav username={username} />

			{/* 레일은 fixed라 흐름 밖이다. 컬럼은 레일 오른쪽이 아니라 뷰포트 가운데에 선다.
			    min-w-6xl(1152px = 레일 240 × 2 + 컬럼 672)보다 좁아지면 겹치는 대신
			    가로 스크롤이 생긴다 — 좁은 폭 대응은 `docs/PLAN.md` §7에서 따로 한다 */}
			<div className="min-w-6xl">
				<main className="mx-auto w-full max-w-2xl px-4 pb-4">
					<h1 className="sticky top-0 z-10 bg-background py-4 text-title text-fg">
						추천
					</h1>

					<div className="overflow-hidden rounded-md border border-hairline bg-canvas">
						<PostComposer authorName={displayName} />

						{posts.length === 0 ? (
							// 빈 상태는 한 줄로 이유를 말하고 다음 행동만 가리킨다 (DESIGN.md §4 · §6).
							// 작성칸이 바로 위에 있으므로 버튼을 따로 두지 않는다
							<p className="py-16 text-center text-body-sm text-fg-muted">
								아직 올라온 글이 없어요. 첫 글을 남겨보세요.
							</p>
						) : (
							posts.map((post) => <PostCard key={post.id} post={post} />)
						)}
					</div>
				</main>
			</div>
		</>
	);
}
