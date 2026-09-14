import { MessageCircle } from "lucide-react";
import Link from "next/link";

/**
 * 알약 모양. 좋아요와 댓글 수가 같은 줄에 같은 모양으로 선다 (`components/post/LikeButton.tsx`).
 * @see docs/DESIGN.md 알약
 */
export const PILL_BASE =
	"inline-flex h-8 items-center gap-1 rounded-full bg-fill px-3 text-subhead font-semibold text-fg-muted";

/** 누를 수 있는 알약. 포커스 링과 누름이 붙는다 */
export const PILL = `${PILL_BASE} transition duration-(--motion-fast) ease-(--ease-standard) focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary active:scale-97 active:brightness-92`;

/**
 * 댓글 수 알약. 누르면 그 글의 상세로 간다. `href`가 없으면 누를 수 없는 수만 선다(게시글 상세의 원글).
 * 게시글과 댓글이 같이 쓰므로 기능 폴더가 아니라 `components/ui/`에 둔다.
 */
export function CommentCount({
	href,
	count,
	/** 스크린리더가 읽을 말. 게시글에서는 "댓글", 댓글에서는 "답글"이다 */
	label,
}: {
	href?: string;
	count: number;
	label: string;
}) {
	if (!href) {
		return (
			<span className={PILL_BASE}>
				<MessageCircle aria-hidden className="size-4 shrink-0" />
				<span className="sr-only">{label}</span>
				<span className="tabular-nums">{count}</span>
			</span>
		);
	}

	return (
		<Link aria-label={`${label} ${count}개`} className={PILL} href={href}>
			<MessageCircle aria-hidden className="size-4 shrink-0" />
			{/* 링크의 aria-label이 같은 수를 읽으므로 숫자는 여기서 장식이다 */}
			<span aria-hidden className="tabular-nums">
				{count}
			</span>
		</Link>
	);
}
