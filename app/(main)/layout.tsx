import { SideNav } from "@/components/layout/SideNav";
import { getCurrentProfile } from "@/lib/queries/profile";
import { createClient } from "@/lib/supabase/server";

/**
 * 로그인 뒤 화면들의 뼈대. 왼쪽 메뉴, 가운데 칸, 1280px 이상 오른쪽 칸이다.
 * 레이아웃은 화면을 옮겨도 다시 그려지지 않아서 메뉴는 그대로 있고 아래 `loading.tsx`만 바뀐다. 결정 0028.
 *
 * 전체 최대 폭 1180px, 칸 사이 24px, 가운데 600px, 오른쪽 300px이다 (`docs/DESIGN.md` 반응형).
 * 오른쪽 칸의 내 프로필 요약은 리뉴얼 6단계(`docs/PLAN.md`)가 채운다. 그때까지 자리만 비운다.
 *
 * 프로필은 기다리지 않고 Promise로 넘긴다. 기다리면 새로고침 때 아래 스켈레톤까지 같이 늦게 뜬다.
 * 로그인 확인은 여기서 하지 않는다. 미들웨어와 각 화면이 한다.
 */
export default async function MainLayout({ children }: LayoutProps<"/">) {
	const supabase = await createClient();

	// 레이아웃은 이동 중 다시 돌지 않아 실패한 Promise가 그대로 남는다. 메뉴 때문에 화면 전체가 에러로 넘어가지 않게 두 줄만 접는다
	const profile = getCurrentProfile(supabase).catch(() => null);

	return (
		<div className="mx-auto flex w-full max-w-295 flex-1 md:gap-6 md:pr-6 lg:pl-6 xl:px-0">
			<SideNav profile={profile} />
			<div className="flex min-w-0 flex-1 justify-center">{children}</div>
			<div aria-hidden className="w-75 shrink-0 max-xl:hidden" />
		</div>
	);
}
