import type { AuthError, SupabaseClient } from "@supabase/supabase-js";
import { z } from "zod";
import { isDisplayNameTaken } from "@/lib/queries/profile";
import {
	DISPLAY_NAME_TAKEN,
	displayNameSchema,
} from "@/lib/utils/display-name";
import type { Database } from "@/types/database";

// 비었을 때와 모양이 틀렸을 때 문구를 나눈다. 빈 칸에 "다시 확인"은 무엇을 확인할지 모른다
const emailSchema = z
	.string("이메일을 입력해 주세요")
	.min(1, "이메일을 입력해 주세요")
	.pipe(z.email("이메일 주소를 다시 확인해 주세요"));

export const signUpSchema = z.object({
	email: emailSchema,
	// supabase/config.toml:181 minimum_password_length = 6
	password: z.string().min(6, "비밀번호는 6자 이상으로 만들어 주세요"),
	display_name: displayNameSchema,
});

export const signInSchema = z.object({
	email: emailSchema,
	password: z.string().min(1, "비밀번호를 입력해 주세요"),
});

export type SignUpField = keyof z.infer<typeof signUpSchema>;
export type SignUpErrors = Partial<Record<SignUpField, string>>;

export type SignInField = keyof z.infer<typeof signInSchema>;
export type SignInErrors = Partial<Record<SignInField, string>>;

export type SignInResult =
	| { ok: true }
	| { ok: false; errors: SignInErrors; formError?: string };

export type SignUpResult =
	| { ok: true }
	/** errors는 필드 옆에, formError는 폼 위에 띄운다 */
	| { ok: false; errors: SignUpErrors; formError?: string };

/**
 * signUp이 내려주는 `error.code`를 사용자 문구로 옮긴다.
 * 코드 이름의 출처는 `node_modules/@supabase/auth-js/dist/module/lib/error-codes.d.ts:6`의
 * `ErrorCode` 유니온이다. 에러 메시지 문자열은 보지 않는다 — 문구는 언제든 바뀐다.
 *
 * 이메일 중복이 `user_already_exists`로 오는지 `email_exists`로 오는지는
 * 실제로 찍어보기 전까지 모른다. 둘 다 사용자에게는 같은 뜻이라 함께 받는다.
 */
function fromAuthCode(error: AuthError): SignUpResult | null {
	switch (error.code) {
		case "user_already_exists":
		case "email_exists":
			return {
				ok: false,
				errors: { email: "이미 가입한 이메일이에요. 로그인해 주세요" },
			};
		case "email_address_invalid":
			return {
				ok: false,
				errors: { email: "이메일 주소를 다시 확인해 주세요" },
			};
		// 내장 메일러는 팀 멤버 주소로만 보낸다. 이메일 확인이 켜져 있으면
		// 확인 메일을 보내려다 여기로 떨어진다 — 주소가 아니라 설정 문제다
		case "email_address_not_authorized":
			return {
				ok: false,
				errors: {},
				formError: "지금은 이 주소로 가입 메일을 보낼 수 없어요",
			};
		case "weak_password":
			return {
				ok: false,
				errors: { password: "비밀번호가 너무 쉬워요. 다른 걸로 해주세요" },
			};
		case "over_request_rate_limit":
		case "over_email_send_rate_limit":
			return {
				ok: false,
				errors: {},
				formError: "시도가 너무 잦아요. 잠시 뒤에 다시 해주세요",
			};
		case "signup_disabled":
			return {
				ok: false,
				errors: {},
				formError: "지금은 가입을 받고 있지 않아요",
			};
		default:
			return null;
	}
}

/**
 * 가입. `profiles`에 직접 쓰지 않는다 — `on_auth_user_created` 트리거가
 * 같은 트랜잭션에서 만든다(0001_init.sql:49-51). 여기서 또 쓰면 중복이다.
 *
 * 별명은 메타데이터의 `display_name`으로 넘기고 트리거가 `profiles`에 옮긴다(0001_init.sql:40-43). 결정 0032.
 */
export async function signUp(
	supabase: SupabaseClient<Database>,
	input: unknown,
): Promise<SignUpResult> {
	const parsed = signUpSchema.safeParse(input);
	if (!parsed.success) {
		// 필드별로 한 번에 돌려준다. 하나씩 고치게 만들면 왕복이 늘어난다
		const fieldErrors = z.flattenError(parsed.error).fieldErrors;
		return {
			ok: false,
			errors: {
				email: fieldErrors.email?.[0],
				display_name: fieldErrors.display_name?.[0],
				password: fieldErrors.password?.[0],
			},
		};
	}

	const { email, password, display_name } = parsed.data;
	const { error } = await supabase.auth.signUp({
		email,
		password,
		options: { data: { display_name } },
	});

	if (!error) return { ok: true };

	const mapped = fromAuthCode(error);
	if (mapped) return mapped;

	// 별명이 겹치면 트리거가 터지면서 가입 전체가 롤백되는데, 그때 돌아오는 건
	// `unexpected_failure`라 무엇이 깨졌는지 알려주지 않는다. 짐작하지 말고
	// 실제 상태를 한 번 확인해서 판정한다.
	if (await isDisplayNameTaken(supabase, display_name)) {
		return {
			ok: false,
			errors: { display_name: DISPLAY_NAME_TAKEN },
		};
	}

	return {
		ok: false,
		errors: {},
		formError: "가입하지 못했어요. 잠시 뒤에 다시 시도해 주세요",
	};
}

/**
 * 로그인. `signInWithPassword`는 이메일·전화번호만 받는다
 * (`auth-js` `PasswordCredentialsBase`) — 별명으로는 로그인할 수 없다.
 */
export async function signIn(
	supabase: SupabaseClient<Database>,
	input: unknown,
): Promise<SignInResult> {
	const parsed = signInSchema.safeParse(input);
	if (!parsed.success) {
		const fieldErrors = z.flattenError(parsed.error).fieldErrors;
		return {
			ok: false,
			errors: {
				email: fieldErrors.email?.[0],
				password: fieldErrors.password?.[0],
			},
		};
	}

	const { error } = await supabase.auth.signInWithPassword(parsed.data);
	if (!error) return { ok: true };

	switch (error.code) {
		// 어느 쪽이 틀렸는지 알려주지 않는다. 알려주면 가입 여부가 새어 나간다
		case "invalid_credentials":
			return {
				ok: false,
				errors: {},
				formError: "이메일 또는 비밀번호가 맞지 않아요",
			};
		case "email_not_confirmed":
			return {
				ok: false,
				errors: {},
				formError: "메일함에서 인증 링크를 먼저 눌러 주세요",
			};
		case "over_request_rate_limit":
			return {
				ok: false,
				errors: {},
				formError: "시도가 너무 잦아요. 잠시 뒤에 다시 해주세요",
			};
		default:
			return {
				ok: false,
				errors: {},
				formError: "로그인하지 못했어요. 잠시 뒤에 다시 시도해 주세요",
			};
	}
}
