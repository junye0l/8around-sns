"use client";

import {
	type ReactNode,
	useActionState,
	useEffect,
	useId,
	useState,
} from "react";
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
 * 입력칸. 아바타 옆에 이름이 서고 그 아래로 입력이, 오른쪽 끝 아래에 버튼이 온다.
 * 모달과 추천 피드가 같은 모양을 쓴다.
 *
 * **포커스 링이 없다.** 캐럿이 포커스를 말한다. 결정 0017.
 *
 * **글자수 카운터를 두지 않는다.** 손대는 순간 없던 줄이 생겨 아래가 밀렸다.
 * 상한은 `maxLength`가 조용히 막고, 진짜 방어는 서버와 DB 제약이 한다 (규칙 9).
 * 결정 0014.
 *
 * **높이가 고정이다.** 접었다 펴면 그것도 레이아웃이 밀리는 일이다.
 *
 * 이미지, GIF, 투표 같은 것은 범위 밖이라 아이콘 자리를 만들지 않는다.
 *
 * textarea를 제어 컴포넌트로 둔다. React 19는 함수 action이 끝나면 폼을 자동으로
 * 비우는데, 그러면 저장에 실패했을 때 쓰던 글까지 같이 날아간다. 값을 state로
 * 들고 있으면 실패한 화면에 글이 남고, 성공했을 때만 비운다.
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
	const [content, setContent] = useState("");
	const id = useId();

	// 성공했을 때만 비운다. result는 액션이 끝날 때마다 새 객체라 이걸로 구분된다
	useEffect(() => {
		if (result?.ok) {
			setContent("");
			onSuccess?.();
		}
	}, [result, onSuccess]);

	const error = result && !result.ok ? result.error : null;

	return (
		<form
			action={formAction}
			className="flex gap-3 border-hairline border-b px-6 py-3 last:border-b-0"
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
					className="mt-0.5 w-full resize-none text-body text-fg outline-none placeholder:text-fg-muted"
					disabled={pending}
					id={id}
					// 브라우저 쪽 상한은 친절함이다. 진짜 방어는 서버와 DB 제약이 한다 (규칙 9)
					maxLength={maxLength}
					name="content"
					onChange={(event) => setContent(event.target.value)}
					placeholder={placeholder}
					required
					rows={3}
					value={content}
				/>

				{error && (
					<p className="mt-1 text-body-sm text-danger" role="alert">
						{error}
					</p>
				)}
			</div>

			<Button className="self-end" loading={pending} size="sm" type="submit">
				{submitLabel}
			</Button>
		</form>
	);
}
