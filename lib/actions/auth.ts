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
		display_name: formData.get("display_name"),
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

/**
 * 로그아웃. 세션 쿠키를 지우고 로그인 화면으로 보낸다.
 *
 * 실패해도 로그인으로 보낸다 — 쿠키가 남아 있으면 미들웨어가 다시 홈으로 돌려보내므로
 * 화면은 일관되고, 여기서 따로 에러를 띄울 자리도 없다.
 */
export async function signOutAction() {
	const supabase = await createClient();
	await supabase.auth.signOut();

	redirect("/login");
}
