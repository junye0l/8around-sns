import { PageShell } from "@/components/layout/PageShell";
import { UserListSkeleton } from "@/components/profile/UserListSkeleton";

/**
 * 팔로잉 목록의 첫 페인트. 이름과 뒤로 갈 프로필은 데이터가 와야 알 수 있어 제목은 "팔로잉", 뒤로 가기 주소는 "/"다.
 * 글자 자리는 같아 아래가 밀리지 않는다.
 */
export default function Loading() {
	return (
		<PageShell backHref="/" backLabel="프로필" title="팔로잉">
			<UserListSkeleton />
		</PageShell>
	);
}
