import { PageShell } from "@/components/layout/PageShell";
import { ContentCardSkeleton } from "@/components/ui/Skeleton";

/** 팔로잉의 첫 페인트. 글 카드 셋을 세운다. 글쓰기 줄은 전체에만 있다 */
export default function FollowingLoading() {
	return (
		<PageShell card={false} title="팔로잉">
			<div className="flex flex-col gap-3">
				{[0, 1, 2].map((row) => (
					<ContentCardSkeleton actions={2} card key={row} />
				))}
			</div>
		</PageShell>
	);
}
