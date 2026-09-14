import { PageShell } from "@/components/layout/PageShell";
import { ContentCardSkeleton } from "@/components/ui/Skeleton";

/**
 * 좋아요한 글의 첫 페인트. `app/(main)/likes/page.tsx`와 같은 제목에 글 칸만 세운다.
 * 모양이 `app/(main)/following/loading.tsx`와 같고 제목만 다르다.
 */
export default function LikesLoading() {
	return (
		<PageShell title="좋아요">
			{[0, 1, 2, 3].map((row) => (
				<ContentCardSkeleton actions={2} key={row} />
			))}
		</PageShell>
	);
}
