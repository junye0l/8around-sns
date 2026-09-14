import { PageShell } from "@/components/layout/PageShell";
import {
	ComposeRowSkeleton,
	DetailCardSkeleton,
	GroupListSkeleton,
} from "@/components/ui/Skeleton";

/**
 * 게시글 상세의 첫 페인트. 원글 카드, 넓은 폭의 글쓰기 줄, 댓글 그룹을 `page.tsx`와 같은 순서로 세운다.
 * 돌아갈 화면은 주소의 `from`을 읽어야 알 수 있어 여기서는 화살표만 둔다.
 */
export default function PostLoading() {
	return (
		<PageShell backHref="/" title="게시글">
			<div className="flex flex-col gap-3">
				<DetailCardSkeleton actions={2} />
				<div className="max-md:hidden">
					<ComposeRowSkeleton />
				</div>
				<GroupListSkeleton replyLine />
			</div>
		</PageShell>
	);
}
