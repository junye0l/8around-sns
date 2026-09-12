import { PageShell } from "@/components/layout/PageShell";
import { Skeleton } from "@/components/ui/Skeleton";

/**
 * 추천의 첫 페인트. 컬럼 뼈대를 `app/(feed)/page.tsx`와 같게 세워서 데이터가 와도
 * 화면이 튀지 않는다. 레일은 배경이 없어서 비워둔다.
 *
 * `(feed)` 그룹 안에 있다. 루트에 두면 이 파일이 앱 전체의 대기 화면이 되어,
 * 다른 화면으로 넘어갈 때 "추천" 제목의 스켈레톤이 먼저 뜨고 그 화면의 스켈레톤이
 * 뒤이어 뜬다. 그룹은 주소를 바꾸지 않고 이 대기 화면의 범위만 추천으로 좁힌다.
 */
export default function Loading() {
	return (
		<PageShell title="추천">
			{[0, 1, 2, 3].map((row) => (
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
