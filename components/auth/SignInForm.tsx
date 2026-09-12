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
	const message = failed?.formError ?? errors.email ?? errors.password;

	return (
		<form action={formAction} className="flex flex-col gap-2">
			<h1 className="mb-2 text-center text-body font-semibold text-fg">
				8around 계정으로 로그인
			</h1>

			<TextField
				// 문구는 아래 한 자리에서만 띄운다. 여기서는 표시만 남긴다
				aria-invalid={errors.email ? true : undefined}
				autoComplete="email"
				disabled={pending}
				label="이메일"
				name="email"
				placeholder="you@example.com"
				required
				type="email"
			/>
			<TextField
				aria-invalid={errors.password ? true : undefined}
				autoComplete="current-password"
				disabled={pending}
				label="비밀번호"
				name="password"
				required
				type="password"
			/>

			{/* 빈 자리를 늘 잡아둬서 문구가 떠도 버튼이 밀리지 않는다. body-sm 한 줄이 21px이라 그리드에서 24px을 쓴다 */}
			<div className="min-h-6">
				{message && (
					<p className="text-body-sm text-danger" role="alert">
						{message}
					</p>
				)}
			</div>

			<Button className="h-14 w-full" loading={pending} type="submit">
				{pending ? "로그인하는 중" : "로그인"}
			</Button>
		</form>
	);
}
