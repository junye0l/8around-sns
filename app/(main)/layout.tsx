import { SideNav } from "@/components/layout/SideNav";
import { getCurrentProfile } from "@/lib/queries/profile";
import { createClient } from "@/lib/supabase/server";

/**
 * 로그인 뒤 화면들이 같이 쓰는 왼쪽 레일. 레이아웃은 화면을 옮겨도 다시 그려지지 않아서
 * 레일은 그대로 있고 아래 `loading.tsx`만 바뀐다. 결정 0028.
 *
 * 프로필은 기다리지 않고 Promise로 넘긴다. 기다리면 새로고침 때 아래 스켈레톤까지 같이 늦게 뜬다.
 * 로그인 확인은 여기서 하지 않는다. 미들웨어와 각 화면이 한다.
 */
export default async function MainLayout({ children }: LayoutProps<"/">) {
	const supabase = await createClient();

	// 레이아웃은 이동 중 다시 돌지 않아 실패한 Promise가 그대로 남는다. 레일 때문에 화면 전체가 에러로 넘어가지 않게 두 줄만 접는다
	const profile = getCurrentProfile(supabase).catch(() => null);

	return (
		<>
			<SideNav profile={profile} />
			{children}
		</>
	);
}
