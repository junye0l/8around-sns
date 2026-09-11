"use client";

import { type ReactNode, useActionState, useEffect, useId } from "react";
import { Avatar } from "@/components/ui/Avatar";
import { Button } from "@/components/ui/Button";

type ComposerResult = { ok: true } | { ok: false; error: string };

type ComposerProps = {
	authorName: string;
	action: (
		prev: ComposerResult | null,
		formData: FormData,
	) => Promise<ComposerResult>;
	placeholder: string;
	submitLabel: string;
	maxLength: number;
	/** 액션에 같이 보낼 숨은 입력. 댓글은 여기에 post_id를 싣는다 */
	children?: ReactNode;
	/** 저장에 성공했을 때. 모달이 이걸로 닫힌다 */
	onSuccess?: () => void;
};

/**
 * 입력칸. 아바타 옆에 이름이 서고 그 아래로 입력과 버튼이 온다.
 * 모달과 추천 피드가 같은 모양을 쓴다.
 *
 * **글자수 카운터를 두지 않는다.** 손대는 순간 없던 줄이 생겨 아래가 밀렸다.
 * 상한은 `maxLength`가 조용히 막고, 진짜 방어는 서버와 DB 제약이 한다 (규칙 9).
 * 결정 0014.
 *
 * **높이가 고정이다.** 접었다 펴면 그것도 레이아웃이 밀리는 일이다.
 *
 * 이미지, GIF, 투표 같은 것은 범위 밖이라 아이콘 자리를 만들지 않는다.
 *
 * textarea를 제어 컴포넌트로 두지 않는다. React 19는 함수 action이 끝나면 폼을
 * 자동으로 비우는데, 실패했을 때 쓰던 글이 날아가지 않게 `defaultValue`와 `key`로
 * 성공했을 때만 새로 그린다.
 */
export function Composer({
	authorName,
	action,
	placeholder,
	submitLabel,
	maxLength,
	children,
	onSuccess,
}: ComposerProps) {
	const [result, formAction, pending] = useActionState<
		ComposerResult | null,
		FormData
	>(action, null);
	const id = useId();

	useEffect(() => {
		if (result?.ok) onSuccess?.();
	}, [result, onSuccess]);

	const error = result && !result.ok ? result.error : null;

	return (
		<form
			action={formAction}
			className="flex gap-3 border-hairline border-b p-4 last:border-b-0"
		>
			{children}
			<Avatar name={authorName} />

			{/* min-w-0 이 없으면 긴 이름이 flex 칸을 밀어내 시각이 잘린다 */}
			<div className="min-w-0 flex-1">
				<p className="truncate text-body-sm font-semibold text-fg">
					{authorName}
				</p>

				<label className="sr-only" htmlFor={id}>
					{placeholder}
				</label>
				<textarea
					className="mt-1 w-full resize-none text-body text-fg placeholder:text-fg-muted focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-primary"
					disabled={pending}
					id={id}
					// 성공하면 key가 바뀌어 빈 칸으로 다시 그려진다. 실패하면 쓰던 글이 남는다
					key={result?.ok ? "sent" : "editing"}
					// 브라우저 쪽 상한은 친절함이다. 진짜 방어는 서버와 DB 제약이 한다 (규칙 9)
					maxLength={maxLength}
					name="content"
					placeholder={placeholder}
					required
					rows={3}
				/>

				{error && (
					<p className="mt-1 text-body-sm text-danger" role="alert">
						{error}
					</p>
				)}

				<div className="mt-2 flex justify-end">
					<Button loading={pending} size="sm" type="submit">
						{submitLabel}
					</Button>
				</div>
			</div>
		</form>
	);
}
