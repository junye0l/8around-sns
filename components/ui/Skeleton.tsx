/**
 * 로딩 자리를 채우는 블록. 치수는 부르는 쪽이 최종 레이아웃과 같게 준다.
 *
 * 시머 애니메이션은 없다. 움직임은 레이아웃이 다 선 뒤에 얹는다.
 * @see docs/PLAN.md 모션 절
 */
export function Skeleton({ className }: { className: string }) {
	return <div aria-hidden className={`rounded-sm bg-hairline ${className}`} />;
}

/**
 * `ContentCard` 한 칸의 자리. 칸, 아바타, 이름 줄, 본문 두 줄, 액션 줄의 클래스를
 * 그대로 써서 데이터가 와도 화면이 튀지 않는다. 글줄 높이는 `h-lh`로 그 글자의
 * 줄 상자와 같게 잡는다.
 * @see components/ui/ContentCard.tsx
 */
export function ContentCardSkeleton({
	actions = 0,
	connected = false,
}: {
	/** 액션 줄의 아이콘 버튼 수. 0이면 액션 줄이 없다 */
	actions?: 0 | 1 | 2;
	/** `ContentCard`의 `connected`와 같다. 구분선이 빠지고 아바타 밑으로 선이 흐른다 */
	connected?: boolean;
}) {
	const action = (
		<div className="flex items-center gap-1 p-2 text-body-sm">
			<Skeleton className="size-5 rounded-full" />
			<Skeleton className="h-lh w-2" />
		</div>
	);

	return (
		<div
			className={`flex gap-3 px-6 py-4 ${connected ? "" : "border-hairline border-b last:border-b-0"}`}
		>
			<div className="flex flex-col items-center gap-2">
				<Skeleton className="size-9 shrink-0 rounded-full" />
				{connected && <div className="-mb-8 w-px flex-1 bg-hairline" />}
			</div>

			<div className="min-w-0 flex-1">
				<div className="flex items-baseline gap-2 text-body-sm">
					<Skeleton className="h-lh w-24" />
					<Skeleton className="h-lh w-12" />
				</div>

				<div className="mt-0.5 text-body">
					<Skeleton className="h-lh w-full" />
					<Skeleton className="h-lh w-3/4" />
				</div>

				{actions > 0 && (
					<div className="-ml-2 mt-1 flex">
						{action}
						{actions > 1 && action}
					</div>
				)}
			</div>
		</div>
	);
}

/**
 * `ComposeRow`의 자리. 아바타, 문구, 버튼이 같은 줄에 같은 높이로 선다.
 * @see components/ui/ComposeRow.tsx
 */
export function ComposeRowSkeleton() {
	return (
		<div className="flex items-center gap-3 border-hairline border-b px-6 py-4">
			<Skeleton className="size-9 shrink-0 rounded-full" />
			<Skeleton className="h-lh w-48 text-body" />
			<Skeleton className="ml-auto h-9 w-15 rounded-lg" />
		</div>
	);
}

/**
 * `SectionHeading`의 자리.
 * @see components/ui/SectionHeading.tsx
 */
export function SectionHeadingSkeleton() {
	return (
		<div className="border-hairline border-b px-6 py-3 text-body-sm">
			<Skeleton className="h-lh w-8" />
		</div>
	);
}
