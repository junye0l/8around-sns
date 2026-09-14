import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";

type EmptyStateProps =
	| {
			/** 리뉴얼 전 모양. 한 줄 문구만 선다. 쓰는 화면이 옮겨가면 지운다 */
			message: string;
	  }
	| {
			message?: never;
			/** 카드일 때만 보인다. 그룹 안(`inset`)에서는 그리지 않는다 */
			icon?: LucideIcon;
			title: string;
			description?: string;
			/** 다음 행동. primary sm 버튼 하나를 넣는다 */
			action?: ReactNode;
			/** 그룹 목록 안에 들어간다. 카드 면과 아이콘 없이 제목과 설명만 선다 */
			inset?: boolean;
	  };

/**
 * 아직 아무것도 없을 때 지금 상태 한 줄과 다음 행동을 보여준다 (AGENTS.md 규칙 10).
 * @see docs/DESIGN.md EmptyState
 */
export function EmptyState(props: EmptyStateProps) {
	if (props.message !== undefined) {
		return (
			<p className="py-16 text-center text-body-sm text-fg-muted">
				{props.message}
			</p>
		);
	}

	const { icon: Icon, title, description, action, inset = false } = props;

	return (
		<div
			className={
				inset
					? "flex flex-col items-center px-5 py-8 text-center"
					: "flex flex-col items-center rounded-card bg-canvas px-5 py-10 text-center shadow-card"
			}
		>
			{!inset && Icon && (
				<span className="mb-4 flex size-14 items-center justify-center rounded-full bg-primary-soft text-primary">
					<Icon aria-hidden className="size-6" />
				</span>
			)}
			<p className="break-keep text-headline text-fg wrap-anywhere">{title}</p>
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
