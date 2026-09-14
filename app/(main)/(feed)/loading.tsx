import { PageShell } from "@/components/layout/PageShell";
import {
	ComposeRowSkeleton,
	ContentCardSkeleton,
} from "@/components/ui/Skeleton";

/**
 * 전체의 첫 페인트. 글쓰기 줄과 글 카드 셋을 `app/(main)/(feed)/page.tsx`와 같은 치수로 세운다.
 *
 * `(feed)` 그룹 안에 있다. 루트에 두면 이 파일이 앱 전체의 대기 화면이 되어,
 * 다른 화면으로 넘어갈 때 "전체" 제목의 스켈레톤이 먼저 뜨고 그 화면의 스켈레톤이 뒤이어 뜬다.
 */
export default function Loading() {
	return (
		<PageShell card={false} title="전체">
			<div className="flex flex-col gap-3">
				<ComposeRowSkeleton />
				{[0, 1, 2].map((row) => (
					<ContentCardSkeleton actions={2} card key={row} />
				))}
			</div>
		</PageShell>
	);
}
