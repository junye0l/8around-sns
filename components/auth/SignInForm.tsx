"use client";

import { useEffect, useRef, useState } from "react";
import { FormError } from "@/components/auth/FormError";
import { Button } from "@/components/ui/Button";
import { TextField } from "@/components/ui/TextField";
import { useSubmitAction } from "@/hooks/useSubmitAction";
import { signInAction } from "@/lib/actions/auth";
import type { SignInResult } from "@/lib/services/auth";

/**
 * 로그인 폼. 칸이 다 차기 전까지 버튼이 꺼져 있고, 보내는 중에는 칸도 꺼진다.
 * 칸 에러는 칸 아래에, 칸에 묶이지 않는 에러는 버튼 위에 선다. 제출 뒤 첫 에러 칸으로 포커스가 간다.
 * @see docs/DESIGN.md 로그인, 회원가입
 */
export function SignInForm() {
	const [result, formAction, pending] = useSubmitAction<SignInResult | null>(
		signInAction,
		null,
	);

	// 칸을 state로 든다. React는 함수 action이 끝나면 폼을 비워서, 비밀번호 하나 틀려도 이메일까지 다시 써야 했다
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	// 비밀번호는 공백도 글자다. 이메일만 공백뿐이면 빈 칸으로 친다
	const filled = email.trim() !== "" && password !== "";

	const failed = result && !result.ok ? result : null;
	const errors = failed?.errors ?? {};

	const form = useRef<HTMLFormElement>(null);
	useEffect(() => {
		if (!result) return;
		form.current?.querySelector<HTMLElement>("[aria-invalid]")?.focus();
	}, [result]);

	return (
		// noValidate: 브라우저 말풍선 대신 서버가 돌려준 문구를 칸 아래에 띄운다
		<form action={formAction} noValidate ref={form}>
			<div className="flex flex-col gap-3">
				<TextField
					autoComplete="email"
					disabled={pending}
					error={errors.email}
					label="이메일"
					name="email"
					onChange={(event) => setEmail(event.target.value)}
					placeholder="you@example.com"
					required
					type="email"
					value={email}
				/>
				<TextField
					autoComplete="current-password"
					disabled={pending}
					error={errors.password}
					label="비밀번호"
					name="password"
					onChange={(event) => setPassword(event.target.value)}
					required
					type="password"
					value={password}
				/>
			</div>

			<div className="mt-2 flex flex-col gap-2">
				<FormError message={failed?.formError} />
				<Button disabled={!filled} loading={pending} size="lg" type="submit">
					{pending ? "로그인하는 중" : "로그인"}
				</Button>
			</div>
		</form>
	);
}
