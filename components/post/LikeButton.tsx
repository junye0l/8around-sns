"use client";

import { Heart } from "lucide-react";
import { useActionState } from "react";
import { setPostLikeAction } from "@/lib/actions/post";
import type { SetPostLikeResult } from "@/lib/services/post";

/**
 * 좋아요 토글. 누르면 채워지고 한 번 더 누르면 비워진다. 게시글에만 붙는다.
 *
 * 지금 상태는 서버가 준다. 액션이 끝나면 `refresh`가 화면을 다시 그리므로 버튼이
 * 자기 상태를 따로 들고 있지 않는다 — `FollowButton`과 같은 이유다.
 *
 * 누른 상태는 색이 아니라 채움으로 말한다. 빨강(`danger`)은 파괴적 동작과 에러의
 * 색이라 가져오지 않았다. 결정 0020.
 *
 * 모양은 옆의 `CommentCount`와 맞춘다 — 같은 줄에 서는 같은 크기의 동작이다.
 */
export function LikeButton({
	postId,
	liked,
	count,
}: {
	postId: string;
	/** 지금 좋아요를 누른 상태인가. 눌렀을 때의 의도가 여기서 나온다 */
	liked: boolean;
	count: number;
}) {
	const [result, formAction, pending] = useActionState<
		SetPostLikeResult | null,
		FormData
	>(setPostLikeAction, null);

	const error = result && !result.ok ? result.error : null;

	return (
		<form action={formAction}>
			<input name="post_id" type="hidden" value={postId} />
			<input name="intent" type="hidden" value={liked ? "unlike" : "like"} />

			<button
				// 진행 중에도 살려둔다. 포커스된 요소가 disabled가 되면 브라우저가
				// 포커스를 body로 떨어뜨린다 (`components/ui/Button.tsx`와 같은 판단)
				aria-busy={pending || undefined}
				aria-disabled={pending || undefined}
				// 토글 버튼은 AT가 아는 패턴이라 눌린 상태가 바뀌면 읽어준다.
				// 아이콘만 바뀌면 포커스가 머문 채라 조용히 지나간다
				aria-label={`좋아요 ${count}개`}
				aria-pressed={liked}
				className={`inline-flex items-center gap-1 rounded-full p-2 text-body-sm transition-colors duration-[var(--motion-fast)] ease-(--ease-standard) hover:bg-background hover:text-fg focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary active:bg-hairline aria-busy:cursor-progress ${liked ? "text-fg" : "text-fg-muted"}`}
				onClick={(event) => {
					// 두 번 빠르게 눌러도 요청은 하나다. 겹쳐 들어와도 DB에서 행은
					// 하나지만(기본키), 화면이 두 번 깜빡이는 것까지 막는다
					if (pending) event.preventDefault();
				}}
				type="submit"
			>
				<Heart
					aria-hidden
					className={`size-5 shrink-0 ${liked ? "fill-current" : ""}`}
				/>
				{/* 0이면 숫자를 감춘다. 옆의 댓글 수와 같은 규칙이고, aria-label은 여전히 "0개"를 읽는다 */}
				{count > 0 && (
					<span aria-hidden className="tabular-nums">
						{count}
					</span>
				)}
			</button>

			{error && (
				<p className="text-body-sm text-danger" role="alert">
					{error}
				</p>
			)}
		</form>
	);
}
