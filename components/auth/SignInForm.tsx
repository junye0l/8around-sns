"use client";

import { useActionState } from "react";
import { Button } from "@/components/ui/Button";
import { TextField } from "@/components/ui/TextField";
import { signInAction } from "@/lib/actions/auth";
import type { SignInResult } from "@/lib/services/auth";

export function SignInForm() {
	const [result, formAction, pending] = useActionState<
		SignInResult | null,
		FormData
	>(signInAction, null);

	const failed = result && !result.ok ? result : null;
	const errors = failed?.errors ?? {};

	return (
		<form action={formAction} className="flex flex-col gap-4">
			<h1 className="text-center text-title text-fg">로그인</h1>

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
				autoComplete="current-password"
				disabled={pending}
				error={errors.password}
				label="비밀번호"
				name="password"
				required
				type="password"
			/>

			<Button className="mt-2" loading={pending} type="submit">
				{pending ? "로그인하는 중" : "로그인"}
			</Button>
		</form>
	);
}
