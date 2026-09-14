import { PageShell } from "@/components/layout/PageShell";
import {
	ComposeRowSkeleton,
	ContentCardSkeleton,
	SectionHeadingSkeleton,
} from "@/components/ui/Skeleton";

/**
 * 상세 화면의 첫 페인트. 글 한 칸, 댓글 입력 줄, "댓글" 제목줄, 댓글 칸의 순서와
 * 높이를 `page.tsx`와 같게 둔다. 댓글 칸은 답글이 없는 모양이다.
 */
export default function PostLoading() {
	return (
		<PageShell backHref="/" title="게시글">
			<ContentCardSkeleton actions={1} />
			<ComposeRowSkeleton />
			<SectionHeadingSkeleton />
			{[0, 1].map((row) => (
				<ContentCardSkeleton actions={1} key={row} />
			))}
		</PageShell>
	);
}
