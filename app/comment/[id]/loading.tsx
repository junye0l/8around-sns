import { PageShell } from "@/components/layout/PageShell";
import { Skeleton } from "@/components/ui/Skeleton";

/**
 * 답글 화면의 첫 페인트. 제목이 "답글"이라 `app/post/[id]/loading.tsx`를 쓰지 못한다.
 *
 * 뒤로 갈 글은 댓글을 읽어야 알 수 있으므로 여기서는 "/"를 둔다. 주소는 뒤에
 * 바뀌지만 화살표 자리는 그대로여서 제목이 옆으로 밀리지 않는다.
 */
export default function CommentLoading() {
	return (
		<PageShell backHref="/" title="답글">
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
		</PageShell>
	);
}
