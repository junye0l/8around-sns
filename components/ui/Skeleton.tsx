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
 * @see components/ui/ContentCard.tsx
 */
export function ContentCardSkeleton({
	actions = 0,
	card = false,
}: {
	/** 액션 줄의 알약 수. 0이면 줄이 없다. 목록의 글은 좋아요와 댓글 수로 2다 */
	actions?: 0 | 1 | 2;
	/** `ContentCard`의 `card`와 같다. 새 카드 모양의 자리다 */
	card?: boolean;
}) {
	if (card) {
		return (
			<div className="flex gap-3 rounded-card bg-canvas px-5 py-4 shadow-card">
				<Skeleton className="size-10 shrink-0 rounded-full" />
				<div className="min-w-0 flex-1">
					<div className="text-subhead">
						<SkeletonLine className="w-28" />
					</div>
					<div className="mt-0.5 text-body">
						<SkeletonLine className="w-3/4" />
					</div>
					{actions > 0 && (
						<div className="mt-3 flex gap-2">
							<Skeleton className="h-8 w-14 rounded-full" />
							{actions > 1 && <Skeleton className="h-8 w-14 rounded-full" />}
						</div>
					)}
				</div>
			</div>
		);
	}

	return (
		<div className="flex gap-3 border-hairline border-b px-4 py-4 md:px-6 last:border-b-0">
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

/**
 * 상세 화면 맨 위 카드의 자리. 머리 줄(아바타 32)과 본문 두 줄, 알약 줄을 세운다.
 * 게시글 상세의 원글 카드와 댓글 상세의 맥락 카드가 같이 쓴다.
 * @see app/(main)/post/[id]/page.tsx
 */
export function DetailCardSkeleton({ actions = 0 }: { actions?: 0 | 2 }) {
	return (
		<div className="rounded-card bg-canvas px-5 py-4 shadow-card">
			<div className="flex items-center gap-2">
				<Skeleton className="size-8 shrink-0 rounded-full" />
				<div className="text-subhead">
					<SkeletonLine className="w-28" />
				</div>
			</div>
			<div className="mt-3 text-title">
				<SkeletonLine className="w-full" />
				<SkeletonLine className="w-2/3" />
			</div>
			{actions > 0 && (
				<div className="mt-4 flex gap-2">
					<Skeleton className="h-8 w-14 rounded-full" />
					<Skeleton className="h-8 w-14 rounded-full" />
				</div>
			)}
		</div>
	);
}

/**
 * `GroupList`와 댓글 행의 자리. 라벨 줄과 행 둘을 같은 치수로 세운다.
 * @see components/ui/GroupList.tsx
 * @see components/comment/CommentThread.tsx
 */
export function GroupListSkeleton() {
	return (
		<div className="rounded-card bg-canvas shadow-card">
			<div className="px-4.5 pt-3.5 pb-1.5 text-footnote">
				<SkeletonLine className="w-12" />
			</div>
			<div className="divide-y divide-hairline">
				{[0, 1].map((row) => (
					<div className="flex gap-3 px-4.5 py-3" key={row}>
						<Skeleton className="size-8.5 shrink-0 rounded-full" />
						<div className="min-w-0 flex-1">
							<div className="text-subhead">
								<SkeletonLine className="w-24" />
							</div>
							<div className="mt-0.5 text-callout">
								<SkeletonLine className="w-3/4" />
							</div>
						</div>
					</div>
				))}
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
 * `ComposeRow` 카드의 자리. 아바타, 문구 막대, 원형 보내기 자리를 같은 치수로 세운다.
 * @see components/ui/ComposeRow.tsx
 */
export function ComposeRowSkeleton() {
	return (
		<div className="flex items-center gap-3 rounded-card bg-canvas px-5 py-4 shadow-card">
			<Skeleton className="size-10 shrink-0 rounded-full" />
			<div className="flex-1 text-body">
				<SkeletonLine className="w-48" />
			</div>
			<Skeleton className="size-9.5 shrink-0 rounded-full" />
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
