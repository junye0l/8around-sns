import { Button } from "@/components/ui/Button";

/**
 * 없는 댓글. 지워진 댓글, 이상한 주소, 그리고 **답글의 주소**가 여기로 온다 —
 * 답글에는 자기 화면이 없다 (`lib/queries/comment.ts`의 `getComment`, 결정 0007).
 *
 * 문구는 DESIGN.md §6 — 무엇이 없는지 한 줄로 말하고 다음 행동만 가리킨다.
 * 돌아갈 글을 모르므로("어느 댓글인지"를 못 읽었다) 추천으로 보낸다.
 */
export default function CommentNotFound() {
	return (
		<main className="flex flex-1 flex-col items-center justify-center gap-4 px-4 text-center">
			<p className="text-body font-semibold text-fg">댓글을 찾지 못했어요</p>
			<p className="text-body-sm text-fg-muted">
				지워졌거나 주소가 바뀌었을 수 있어요.
			</p>
			<Button href="/">추천으로 돌아가기</Button>
		</main>
	);
}
