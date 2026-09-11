import Link from "next/link";

/**
 * 댓글 수. 누르면 그 글의 상세로 간다.
 *
 * 아이콘이 하나뿐이라 파일 안에 둔다 — `components/layout/SideNav.tsx`와 같은 기준이다.
 * 게시글과 댓글이 같이 쓰므로 기능 폴더가 아니라 `components/ui/`에 둔다.
 */
function CommentIcon() {
	return (
		<svg
			aria-hidden
			className="size-5 shrink-0"
			fill="none"
			stroke="currentColor"
			strokeWidth="2"
			viewBox="0 0 24 24"
		>
			<path
				d="M21 12a8 8 0 0 1-8 8H4l2.5-3A8 8 0 1 1 21 12z"
				strokeLinecap="round"
				strokeLinejoin="round"
			/>
		</svg>
	);
}

export function CommentCount({
	href,
	count,
	/** 스크린리더가 읽을 말. 게시글에서는 "댓글", 댓글에서는 "답글"이다 */
	label,
}: {
	href: string;
	count: number;
	label: string;
}) {
	return (
		<Link
			aria-label={`${label} ${count}개`}
			// 누를 자리를 40px로 넓히되 -m-2 로 되돌려서 카드 간격은 그대로 둔다
			className="-m-2 inline-flex items-center gap-2 rounded-md p-2 text-body-sm text-fg-muted transition-colors duration-[var(--motion-fast)] ease-(--ease-standard) hover:bg-surface hover:text-fg"
			href={href}
		>
			<CommentIcon />
			<span aria-hidden>{count}</span>
		</Link>
	);
}
