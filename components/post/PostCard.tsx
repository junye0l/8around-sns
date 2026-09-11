import { Avatar } from "@/components/ui/Avatar";
import type { FeedPost } from "@/lib/queries/post";
import { formatRelativeTime } from "@/lib/utils/relative-time";

/**
 * 피드 한 줄. 그림자를 쓰지 않고 `border-hairline` 1px로만 나눈다 (DESIGN.md §2 Depth).
 * 목록의 마지막 칸은 바깥 테두리와 겹치므로 아래 선을 뺀다.
 */
export function PostCard({ post }: { post: FeedPost }) {
	return (
		<article className="flex gap-3 border-hairline border-b p-4 last:border-b-0">
			<Avatar name={post.author.display_name} />

			{/* min-w-0 이 없으면 긴 별명이 flex 칸을 밀어내 시각이 잘린다 */}
			<div className="min-w-0 flex-1">
				<div className="flex items-baseline gap-2">
					<span className="truncate text-body-sm font-semibold text-fg">
						{post.author.display_name}
					</span>
					<span className="truncate text-body-sm text-fg-muted">
						@{post.author.username}
					</span>
					<time
						className="ml-auto shrink-0 text-body-sm text-fg-muted"
						dateTime={post.created_at}
					>
						{formatRelativeTime(post.created_at)}
					</time>
				</div>

				{/* 줄바꿈은 살리고, 띄어쓰기 없는 긴 문자열은 칸을 넘지 않게 끊는다 */}
				<p className="mt-1 whitespace-pre-wrap break-words text-body text-fg">
					{post.content}
				</p>
			</div>
		</article>
	);
}
