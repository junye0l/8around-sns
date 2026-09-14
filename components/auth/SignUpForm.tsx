"use client";

import { useEffect, useRef, useState } from "react";
import { FormError } from "@/components/auth/FormError";
import { Button } from "@/components/ui/Button";
import { TextField } from "@/components/ui/TextField";
import { useSubmitAction } from "@/hooks/useSubmitAction";
import { signUpAction } from "@/lib/actions/auth";
import type { SignUpResult } from "@/lib/services/auth";
import { DISPLAY_NAME_MAX } from "@/lib/utils/content-limits";

/**
 * 회원가입 폼. 동작은 `SignInForm`과 같다.
 * @see components/auth/SignInForm.tsx
 */
export function SignUpForm() {
	const [result, formAction, pending] = useSubmitAction<SignUpResult | null>(
		signUpAction,
		null,
	);

	// 칸을 state로 든다. React는 함수 action이 끝나면 폼을 비워서, 한 칸만 틀려도 전부 다시 써야 했다
	const [email, setEmail] = useState("");
	const [displayName, setDisplayName] = useState("");
	const [password, setPassword] = useState("");
	// 비밀번호는 공백도 글자다. 이메일과 별명만 공백뿐이면 빈 칸으로 친다
	const filled =
		email.trim() !== "" && displayName.trim() !== "" && password !== "";

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
					autoComplete="nickname"
					disabled={pending}
					error={errors.display_name}
					hint={`${DISPLAY_NAME_MAX}자까지 가능해요`}
					label="별명"
					maxLength={DISPLAY_NAME_MAX}
					name="display_name"
					onChange={(event) => setDisplayName(event.target.value)}
					required
					value={displayName}
				/>
				<TextField
					autoComplete="new-password"
					disabled={pending}
					error={errors.password}
					hint="6자 이상, 특수문자도 가능해요"
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
					{pending ? "회원가입하는 중" : "회원가입하기"}
				</Button>
			</div>
		</form>
	);
}
