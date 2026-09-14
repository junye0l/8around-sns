import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils/cn";

/**
 * 아직 아무것도 없을 때 지금 상태 한 줄과 다음 행동을 보여준다 (AGENTS.md 규칙 10).
 * 카드 가운데 정렬. 아이콘 56px 원, 제목 `headline`, 설명 `subhead` 400 `fg-muted` 28자 폭, 버튼 primary sm.
 * 그룹 목록 안(`inset`)에서는 카드 면과 아이콘 없이 선다.
 * 없는 페이지와 에러 화면도 이 카드를 쓴다. 그때 제목은 `h1`이고 에러는 아이콘 바탕이 `danger-soft`다.
 * @see docs/DESIGN.md EmptyState
 */
export function EmptyState({
	icon: Icon,
	title,
	description,
	action,
	inset = false,
	heading = false,
	danger = false,
}: {
	/** 카드일 때만 보인다 */
	icon?: LucideIcon;
	title: string;
	description?: string;
	/** 다음 행동. primary sm 버튼 하나를 넣는다 */
	action?: ReactNode;
	/** 그룹 목록 안에 들어간다 */
	inset?: boolean;
	/** 화면의 주인공이다. 제목을 `h1`로 그린다 */
	heading?: boolean;
	/** 에러 화면. 아이콘 바탕과 아이콘이 `danger`로 바뀐다 */
	danger?: boolean;
}) {
	const Title = heading ? "h1" : "p";

	return (
		<div
			className={
				inset
					? "flex flex-col items-center px-5 py-8 text-center"
					: "flex flex-col items-center rounded-card bg-canvas px-5 py-10 text-center shadow-card"
			}
		>
			{!inset && Icon && (
				<span
					className={cn(
						"mb-4 flex size-14 items-center justify-center rounded-full",
						danger
							? "bg-danger-soft text-danger"
							: "bg-primary-soft text-primary",
					)}
				>
					<Icon aria-hidden className="size-6" />
				</span>
			)}
			<Title className="break-keep text-headline text-fg wrap-anywhere">
				{title}
			</Title>
			{description && (
				<p
					// 허용: 28자 폭은 docs/DESIGN.md EmptyState 값이다. 한글 한 자가 1em이다
					className="mt-1 max-w-[28em] break-keep text-subhead font-normal text-fg-muted wrap-anywhere"
				>
					{description}
				</p>
			)}
			{action && <div className="mt-4">{action}</div>}
		</div>
	);
}
