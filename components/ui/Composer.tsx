"use client";

import { type ReactNode, useId } from "react";
import { Avatar } from "@/components/ui/Avatar";

/**
 * 글쓰기 시트의 본문. 아바타와 이름 아래로 3줄 입력칸이 선다. 보내기 버튼은 시트 머리에 있어
 * `form` 속성으로 이 폼에 붙는다. 상태는 `ComposeDialog`가 들고 있다.
 *
 * **포커스 링이 없다.** 캐럿이 포커스를 말한다. 결정 0017.
 *
 * **글자수 카운터를 두지 않는다.** 손대는 순간 없던 줄이 생겨 아래가 밀렸다.
 * 상한은 `maxLength`가 조용히 막고, 진짜 방어는 서버와 DB 제약이 한다 (규칙 9). 결정 0014.
 *
 * **높이가 고정이다.** 접었다 펴면 그것도 레이아웃이 밀리는 일이다.
 *
 * 입력칸은 바텀 시트 끌기에서 뺀다(`data-vaul-no-drag`). 글자를 고르려고 끌면 시트가 내려간다.
 * @see docs/DESIGN.md 글쓰기 시트
 */
export function Composer({
	formId,
	formAction,
	authorName,
	authorAvatar,
	authorId,
	placeholder,
	maxLength,
	content,
	onContentChange,
	pending,
	error,
	children,
}: {
	formId: string;
	formAction: (formData: FormData) => void;
	authorName: string;
	/** 아바타에 쓸 `profiles.avatar_path`. 없으면 첫 글자다 */
	authorAvatar?: string | null;
	/** 사진 없는 아바타의 톤을 고르는 사용자 id */
	authorId?: string;
	placeholder: string;
	maxLength: number;
	content: string;
	onContentChange: (content: string) => void;
	pending: boolean;
	error: string | null;
	/** 액션에 같이 보낼 숨은 입력. 댓글은 여기에 post_id를 싣는다 */
	children?: ReactNode;
}) {
	const id = useId();

	return (
		<form action={formAction} className="px-5 pb-5" id={formId}>
			{children}
			<div className="flex items-center gap-3">
				<Avatar
					name={authorName}
					path={authorAvatar}
					seed={authorId}
					size={40}
				/>
				<p className="min-w-0 truncate text-subhead font-bold text-fg">
					{authorName}
				</p>
			</div>

			<label className="sr-only" htmlFor={id}>
				{placeholder}
			</label>
			<textarea
				className="mt-3 w-full resize-none break-keep text-body text-fg outline-none placeholder:text-fg-muted"
				data-vaul-no-drag=""
				id={id}
				// 브라우저 쪽 상한은 친절함이다. 진짜 방어는 서버와 DB 제약이 한다 (규칙 9)
				maxLength={maxLength}
				name="content"
				onChange={(event) => onContentChange(event.target.value)}
				placeholder={placeholder}
				readOnly={pending}
				required
				rows={3}
				value={content}
			/>

			{error && (
				<p className="mt-1 text-footnote text-danger" role="alert">
					{error}
				</p>
			)}
		</form>
	);
}
