import { MessageCircleX } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/EmptyState";

/**
 * 없는 댓글. 지워진 댓글, 이상한 주소, 답글의 주소가 여기로 온다. 답글에는 자기 화면이 없다 (`lib/queries/comment.ts`의 `getComment`, 결정 0007).
 * 어느 글의 댓글인지 모르는 상태라 돌아갈 곳은 전체다.
 * @see docs/DESIGN.md 없는 페이지, 에러
 */
export default function CommentNotFound() {
	return (
		<main className="flex w-full min-w-0 max-w-150 flex-1 flex-col justify-center px-3 py-10">
			<EmptyState
				action={
					<Button href="/" size="sm">
						전체로 돌아가기
					</Button>
				}
				description="지워졌거나 주소가 바뀌었을 수 있어요."
				heading
				icon={MessageCircleX}
				title="댓글을 찾지 못했어요"
			/>
		</main>
	);
}
