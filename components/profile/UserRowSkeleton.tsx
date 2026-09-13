import { Skeleton } from "@/components/ui/Skeleton";

/**
 * `UserRow` 한 줄의 자리. 팔로워와 팔로잉 목록의 로딩이 같이 쓴다.
 * 소개 줄은 그리지 않는다. 가입 폼이 소개를 받지 않아 비어 있다.
 * @see components/profile/UserRow.tsx
 */
export function UserRowSkeleton() {
	return (
		<div className="flex gap-3 border-hairline border-b px-6 py-3 last:border-b-0">
			<Skeleton className="size-9 shrink-0 rounded-full" />
			<div className="min-w-0 flex-1 text-body-sm">
				<Skeleton className="h-lh w-24" />
				<Skeleton className="h-lh w-16" />
			</div>
		</div>
	);
}
