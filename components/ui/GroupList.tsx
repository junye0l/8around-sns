import { Children, type ReactNode } from "react";

/**
 * 여러 행을 카드 한 장에 담는 목록. 맨 위 라벨, 행 사이 `hairline` 1px.
 * 댓글, 답글, 팔로워 목록이 같이 쓴다 (규칙 2). 행은 `<li>`로 넘기고 좌우 여백은 `GROUP_ROW`를 쓴다.
 * 행이 없으면 `empty`를 목록 자리에 둔다.
 * @see docs/DESIGN.md 그룹 목록
 */
export function GroupList({
	label,
	empty,
	children,
}: {
	/** 맨 위 라벨. 목록이 무엇인지 화면 제목이 이미 말하면 비운다 */
	label?: string;
	empty?: ReactNode;
	children?: ReactNode;
}) {
	const hasRows = Children.count(children) > 0;

	return (
		<section className="rounded-card bg-canvas shadow-card">
			{label && (
				<h2 className="px-4.5 pt-3.5 pb-1.5 text-footnote font-semibold text-fg-muted">
					{label}
				</h2>
			)}
			{hasRows ? (
				<ul className="divide-y divide-hairline">{children}</ul>
			) : (
				empty
			)}
		</section>
	);
}

/** 그룹 목록 한 행의 여백. 좌우 18px, 위아래 12px */
export const GROUP_ROW = "px-4.5 py-3";
