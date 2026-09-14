import { PageShell } from "@/components/layout/PageShell";
import { UserRowSkeleton } from "@/components/profile/UserRowSkeleton";

/**
 * 팔로워 목록의 첫 페인트. 윗 폴더의 `loading.tsx`는 프로필 헤더를 그려서 여기까지
 * 쓰지 못한다. 뒤로 갈 프로필은 데이터가 와야 알 수 있어 "/"를 둔다. 화살표 자리는 같다.
 */
export default function FollowersLoading() {
	return (
		<PageShell backHref="/" title="팔로워">
			{[0, 1, 2].map((row) => (
				<UserRowSkeleton key={row} />
			))}
		</PageShell>
	);
}
