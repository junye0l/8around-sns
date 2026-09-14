import { cn } from "@/lib/utils/cn";

/**
 * 로딩 자리를 채우는 블록. 치수는 부르는 쪽이 최종 레이아웃과 같게 준다.
 * 시머 애니메이션은 없다.
 * @see docs/DESIGN.md Skeleton
 */
export function Skeleton({ className }: { className: string }) {
	return (
		<div aria-hidden className={cn("rounded-lg bg-hairline", className)} />
	);
}

/**
 * 글 한 줄의 자리. 높이는 물려받은 글자의 줄 상자(`h-lh`)와 같고, 막대는 그 가운데
 * 12px로만 선다. 줄 상자를 꽉 채우면 위아래 줄이 틈 없이 붙어 한 덩어리로 보인다.
 */
export function SkeletonLine({ className }: { className: string }) {
	return (
		<div className="flex h-lh items-center">
			<Skeleton className={cn("h-3", className)} />
		</div>
	);
}

/**
 * `ContentCard` 한 칸의 자리. 칸의 패딩, 아바타, 이름 줄, 본문 한 줄, 액션 줄을 본 UI와
 * 같은 치수로 세워 데이터가 와도 화면이 튀지 않는다. 본문은 한 줄 글의 높이다.
 * 액션은 아이콘 자리만 그리고 숫자는 그리지 않는다.
 * @see components/ui/ContentCard.tsx
 */
export function ContentCardSkeleton({
	actions = 0,
	connected = false,
}: {
	/**
	 * 액션 줄의 버튼 수. 0이면 줄이 없다. 목록의 글은 좋아요와 댓글 수로 2,
	 * 상세의 글(좋아요)과 댓글(답글 수)은 1이다.
	 * @see components/post/PostList.tsx
	 * @see app/(main)/post/[id]/page.tsx
	 */
	actions?: 0 | 1 | 2;
	/** `ContentCard`의 `connected`와 같다. 아래 구분선이 빠진다 */
	connected?: boolean;
}) {
	return (
		<div
			className={cn(
				"flex gap-3 px-4 py-4 md:px-6",
				!connected && "border-hairline border-b last:border-b-0",
			)}
		>
			<Skeleton className="size-9 shrink-0 rounded-full" />

			<div className="min-w-0 flex-1">
				<div className="text-body-sm">
					<SkeletonLine className="w-24" />
				</div>

				<div className="mt-0.5 text-body">
					<SkeletonLine className="w-3/4" />
				</div>

				{actions > 0 && (
					<div className="-ml-2 mt-1 flex">
						<ActionSkeleton />
						{actions > 1 && <ActionSkeleton />}
					</div>
				)}
			</div>
		</div>
	);
}

// `LikeButton`, `CommentCount`와 같은 패딩과 줄 상자. 숫자 한 자리 폭(w-2)은 비워둔다
function ActionSkeleton() {
	return (
		<div className="inline-flex items-center gap-1 p-2 text-body-sm">
			<Skeleton className="size-5 shrink-0 rounded-full" />
			<div className="h-lh w-2" />
		</div>
	);
}

/**
 * `ComposeRow`의 자리. 아바타와 문구 막대만 그리고 버튼 자리는 비운다.
 * 줄 높이는 버튼(36px)이 정하므로 그 높이를 빈 칸으로 남긴다.
 * @see components/ui/ComposeRow.tsx
 */
export function ComposeRowSkeleton() {
	return (
		<div className="flex items-center gap-3 border-hairline border-b px-4 py-4 md:px-6">
			<Skeleton className="size-9 shrink-0 rounded-full" />
			<div className="text-body">
				<SkeletonLine className="w-48" />
			</div>
		</div>
	);
}

/**
 * `SectionHeading`의 자리. 글자는 그리지 않고 높이와 구분선만 남긴다.
 * @see components/ui/SectionHeading.tsx
 */
export function SectionHeadingSkeleton() {
	return (
		<div className="border-hairline border-b px-4 py-3 md:px-6 text-body-sm">
			<div className="h-lh" />
		</div>
	);
}
