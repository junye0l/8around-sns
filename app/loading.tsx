import { PageShell } from "@/components/layout/PageShell";
import { Skeleton } from "@/components/ui/Skeleton";

/**
 * 첫 페인트. 컬럼 뼈대를 `app/page.tsx`와 같게 세워서 데이터가 와도 화면이 튀지 않는다.
 * 레일은 배경이 없어서 비워둔다.
 *
 */
export default function Loading() {
	return (
		<PageShell title="추천">
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
