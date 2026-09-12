import Link from "next/link";
import type { ReactNode } from "react";
import { Avatar } from "@/components/ui/Avatar";
import { formatRelativeTime } from "@/lib/utils/relative-time";

type ContentCardProps = {
	author: { username: string; display_name: string };
	createdAt: string;
	content: string;
	/** 본문 아래 줄. 좋아요 버튼과 댓글 수가 여기 붙는다 */
	footer?: ReactNode;
	/** 오른쪽 위 모서리. 내 글이면 더보기 메뉴가 여기 선다 */
	menu?: ReactNode;
	/**
	 * 아래 칸과 한 스레드로 이어진다. 아바타 밑으로 세로선이 흐르고 구분선은 빠진다.
	 * @see docs/decisions/0008-reply-tree-on-post.md
	 */
	connected?: boolean;
};

/**
 * 누군가 쓴 글 한 칸. 게시글과 댓글이 같은 모양이라 하나를 같이 쓴다.
 *
 * 이름과 시간이 한 줄에 왼쪽부터 선다. 시간을 오른쪽 끝으로 밀지 않는다,
 * 눈이 이름에서 본문으로 내려가는 길에 시간이 같이 읽힌다. 레퍼런스(Threads)의 배치다.
 *
 * 목록의 마지막 칸은 바깥 테두리와 겹치므로 아래 선을 뺀다.
 */
export function ContentCard({
	author,
	createdAt,
	content,
	footer,
	menu,
	connected = false,
}: ContentCardProps) {
	return (
		<article
			className={`flex gap-3 px-6 py-3 ${connected ? "" : "border-hairline border-b last:border-b-0"}`}
		>
			<div className="flex flex-col items-center gap-2">
				<Avatar name={author.display_name} />

				{/* 칸 사이가 위아래 패딩 12px씩 = 24px 벌어져 있다. 그만큼 아래로 넘겨야
				    선이 다음 아바타에 닿는다 (`-mb-6`, 4px 그리드 위의 값) */}
				{connected && <div className="-mb-6 w-px flex-1 bg-hairline" />}
			</div>

			{/* min-w-0 이 없으면 긴 이름이 flex 칸을 밀어내 시각이 잘린다 */}
			<div className="min-w-0 flex-1">
				<div className="flex min-w-0 items-baseline gap-2 text-body-sm">
					{/* 이름을 누르면 그 사람의 프로필로 간다. 아바타는 aria-hidden이라
					    링크로 감싸면 이름 없는 링크가 하나 더 생긴다 */}
					<Link
						className="-m-1 min-w-0 truncate rounded-md p-1 font-semibold text-fg transition-colors duration-[var(--motion-fast)] ease-(--ease-standard) hover:bg-background focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
						href={`/u/${author.username}`}
					>
						{author.display_name}
					</Link>
					<time className="shrink-0 text-fg-muted" dateTime={createdAt}>
						{formatRelativeTime(createdAt)}
					</time>

					{/* -my-2 -mr-2 는 아이콘 버튼의 누를 자리(p-2)만큼 되돌린다. 메뉴가 있는 칸과
					    없는 칸의 높이가 같아지고, 아이콘이 카드 오른쪽 여백에 맞춰 선다 */}
					{menu && <div className="-my-2 -mr-2 ml-auto self-start">{menu}</div>}
				</div>

				{/* 줄바꿈은 살리고, 띄어쓰기 없는 긴 문자열은 칸을 넘지 않게 끊는다 */}
				<p className="mt-0.5 whitespace-pre-wrap break-words text-body text-fg">
					{content}
				</p>

				{/* -ml-2 는 아이콘 버튼의 누를 자리(p-2)만큼 되돌려 아이콘이 본문과 같은 선에 서게 한다 */}
				{footer && <div className="-ml-2 mt-1 flex">{footer}</div>}
			</div>
		</article>
	);
}
