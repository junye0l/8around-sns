import { Skeleton, SkeletonLine } from "@/components/ui/Skeleton";

/**
 * 팔로워 · 팔로잉 화면의 자리. 세그먼트와 그룹 목록 한 장에 행 셋을 같은 치수로 세운다.
 * 소개 줄은 그리지 않는다. 있는지 모른다.
 * @see components/profile/UserRow.tsx
 */
export function UserListSkeleton() {
	return (
		<div className="flex flex-col gap-3">
			<Skeleton className="h-10 w-full rounded-xl" />
			<div className="divide-y divide-hairline rounded-card bg-canvas shadow-card">
				{[0, 1, 2].map((row) => (
					<div className="flex items-center gap-3 px-4.5 py-3" key={row}>
						<Skeleton className="size-9 shrink-0 rounded-full" />
						<div className="min-w-0 flex-1 text-callout">
							<SkeletonLine className="w-24" />
						</div>
						<Skeleton className="h-8 w-16 rounded-full" />
					</div>
				))}
			</div>
		</div>
	);
}
