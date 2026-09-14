import { PageShell } from "@/components/layout/PageShell";
import {
	ContentCardSkeleton,
	SectionHeadingSkeleton,
	Skeleton,
	SkeletonLine,
} from "@/components/ui/Skeleton";

/**
 * 프로필의 첫 페인트. 제목은 데이터가 와야 정해지므로 "프로필"로 둔다.
 *
 * 헤더는 `components/profile/ProfileHeader.tsx`와 같은 구조로 두고 아바타 왼쪽 컬럼에 별명과
 * 수 막대만 그린다. 소개는 있는지 모르므로 자리를 두지 않는다. 맨 아래 버튼 높이까지 비워둔다. 남의 프로필은 팔로우, 내 프로필은 프로필 편집 버튼이고
 * 둘 다 40px이다. 팔로워, 팔로잉 목록은 자기 `loading.tsx`가 받는다.
 */
export default function ProfileLoading() {
	return (
		<PageShell backHref="/" title="프로필">
			<div className="border-hairline border-b px-4 py-5 md:px-6">
				<div className="flex items-start gap-4">
					<div className="min-w-0 flex-1">
						<div className="text-title">
							<SkeletonLine className="h-5 w-32" />
						</div>
						<div className="mt-4 text-body-sm">
							<SkeletonLine className="w-32" />
						</div>
					</div>
					<Skeleton className="size-21 shrink-0 rounded-full" />
				</div>
				{/* 팔로우 또는 프로필 편집 버튼(h-10) 자리. 그리지 않고 높이만 둔다 */}
				<div className="mt-4 h-10" />
			</div>

			<SectionHeadingSkeleton />

			{[0, 1, 2].map((row) => (
				<ContentCardSkeleton actions={2} key={row} />
			))}
		</PageShell>
	);
}
