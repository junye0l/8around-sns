"use client";

import { Check } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { useSubmitAction } from "@/hooks/useSubmitAction";
import { setFollowAction } from "@/lib/actions/follow";
import type { SetFollowResult } from "@/lib/services/follow";

/**
 * 팔로우 토글. 팔로우 전은 primary "팔로우", 팔로잉 중은 secondary 체크와 "팔로잉".
 *
 * 지금 상태는 서버가 준다. 액션이 끝나면 `refresh`가 화면을 다시 그리므로
 * 버튼이 자기 상태를 따로 들고 있지 않는다 — 들고 있으면 서버와 두 벌이 된다.
 * 다시 그려도 같은 버튼이라 포커스가 머문다.
 *
 * `aria-pressed`로 눌린 상태를 내보낸다. 라벨만 바뀌면 포커스가 머문 채 텍스트
 * 노드만 교체돼 스크린리더가 지나친다. 결정 0012.
 *
 * 자기 프로필과 목록의 내 행에는 이 버튼이 서지 않는다. 부르는 쪽이 결정한다.
 * @see docs/DESIGN.md 프로필
 */
export function FollowButton({
	targetId,
	following,
	size = "md",
}: {
	targetId: string;
	/** 지금 팔로우 중인가. 눌렀을 때의 의도가 여기서 나온다 */
	following: boolean;
	/** 프로필 헤더는 전체 폭 `md`, 팔로워 목록 행은 `sm` */
	size?: "md" | "sm";
}) {
	const [result, formAction, pending] = useSubmitAction<SetFollowResult | null>(
		setFollowAction,
		null,
	);

	const error = result && !result.ok ? result.error : null;

	return (
		<form action={formAction} className="flex flex-col gap-1">
			<input name="target_id" type="hidden" value={targetId} />
			<input
				name="intent"
				type="hidden"
				value={following ? "unfollow" : "follow"}
			/>

			<Button
				aria-pressed={following}
				className={size === "md" ? "w-full" : undefined}
				loading={pending}
				size={size}
				type="submit"
				variant={following ? "secondary" : "primary"}
			>
				{following && (
					<Check aria-hidden className={size === "md" ? "size-5" : "size-4"} />
				)}
				{following ? "팔로잉" : "팔로우"}
			</Button>

			{error && (
				<p className="text-footnote text-danger" role="alert">
					{error}
				</p>
			)}
		</form>
	);
}
