import { PageShell } from "@/components/layout/PageShell";
import { ContentCardSkeleton } from "@/components/ui/Skeleton";

/** 좋아요의 첫 페인트. 모양이 `app/(main)/following/loading.tsx`와 같고 제목만 다르다 */
export default function LikesLoading() {
	return (
		<PageShell card={false} title="좋아요">
			<div className="flex flex-col gap-3">
				{[0, 1, 2].map((row) => (
					<ContentCardSkeleton actions={2} card key={row} />
				))}
			</div>
		</PageShell>
	);
}
