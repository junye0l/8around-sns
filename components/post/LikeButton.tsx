"use client";

import { Heart } from "lucide-react";
import { useOptimistic, useState } from "react";
import { setPostLikeAction } from "@/lib/actions/post";

/**
 * 좋아요 토글. 누르면 채워지고 한 번 더 누르면 비워진다. 게시글에만 붙는다.
 *
 * 누르는 즉시 반영한다. 서버 왕복을 기다리면 손가락과 화면 사이에 빈 시간이 생기고,
 * 그 사이 같은 버튼을 다시 누르게 된다. 실패하면 마지막으로 확정된 값으로 되돌아오고
 * 문구가 뜬다. 결정 0021.
 *
 * 성공한 값은 여기서 확정한다. 액션이 화면을 다시 그리지 않으므로(결정 0024) 서버 props는
 * 다음 렌더까지 그대로인데, `useOptimistic`은 액션이 끝나면 기준값으로 돌아간다 — 기준을
 * props가 아니라 확정 상태로 두어야 되돌아가지 않는다. props가 바뀌면(다른 액션이
 * 화면을 다시 그린 경우) 확정 상태를 그 값으로 다시 맞춘다.
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
	/** 서버가 아는 지금 상태. 누르면 이 값을 앞질러 먼저 바꾼다 */
	liked: boolean;
	count: number;
}) {
	const [error, setError] = useState<string | null>(null);
	// 누르기 전에는 애니메이션을 걸지 않는다. 걸면 이미 누른 글이 화면에 뜰 때마다 튄다
	const [pressed, setPressed] = useState(false);

	// 서버가 확인해 준 마지막 값. props가 바뀌면 그쪽이 더 새 것이므로 따라간다
	const [known, setKnown] = useState({ liked, count });
	const [seen, setSeen] = useState({ liked, count });
	if (seen.liked !== liked || seen.count !== count) {
		setSeen({ liked, count });
		setKnown({ liked, count });
	}

	// "next로 만든다"이지 "하나 더한다"가 아니다. 성공 뒤 `known`을 앞당긴 렌더에 아직 안 걷힌
	// 낙관 업데이트가 한 번 더 얹히는데, 그때 수가 두 번 오르지 않아야 한다
	const step = (state: { liked: boolean; count: number }, next: boolean) =>
		state.liked === next
			? state
			: { liked: next, count: state.count + (next ? 1 : -1) };
	const [shown, toggle] = useOptimistic(known, step);

	return (
		<form
			action={async (formData) => {
				const next = !shown.liked;
				toggle(next);
				// 액션이 끝나면 `known`으로 돌아간다. 성공했으면 그 전에 `known`을 앞당긴다
				const result = await setPostLikeAction(null, formData);
				if (result.ok) setKnown((state) => step(state, next));
				setError(result.ok ? null : result.error);
			}}
		>
			<input name="post_id" type="hidden" value={postId} />
			<input
				name="intent"
				type="hidden"
				value={shown.liked ? "unlike" : "like"}
			/>

			<button
				// 토글 버튼은 AT가 아는 패턴이라 눌린 상태가 바뀌면 읽어준다.
				// 아이콘만 바뀌면 포커스가 머문 채라 조용히 지나간다
				aria-label={`좋아요 ${shown.count}개`}
				aria-pressed={shown.liked}
				className={`inline-flex items-center gap-1 rounded-full p-2 text-body-sm transition-colors duration-[var(--motion-fast)] ease-(--ease-standard) hover:bg-background hover:text-fg focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary active:bg-hairline ${shown.liked ? "text-fg" : "text-fg-muted"}`}
				onClick={() => setPressed(true)}
				type="submit"
			>
				<Heart
					aria-hidden
					className={`size-5 shrink-0 ${shown.liked ? "fill-current" : ""} ${pressed && shown.liked ? "animate-like-pop" : ""}`}
				/>
				{/* 0도 보인다. 옆의 댓글 수와 같은 규칙이다 */}
				<span aria-hidden className="tabular-nums">
					{shown.count}
				</span>
			</button>

			{error && (
				<p className="text-body-sm text-danger" role="alert">
					{error}
				</p>
			)}
		</form>
	);
}
