import { Button } from "@/components/ui/Button";

/**
 * 없는 댓글. 지워진 댓글, 이상한 주소, 답글의 주소가 여기로 온다.
 * 답글에는 자기 화면이 없다.
 *
 * 어느 글의 댓글인지 모르는 상태라 돌아갈 곳은 추천이다.
 * @see lib/queries/comment.ts 의 getComment
 * @see docs/decisions/0007-comment-routes.md
 */
export default function CommentNotFound() {
	return (
		<main className="flex flex-1 flex-col items-center justify-center gap-4 px-4 text-center">
			<h1 className="text-body font-semibold text-fg">댓글을 찾지 못했어요</h1>
			<p className="text-body-sm text-fg-muted">
				지워졌거나 주소가 바뀌었을 수 있어요.
			</p>
			<Button href="/">추천으로 돌아가기</Button>
		</main>
	);
}
