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
 * 수 막대만 그린다. 남의 프로필 모양이라 맨 아래 팔로우 버튼 높이까지 비워둔다. 내 프로필에는
 * 버튼이 없어 그만큼 아래가 올라온다. 팔로워, 팔로잉 목록은 자기 `loading.tsx`가 받는다.
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
				{/* 팔로우 버튼(h-10) 자리. 그리지 않고 높이만 둔다 */}
				<div className="mt-4 h-10" />
			</div>

			<SectionHeadingSkeleton />

			{[0, 1, 2].map((row) => (
				<ContentCardSkeleton actions key={row} />
			))}
		</PageShell>
	);
}
