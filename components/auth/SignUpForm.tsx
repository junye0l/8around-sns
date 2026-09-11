"use client";

import { useActionState } from "react";
import { Button } from "@/components/ui/Button";
import { TextField } from "@/components/ui/TextField";
import { signUpAction } from "@/lib/actions/auth";
import type { SignUpResult } from "@/lib/services/auth";

export function SignUpForm() {
	const [result, formAction, pending] = useActionState<
		SignUpResult | null,
		FormData
	>(signUpAction, null);

	const failed = result && !result.ok ? result : null;
	const errors = failed?.errors ?? {};

	return (
		<form action={formAction} className="flex flex-col gap-4">
			<h1 className="text-center text-title text-fg">가입하기</h1>

			{failed?.formError && (
				<p className="text-body-sm text-danger-strong" role="alert">
					{failed.formError}
				</p>
			)}

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
				autoComplete="username"
				disabled={pending}
				error={errors.username}
				hint="영문 소문자, 숫자, 밑줄로 3~20자"
				label="별명"
				name="username"
				placeholder="hong_gil_dong"
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

			<Button className="mt-2" loading={pending} type="submit">
				{pending ? "가입하는 중" : "가입하기"}
			</Button>
		</form>
	);
}
