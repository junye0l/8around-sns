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
 * 헤더는 `components/profile/ProfileHeader.tsx`와 같은 칸 높이로 두고 이름, 별명, 아바타,
 * 수 막대만 그린다. 내 프로필 모양이라 팔로우 버튼 자리를 두지 않는다. 남의 프로필에서는
 * 데이터가 오면 버튼 높이만큼 아래가 내려간다. 팔로워, 팔로잉 목록은 자기 `loading.tsx`가 받는다.
 */
export default function ProfileLoading() {
	return (
		<PageShell backHref="/" title="프로필">
			<div className="border-hairline border-b px-6 py-5">
				<div className="flex items-start gap-4">
					<div className="min-w-0 flex-1">
						<div className="text-title">
							<SkeletonLine className="h-5 w-32" />
						</div>
						<div className="text-body">
							<SkeletonLine className="w-24" />
						</div>
					</div>
					<Skeleton className="size-21 shrink-0 rounded-full" />
				</div>
				<div className="mt-3 text-body-sm">
					<SkeletonLine className="w-32" />
				</div>
			</div>

			<SectionHeadingSkeleton />

			{[0, 1, 2].map((row) => (
				<ContentCardSkeleton actions={2} key={row} />
			))}
		</PageShell>
	);
}
