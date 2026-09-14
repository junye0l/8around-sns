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
		// noValidate: 브라우저 말풍선 대신 서버가 돌려준 문구를 아래 자리에 띄운다
		<form action={formAction} className="flex flex-col gap-4" noValidate>
			<h1 className="mb-4 text-title text-fg">로그인</h1>

			<TextField
				// 문구는 아래 한 자리에서만 띄운다. 여기서는 빨간 테두리만 켠다
				aria-invalid={errors.email ? true : undefined}
				autoComplete="email"
				disabled={pending}
				label="이메일"
				name="email"
				placeholder="you@example.com"
				required
				type="email"
			/>
			{/* 문구 자리를 비밀번호 칸에 붙인다. 가입 폼의 안내 줄과 같은 간격(gap-1, px-1)이다 */}
			<div className="flex flex-col gap-1">
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
						<p className="px-1 text-body-sm text-danger" role="alert">
							{message}
						</p>
					)}
				</div>
			</div>

			<Button className="h-14 w-full text-body" loading={pending} type="submit">
				{pending ? "로그인하는 중" : "로그인"}
			</Button>
		</form>
	);
}
