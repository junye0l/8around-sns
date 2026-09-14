"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { TextField } from "@/components/ui/TextField";
import { useSubmitAction } from "@/hooks/useSubmitAction";
import { signUpAction } from "@/lib/actions/auth";
import type { SignUpResult } from "@/lib/services/auth";
import { DISPLAY_NAME_MAX } from "@/lib/utils/content-limits";

export function SignUpForm() {
	const [result, formAction, pending] = useSubmitAction<SignUpResult | null>(
		signUpAction,
		null,
	);

	// 칸을 state로 든다. React는 함수 action이 끝나면 폼을 비워서, 한 칸만 틀려도 전부 다시 써야 했다
	const [email, setEmail] = useState("");
	const [displayName, setDisplayName] = useState("");
	const [password, setPassword] = useState("");

	const failed = result && !result.ok ? result : null;
	const errors = failed?.errors ?? {};

	return (
		// noValidate: 브라우저 말풍선 대신 서버가 돌려준 문구를 필드 아래에 깐다
		<form action={formAction} className="flex flex-col gap-4" noValidate>
			<h1 className="mb-4 text-title text-fg">회원가입</h1>

			<TextField
				autoComplete="email"
				readOnly={pending}
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
				readOnly={pending}
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
				readOnly={pending}
				error={errors.password}
				hint="6자 이상, 특수문자도 가능해요"
				label="비밀번호"
				name="password"
				onChange={(event) => setPassword(event.target.value)}
				required
				type="password"
				value={password}
			/>

			{/* 칸 하나에 묶이지 않는 문구는 로그인과 같이 버튼 바로 위에 선다 */}
			{failed?.formError && (
				<p className="px-1 text-body-sm text-danger" role="alert">
					{failed.formError}
				</p>
			)}

			<Button className="h-14 w-full text-body" loading={pending} type="submit">
				{pending ? "회원가입하는 중" : "회원가입하기"}
			</Button>
		</form>
	);
}
