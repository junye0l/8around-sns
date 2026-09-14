import { PageShell } from "@/components/layout/PageShell";
import {
	ComposeRowSkeleton,
	DetailCardSkeleton,
	GroupListSkeleton,
} from "@/components/ui/Skeleton";

/**
 * 댓글 상세의 첫 페인트. 맥락 카드, 넓은 폭의 글쓰기 줄, 답글 그룹을 `page.tsx`와 같은 순서로 세운다.
 * 뒤로 갈 글은 댓글을 읽어야 알 수 있으므로 여기서는 "/"를 둔다. 글자 자리는 같아 제목이 밀리지 않는다.
 */
export default function CommentLoading() {
	return (
		<PageShell backHref="/" backLabel="게시글" card={false} title="댓글">
			<div className="flex flex-col gap-3">
				<DetailCardSkeleton />
				<div className="max-md:hidden">
					<ComposeRowSkeleton />
				</div>
				<GroupListSkeleton />
			</div>
		</PageShell>
	);
}
