import { PageShell } from "@/components/layout/PageShell";
import { Skeleton } from "@/components/ui/Skeleton";

/**
 * 상세 화면의 첫 페인트. `app/loading.tsx`는 제목이 "추천"이라 여기까지 쓰지 못한다.
 * 레일 안은 비워둔다 — 항목 수가 아니라 위치만 맞추면 된다.
 */
export default function PostLoading() {
	return (
		<PageShell
			backHref="/"
			nav={
				<div className="fixed inset-y-0 left-0 w-60 border-hairline border-r bg-canvas" />
			}
			title="게시글"
		>
			<div className="overflow-hidden rounded-md border border-hairline bg-canvas">
				{[0, 1, 2].map((row) => (
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
			</div>
		</PageShell>
	);
}
