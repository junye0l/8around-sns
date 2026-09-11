import { MessageCircle } from "lucide-react";
import Link from "next/link";

/**
 * 댓글 수. 누르면 그 글의 상세로 간다.
 *
 * 게시글과 댓글이 같이 쓰므로 기능 폴더가 아니라 `components/ui/`에 둔다.
 */
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
			<MessageCircle aria-hidden className="size-4 shrink-0" />
			<span aria-hidden>{count}</span>
		</Link>
	);
}
