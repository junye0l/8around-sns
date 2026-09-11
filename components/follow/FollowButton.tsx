"use client";

import { useActionState } from "react";
import { Button } from "@/components/ui/Button";
import { setFollowAction } from "@/lib/actions/follow";
import type { SetFollowResult } from "@/lib/services/follow";

/**
 * 팔로우 토글. 누르면 걸리고 한 번 더 누르면 풀린다.
 *
 * 지금 상태는 서버가 준다. 액션이 끝나면 `refresh`가 화면을 다시 그리므로
 * 버튼이 자기 상태를 따로 들고 있지 않는다 — 들고 있으면 서버와 두 벌이 된다.
 *
 * `aria-pressed`로 눌린 상태를 내보낸다. 라벨만 바뀌면 포커스가 머문 채 텍스트
 * 노드만 교체돼 스크린리더가 지나친다. 결정 0012.
 *
 * 자기 프로필에는 이 버튼이 서지 않는다. 부르는 쪽이 결정한다.
 */
export function FollowButton({
	targetId,
	following,
}: {
	targetId: string;
	/** 지금 팔로우 중인가. 눌렀을 때의 의도가 여기서 나온다 */
	following: boolean;
}) {
	const [result, formAction, pending] = useActionState<
		SetFollowResult | null,
		FormData
	>(setFollowAction, null);

	const error = result && !result.ok ? result.error : null;

	return (
		<form action={formAction} className="flex flex-col items-end gap-1">
			<input name="target_id" type="hidden" value={targetId} />
			<input
				name="intent"
				type="hidden"
				value={following ? "unfollow" : "follow"}
			/>

			<Button
				// 토글 버튼은 AT가 아는 패턴이라 눌린 상태가 바뀌면 알아서 읽어준다.
				// refresh로 라벨만 바뀌면 포커스가 머문 채라 조용히 지나간다
				aria-pressed={following}
				loading={pending}
				type="submit"
				variant={following ? "outline" : "primary"}
			>
				{following ? "팔로잉" : "팔로우"}
			</Button>

			{error && (
				<p className="text-body-sm text-danger" role="alert">
					{error}
				</p>
			)}
		</form>
	);
}
