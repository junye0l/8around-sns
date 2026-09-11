import { CommentCount } from "@/components/ui/CommentCount";
import { ContentCard } from "@/components/ui/ContentCard";
import type { PostComment } from "@/lib/queries/comment";

/**
 * 댓글 하나와 거기 딸린 답글. 답글 화면(`app/comment/[id]/page.tsx`)이 본문과 댓글을
 * 잇는 것과 **같은 방식**으로 잇는다 — 아바타 밑으로 세로선이 흐른다
 * ([결정 0008](../../docs/decisions/0008-reply-tree-on-post.md)).
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
	const last = comment.replies.length - 1;

	return (
		<div className="border-hairline border-b last:border-b-0">
			<ContentCard
				author={comment.author}
				connected={comment.replies.length > 0}
				content={comment.content}
				createdAt={comment.created_at}
				footer={
					<CommentCount
						count={comment.replies.length}
						href={`/comment/${comment.id}`}
						label="답글"
					/>
				}
			/>

			{comment.replies.map((reply, index) => (
				<ContentCard
					author={reply.author}
					connected={index < last}
					content={reply.content}
					createdAt={reply.created_at}
					key={reply.id}
				/>
			))}
		</div>
	);
}
