import { PageShell } from "@/components/layout/PageShell";
import { Skeleton } from "@/components/ui/Skeleton";

/**
 * 프로필과 그 아래 목록 화면의 첫 페인트. 제목은 세 화면에 다 맞는 말로 둔다 —
 * 진짜 제목은 데이터가 와야 정해진다.
 */
export default function ProfileLoading() {
	return (
		<PageShell backHref="/" title="프로필">
			{[0, 1, 2].map((row) => (
				<div
					className="flex gap-3 border-hairline border-b p-4 last:border-b-0"
					key={row}
				>
					<Skeleton className="size-10 shrink-0 rounded-full" />
					<div className="flex flex-1 flex-col gap-2">
						<Skeleton className="h-4 w-32" />
						<Skeleton className="h-4 w-24" />
					</div>
				</div>
			))}
		</PageShell>
	);
}
