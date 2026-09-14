import { cn } from "@/lib/utils/cn";

/**
 * 로딩 자리를 채우는 블록. 치수는 부르는 쪽이 최종 레이아웃과 같게 준다.
 *
 * 시머 애니메이션은 없다. 움직임은 레이아웃이 다 선 뒤에 얹는다.
 * @see docs/PLAN.md 모션 절
 */
export function Skeleton({ className }: { className: string }) {
	return (
		<div aria-hidden className={cn("rounded-sm bg-hairline", className)} />
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
 * `ContentCard` 한 칸의 자리. 칸의 패딩, 아바타, 이름 줄, 본문 두 줄, 액션 줄의 높이를
 * 그대로 두어 데이터가 와도 화면이 튀지 않는다. 안에는 아바타, 이름, 본문 막대만 그린다.
 * @see components/ui/ContentCard.tsx
 */
export function ContentCardSkeleton({
	actions = false,
	connected = false,
}: {
	/** 액션 줄(좋아요, 댓글 수)의 높이를 비워둔다. 그림은 그리지 않는다 */
	actions?: boolean;
	/** `ContentCard`의 `connected`와 같다. 아래 구분선이 빠진다 */
	connected?: boolean;
}) {
	return (
		<div
			className={cn(
				"flex gap-3 px-6 py-4",
				!connected && "border-hairline border-b last:border-b-0",
			)}
		>
			<Skeleton className="size-9 shrink-0 rounded-full" />

			<div className="min-w-0 flex-1">
				<div className="text-body-sm">
					<SkeletonLine className="w-24" />
				</div>

				<div className="mt-0.5 text-body">
					<SkeletonLine className="w-full" />
					<SkeletonLine className="w-1/2" />
				</div>

				{/* 액션 버튼 한 칸(p-2 + 줄 상자)의 높이만 잡는다 */}
				{actions && (
					<div className="mt-1 py-2 text-body-sm">
						<div className="h-lh" />
					</div>
				)}
			</div>
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
		<div className="flex items-center gap-3 border-hairline border-b px-6 py-4">
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
		<div className="border-hairline border-b px-6 py-3 text-body-sm">
			<div className="h-lh" />
		</div>
	);
}
