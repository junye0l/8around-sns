import { PageShell } from "@/components/layout/PageShell";
import {
	ComposeRowSkeleton,
	ContentCardSkeleton,
	SectionHeadingSkeleton,
} from "@/components/ui/Skeleton";

/**
 * 답글 화면의 첫 페인트. 구분선 없이 이어진 글 칸, 댓글 칸, 답글 입력 줄, "답글" 제목줄,
 * 답글 칸의 순서와 높이를 `page.tsx`와 같게 둔다. 이어짐 세로선은 그리지 않는다.
 *
 * 뒤로 갈 글은 댓글을 읽어야 알 수 있으므로 여기서는 "/"를 둔다. 주소는 뒤에
 * 바뀌지만 화살표 자리는 그대로여서 제목이 옆으로 밀리지 않는다.
 */
export default function CommentLoading() {
	return (
		<PageShell backHref="/" title="답글">
			<ContentCardSkeleton connected />
			<ContentCardSkeleton />
			<ComposeRowSkeleton />
			<SectionHeadingSkeleton />
			{[0, 1].map((row) => (
				<ContentCardSkeleton key={row} />
			))}
		</PageShell>
	);
}
