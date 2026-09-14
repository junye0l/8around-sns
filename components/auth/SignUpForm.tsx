"use client";

import { useActionState } from "react";
import { Button } from "@/components/ui/Button";
import { TextField } from "@/components/ui/TextField";
import { signUpAction } from "@/lib/actions/auth";
import type { SignUpResult } from "@/lib/services/auth";
import { DISPLAY_NAME_MAX } from "@/lib/utils/content-limits";

export function SignUpForm() {
	const [result, formAction, pending] = useActionState<
		SignUpResult | null,
		FormData
	>(signUpAction, null);

	const failed = result && !result.ok ? result : null;
	const errors = failed?.errors ?? {};

	return (
		// noValidate: 브라우저 말풍선 대신 서버가 돌려준 문구를 필드 아래에 깐다
		<form action={formAction} className="flex flex-col gap-4" noValidate>
			<h1 className="mb-4 text-title text-fg">가입</h1>

			<TextField
				autoComplete="email"
				disabled={pending}
				error={errors.email}
				label="이메일"
				name="email"
				placeholder="you@example.com"
				required
				type="email"
			/>
			<TextField
				autoComplete="nickname"
				disabled={pending}
				error={errors.display_name}
				hint={`${DISPLAY_NAME_MAX}자까지, 다른 사람과 겹치지 않게`}
				label="별명"
				maxLength={DISPLAY_NAME_MAX}
				name="display_name"
				required
			/>
			<TextField
				autoComplete="new-password"
				disabled={pending}
				error={errors.password}
				hint="6자 이상"
				label="비밀번호"
				name="password"
				required
				type="password"
			/>

			{/* 칸 하나에 묶이지 않는 문구는 로그인과 같이 버튼 바로 위에 선다 */}
			{failed?.formError && (
				<p className="px-1 text-body-sm text-danger" role="alert">
					{failed.formError}
				</p>
			)}

			<Button className="h-14 w-full text-body" loading={pending} type="submit">
				{pending ? "가입하는 중" : "가입하기"}
			</Button>
		</form>
	);
}
