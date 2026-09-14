import Link from "next/link";
import { Avatar } from "@/components/ui/Avatar";
import { CommentCount } from "@/components/ui/CommentCount";
import { ContentCard } from "@/components/ui/ContentCard";
import type { PostComment } from "@/lib/queries/comment";
import { cn } from "@/lib/utils/cn";

/** 스택에 세울 아바타 수. 레퍼런스(Threads)가 셋까지 겹친다 */
const STACK_MAX = 3;

/**
 * 댓글 하나와 거기 딸린 답글. 답글이 하나면 아래에 그대로 펴고, 둘 이상이면 접어서
 * 겹친 아바타와 "답글 보기"만 둔다
 * ([결정 0008](../../docs/decisions/0008-reply-tree-on-post.md) ·
 * [0019](../../docs/decisions/0019-comment-compose-modal.md)).
 *
 * 펴는 쪽은 답글 화면(`app/(main)/comment/[id]/page.tsx`)이 본문과 댓글을 잇는 것과 **같은 방식**으로
 * 잇는다 — 아바타 밑으로 세로선이 흐른다.
 *
 * 들여쓰지 않는다. 선이 아바타 가운데를 지나는데 답글을 옆으로 밀면 선이 아무것도
 * 가리키지 않는 빈자리로 떨어진다. 답글인지 아닌지는 선이 말한다.
 *
 * 마지막 칸만 선을 끊는다. 선이 이 묶음 밖으로 이어지면 다음 댓글까지 한 스레드로 읽힌다.
 *
 * 바깥 테두리는 이 묶음이 그린다. 안쪽 카드는 이어진 동안 구분선이 없고, 마지막 칸은
 * `last:border-b-0`이라 아래 선이 빠진다. 그 자리를 이 div가 대신 채운다.
 */
export function CommentThread({ comment }: { comment: PostComment }) {
	const { replies } = comment;
	const last = replies.length - 1;

	// 같은 사람이 여러 번 답글을 달아도 원은 하나다. Map은 처음 넣은 순서를 지킨다
	const stacked = [
		...new Map(replies.map((reply) => [reply.author.id, reply.author])),
	].slice(0, STACK_MAX);

	return (
		<div className="border-hairline border-b last:border-b-0">
			<ContentCard
				author={comment.author}
				connected={replies.length > 0}
				content={comment.content}
				createdAt={comment.created_at}
				footer={
					<CommentCount
						count={replies.length}
						href={`/comment/${comment.id}`}
						label="답글"
					/>
				}
			/>

			{replies.length > 1 ? (
				// 세로선이 여기서 끝난다. 겹친 원이 선 끝에 서고 그 옆이 들어가는 길이다.
				// 위아래 패딩은 `ContentCard`와 같아야 한다 — 위 칸에서 내려오는 선의 길이가
				// 두 패딩의 합으로 계산돼 있다
				<div className="flex items-center gap-3 px-6 py-4">
					{/* 세로선은 위 칸의 36px 아바타 가운데(칸 왼쪽에서 18px)로 흐른다.
					    여기 원은 24px이라 6px 밀어야 선 끝과 중심이 맞는다 */}
					<div className="ml-1.5 flex">
						{stacked.map(([authorId, author], index) => (
							<Avatar
								className={cn(
									"size-6",
									// 겹치는 원은 카드 바탕색 테두리로 서로를 끊는다. 그림자를 쓰지 않는다
									index > 0 && "-ml-2 ring-2 ring-canvas",
								)}
								key={authorId}
								path={author.avatar_path}
							/>
						))}
					</div>
					<Link
						className="rounded-md text-body-sm text-fg-muted transition-colors duration-[var(--motion-fast)] ease-(--ease-standard) hover:text-fg focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
						href={`/comment/${comment.id}`}
					>
						답글 보기
					</Link>
				</div>
			) : (
				replies.map((reply, index) => (
					<ContentCard
						author={reply.author}
						connected={index < last}
						content={reply.content}
						createdAt={reply.created_at}
						key={reply.id}
					/>
				))
			)}
		</div>
	);
}
