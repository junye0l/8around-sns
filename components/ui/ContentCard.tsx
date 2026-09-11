import type { ReactNode } from "react";
import { Avatar } from "@/components/ui/Avatar";
import { formatRelativeTime } from "@/lib/utils/relative-time";

type ContentCardProps = {
	author: { username: string; display_name: string };
	createdAt: string;
	content: string;
	/** 본문 아래 줄. 게시글·댓글의 댓글 수가 여기 붙는다 */
	footer?: ReactNode;
	/**
	 * 아래 칸과 한 스레드로 이어진다. 아바타 밑으로 세로선이 흐르고 구분선은 빠진다 —
	 * 선이 이미 "이어짐"을 말하는데 그 위에 칸을 나누는 선까지 그으면 둘이 싸운다
	 * ([결정 0008](../../docs/decisions/0008-reply-tree-on-post.md)).
	 */
	connected?: boolean;
};

/**
 * 누군가 쓴 글 한 칸. 게시글과 댓글이 같은 모양이라 하나를 같이 쓴다 (규칙 2).
 * 그림자를 쓰지 않고 `border-hairline` 1px로만 나눈다 (DESIGN.md §2 Depth).
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
					<span className="truncate text-body-sm font-semibold text-fg">
						{author.display_name}
					</span>
					<span className="truncate text-body-sm text-fg-muted">
						@{author.username}
					</span>
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

				{footer && <div className="mt-3">{footer}</div>}
			</div>
		</article>
	);
}
