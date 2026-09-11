import { MessageCircle } from "lucide-react";
import Link from "next/link";

/**
 * 댓글 수. 누르면 그 글의 상세로 간다.
 *
 * 게시글과 댓글이 같이 쓰므로 기능 폴더가 아니라 `components/ui/`에 둔다.
 *
 * 아이콘이 `size-5`인 이유는 이것이 본문 옆 보조 정보가 아니라 누르는 동작이기 때문이다.
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
			className="inline-flex items-center gap-1 rounded-full p-2 text-body-sm text-fg-muted transition-colors duration-[var(--motion-fast)] ease-(--ease-standard) hover:bg-background hover:text-fg focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
			href={href}
		>
			<MessageCircle aria-hidden className="size-5 shrink-0" />
			{count > 0 && (
				<span aria-hidden className="tabular-nums">
					{count}
				</span>
			)}
		</Link>
	);
}
