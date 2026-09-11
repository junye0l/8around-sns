"use server";

import { redirect } from "next/navigation";
import {
	type SignInResult,
	type SignUpResult,
	signIn,
	signUp,
} from "@/lib/services/auth";
import { createClient } from "@/lib/supabase/server";

/**
 * 가입 진입점. 검증은 services가 다시 한다 — 브라우저 검증은 친절함이지
 * 방어가 아니다(규칙 9). FormData는 신뢰하지 않고 그대로 넘긴다.
 */
export async function signUpAction(
	_prev: SignUpResult | null,
	formData: FormData,
): Promise<SignUpResult> {
	const supabase = await createClient();

	const result = await signUp(supabase, {
		email: formData.get("email"),
		password: formData.get("password"),
		username: formData.get("username"),
	});

	if (!result.ok) return result;

	// 이메일 확인이 꺼져 있어 가입 즉시 세션이 생긴다.
	redirect("/");
}

/** 로그인 진입점. 검증은 services가 다시 한다 (규칙 9) */
export async function signInAction(
	_prev: SignInResult | null,
	formData: FormData,
): Promise<SignInResult> {
	const supabase = await createClient();

	const result = await signIn(supabase, {
		email: formData.get("email"),
		password: formData.get("password"),
	});

	if (!result.ok) return result;

	redirect("/");
}
