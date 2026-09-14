import { PageShell } from "@/components/layout/PageShell";
import { ContentCardSkeleton } from "@/components/ui/Skeleton";

/**
 * 팔로잉 피드의 첫 페인트. `app/(main)/(feed)/loading.tsx`는 제목이 "추천"이고 글쓰기 줄이
 * 있어 여기까지 쓰지 못한다.
 */
export default function FollowingLoading() {
	return (
		<PageShell title="팔로잉">
			{[0, 1, 2, 3].map((row) => (
				<ContentCardSkeleton actions={2} key={row} />
			))}
		</PageShell>
	);
}
