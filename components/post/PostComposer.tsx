"use client";

import { useActionState, useEffect, useId, useState } from "react";
import { Avatar } from "@/components/ui/Avatar";
import { Button } from "@/components/ui/Button";
import { createPostAction } from "@/lib/actions/post";
import type { CreatePostResult } from "@/lib/services/post";
import { POST_CONTENT_MAX } from "@/lib/utils/post-content";

/**
 * 글 입력칸. 아바타 · 입력 · 버튼이 한 줄로 서고, 손대면 아래로 열린다.
 * 접힌 동안 카운터와 에러 자리를 비워두면 피드 첫 칸이 그만큼 조용해진다.
 *
 * textarea를 제어 컴포넌트로 두는 이유가 있다. React 19는 함수 action이 끝나면
 * 폼을 자동으로 비우는데, 그러면 저장에 실패했을 때 쓰던 글까지 같이 날아간다.
 * 값을 state로 들고 있으면 실패한 화면에 글이 남고, 성공했을 때만 비운다.
 *
 * ponytail: 댓글 입력이 생기면 겹치는 껍데기를 `components/ui/Composer`로 올린다.
 * 지금 미리 나누면 쓰는 곳이 하나뿐인 추상이 된다.
 */
export function PostComposer({ authorName }: { authorName: string }) {
	const [result, formAction, pending] = useActionState<
		CreatePostResult | null,
		FormData
	>(createPostAction, null);
	const [content, setContent] = useState("");
	const [opened, setOpened] = useState(false);
	const id = useId();

	// 성공했을 때만 비운다. result는 액션이 끝날 때마다 새 객체라 이걸로 구분된다
	useEffect(() => {
		if (result?.ok) setContent("");
	}, [result]);

	const error = result && !result.ok ? result.error : null;
	// 포커스가 빠져도 쓰던 글이 있으면 닫지 않는다. 닫으면 쓴 내용이 가려진다
	const expanded = opened || content.length > 0;

	return (
		<form
			action={formAction}
			className="flex gap-3 border-hairline border-b p-4"
		>
			<Avatar name={authorName} />

			<div className="min-w-0 flex-1">
				<label className="sr-only" htmlFor={id}>
					무슨 생각을 하고 있나요
				</label>
				<div className="flex items-start gap-4">
					<textarea
						className="min-w-0 flex-1 resize-none py-2 text-body text-fg outline-none placeholder:text-fg-muted"
						disabled={pending}
						id={id}
						// 브라우저 쪽 상한은 친절함이다. 진짜 방어는 서버와 DB 제약이 한다 (규칙 9)
						maxLength={POST_CONTENT_MAX}
						name="content"
						onBlur={() => setOpened(false)}
						onChange={(event) => setContent(event.target.value)}
						onFocus={() => setOpened(true)}
						placeholder="무슨 생각을 하고 있나요?"
						required
						rows={expanded ? 3 : 1}
						value={content}
					/>
					<Button
						className="shrink-0"
						disabled={content.trim().length === 0}
						loading={pending}
						type="submit"
					>
						{pending ? "올리는 중" : "올리기"}
					</Button>
				</div>

				{error && (
					<p className="mt-2 text-body-sm text-danger-strong" role="alert">
						{error}
					</p>
				)}

				{expanded && (
					<p className="mt-1 text-right text-body-sm text-fg-muted">
						{content.length} / {POST_CONTENT_MAX}
					</p>
				)}
			</div>
		</form>
	);
}
