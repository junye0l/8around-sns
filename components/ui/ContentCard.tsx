import Link from "next/link";
import type { ReactNode } from "react";
import { Avatar } from "@/components/ui/Avatar";
import { formatRelativeTime } from "@/lib/utils/relative-time";

type ContentCardProps = {
	author: { username: string; display_name: string };
	createdAt: string;
	content: string;
	/** 본문 아래 줄. 댓글 수가 여기 붙는다 */
	footer?: ReactNode;
	/**
	 * 아래 칸과 한 스레드로 이어진다. 아바타 밑으로 세로선이 흐르고 구분선은 빠진다.
	 * @see docs/decisions/0008-reply-tree-on-post.md
	 */
	connected?: boolean;
};

/**
 * 누군가 쓴 글 한 칸. 게시글과 댓글이 같은 모양이라 하나를 같이 쓴다.
 *
 * 목록의 마지막 칸은 바깥 테두리와 겹치므로 아래 선을 뺀다.
 */
export function ContentCard({
	author,
	createdAt,
	content,
	footer,
	connected = false,
}: ContentCardProps) {
	return (
		<article
			className={`flex gap-3 p-4 ${connected ? "" : "border-hairline border-b last:border-b-0"}`}
		>
			<div className="flex flex-col items-center gap-2">
				<Avatar name={author.display_name} />

				{/* 칸 사이가 위아래 패딩 16px씩 = 32px 벌어져 있다. 그만큼 아래로 넘겨야
				    선이 다음 아바타에 닿는다 (`-mb-8`, 4px 그리드 위의 값) */}
				{connected && <div className="-mb-8 w-px flex-1 bg-hairline" />}
			</div>

			{/* min-w-0 이 없으면 긴 별명이 flex 칸을 밀어내 시각이 잘린다 */}
			<div className="min-w-0 flex-1">
				<div className="flex items-baseline gap-2">
					{/* 이름을 누르면 그 사람의 프로필로 간다. 아바타는 aria-hidden이라
					    링크로 감싸면 이름 없는 링크가 하나 더 생긴다 */}
					<Link
						className="-m-2 flex min-w-0 items-baseline gap-2 rounded-md p-2 transition-colors duration-[var(--motion-fast)] ease-(--ease-standard) hover:bg-background focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
						href={`/u/${author.username}`}
					>
						<span className="truncate text-body-sm font-semibold text-fg">
							{author.display_name}
						</span>
						<span className="truncate text-body-sm text-fg-muted">
							@{author.username}
						</span>
					</Link>
					<time
						className="ml-auto shrink-0 text-body-sm text-fg-muted"
						dateTime={createdAt}
					>
						{formatRelativeTime(createdAt)}
					</time>
				</div>

				{/* 줄바꿈은 살리고, 띄어쓰기 없는 긴 문자열은 칸을 넘지 않게 끊는다 */}
				<p className="mt-1 whitespace-pre-wrap break-words text-body text-fg">
					{content}
				</p>

				{footer && <div className="mt-2">{footer}</div>}
			</div>
		</article>
	);
}
