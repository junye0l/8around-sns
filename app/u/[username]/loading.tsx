import { PageShell } from "@/components/layout/PageShell";
import { Skeleton } from "@/components/ui/Skeleton";

/**
 * 프로필과 그 아래 목록 화면의 첫 페인트. 제목은 세 화면에 다 맞는 말로 둔다 —
 * 진짜 제목은 데이터가 와야 정해진다.
 *
 * 헤더 모양을 그리지 않는다. 팔로워, 팔로잉 목록도 이 파일을 받는데 그 화면에는
 * 헤더가 없어서, 그리면 로딩 중에만 있다가 사라지는 블록이 된다. 목록 줄은 세 화면에 다 있다.
 */
export default function ProfileLoading() {
	return (
		<PageShell backHref="/" title="프로필">
			{[0, 1, 2].map((row) => (
				<div
					className="flex gap-3 border-hairline border-b px-6 py-4 last:border-b-0"
					key={row}
				>
					<Skeleton className="size-9 shrink-0 rounded-full" />
					<div className="flex flex-1 flex-col gap-2">
						<Skeleton className="h-4 w-32" />
						<Skeleton className="h-4 w-24" />
					</div>
				</div>
			))}
		</PageShell>
	);
}
