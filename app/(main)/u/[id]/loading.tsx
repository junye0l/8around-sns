import { PageShell } from "@/components/layout/PageShell";
import {
	ContentCardSkeleton,
	Skeleton,
	SkeletonLine,
} from "@/components/ui/Skeleton";

/**
 * 프로필의 첫 페인트. 헤더 카드(원 76, 줄 셋)와 글 카드 둘을 세운다.
 * 내 프로필인지는 데이터가 와야 알 수 있어 제목은 "프로필"로 둔다.
 * @see components/profile/ProfileHeader.tsx
 */
export default function ProfileLoading() {
	return (
		<PageShell title="프로필">
			<div className="flex flex-col gap-3">
				<div className="rounded-card bg-canvas p-5 shadow-card">
					<div className="flex items-center gap-4">
						<Skeleton className="size-19 shrink-0 rounded-full" />
						<div className="min-w-0 flex-1 text-name">
							<SkeletonLine className="w-32" />
						</div>
					</div>
					<div className="mt-4 text-callout">
						<SkeletonLine className="w-3/4" />
					</div>
					<div className="mt-4 flex gap-2">
						<Skeleton className="h-8 w-20 rounded-full" />
						<Skeleton className="h-8 w-20 rounded-full" />
					</div>
				</div>
				{[0, 1].map((row) => (
					<ContentCardSkeleton actions={2} key={row} />
				))}
			</div>
		</PageShell>
	);
}
