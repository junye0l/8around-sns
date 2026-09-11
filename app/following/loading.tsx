import { PageShell } from "@/components/layout/PageShell";
import { Skeleton } from "@/components/ui/Skeleton";

/**
 * 팔로잉 피드의 첫 페인트. `app/loading.tsx`는 제목이 "추천"이라 여기까지 쓰지 못한다.
 *
 */
export default function FollowingLoading() {
	return (
		<PageShell title="팔로잉">
			{[0, 1, 2, 3].map((row) => (
				<div
					className="flex gap-3 border-hairline border-b p-4 last:border-b-0"
					key={row}
				>
					<Skeleton className="size-10 shrink-0 rounded-full" />
					<div className="flex flex-1 flex-col gap-2">
						<Skeleton className="h-4 w-32" />
						<Skeleton className="h-4 w-full" />
						<Skeleton className="h-4 w-3/4" />
					</div>
				</div>
			))}
		</PageShell>
	);
}
