import { PageShell } from "@/components/layout/PageShell";
import { Skeleton } from "@/components/ui/Skeleton";

/**
 * 상세 화면의 첫 페인트. `app/loading.tsx`는 제목이 "추천"이라 여기까지 쓰지 못한다.
 *
 */
export default function PostLoading() {
	return (
		<PageShell backHref="/" title="게시글">
			{[0, 1, 2].map((row) => (
				<div
					className="flex gap-3 border-hairline border-b px-6 py-4 last:border-b-0"
					key={row}
				>
					<Skeleton className="size-9 shrink-0 rounded-full" />
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
