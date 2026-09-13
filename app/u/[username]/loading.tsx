import { PageShell } from "@/components/layout/PageShell";
import {
	ContentCardSkeleton,
	SectionHeadingSkeleton,
	Skeleton,
} from "@/components/ui/Skeleton";

/**
 * 프로필의 첫 페인트. 제목은 데이터가 와야 정해지므로 "프로필"로 둔다.
 *
 * 헤더는 `components/profile/ProfileHeader.tsx`와 같은 클래스로 그린다. 남의 프로필
 * 모양이라 맨 아래 팔로우 버튼 자리까지 있다. 내 프로필에는 버튼이 없어 그만큼
 * 아래가 올라온다. 팔로워, 팔로잉 목록은 자기 `loading.tsx`가 받는다.
 */
export default function ProfileLoading() {
	return (
		<PageShell backHref="/" title="프로필">
			<div className="border-hairline border-b px-6 py-5">
				<div className="flex items-start gap-4">
					<div className="min-w-0 flex-1">
						<Skeleton className="h-lh w-32 text-title" />
						<Skeleton className="h-lh w-24 text-body" />
					</div>
					<Skeleton className="size-21 shrink-0 rounded-full" />
				</div>
				<div className="mt-3 flex gap-6 text-body-sm">
					<Skeleton className="h-lh w-12" />
					<Skeleton className="h-lh w-12" />
				</div>
				<div className="mt-4">
					<Skeleton className="h-10 w-full rounded-lg" />
				</div>
			</div>

			<SectionHeadingSkeleton />

			{[0, 1, 2].map((row) => (
				<ContentCardSkeleton actions={2} key={row} />
			))}
		</PageShell>
	);
}
