import type { AuthError, SupabaseClient } from "@supabase/supabase-js";
import { describe, expect, it } from "vitest";
import type { Database } from "@/types/database";
import { signIn, signUp } from "./auth";

/** signUp 응답과 `profiles` 조회 결과만 흉내 낸다 */
const stub = (options: { code?: string; taken?: boolean }) =>
	({
		auth: {
			signInWithPassword: async () => ({
				error: options.code
					? ({ code: options.code, message: "" } as AuthError)
					: null,
			}),
			signUp: async () => ({
				error: options.code
					? ({ code: options.code, message: "" } as AuthError)
					: null,
			}),
		},
		from: () => ({
			select: () => ({
				ilike: () => ({
					maybeSingle: async () => ({
						data: options.taken ? { id: "stub" } : null,
					}),
				}),
			}),
		}),
	}) as unknown as SupabaseClient<Database>;

const input = {
	email: "a@b.com",
	password: "hunter2",
	display_name: "홍길동",
};

describe("signUp", () => {
	it("잘못된 입력을 필드별로 한 번에 돌려준다", async () => {
		const result = await signUp(stub({}), {
			email: "not-an-email",
			password: "123",
			display_name: "   ",
		});

		expect(result.ok).toBe(false);
		if (result.ok) return;
		expect(result.errors.email).toBeTruthy();
		expect(result.errors.password).toBeTruthy();
		expect(result.errors.display_name).toBeTruthy();
	});

	it("빈 이메일과 틀린 모양의 이메일은 문구가 다르다", async () => {
		const empty = await signUp(stub({}), { ...input, email: "" });
		const wrong = await signUp(stub({}), { ...input, email: "not-an-email" });

		expect(empty.ok || empty.errors.email).toBe("이메일을 입력해 주세요");
		expect(wrong.ok || wrong.errors.email).toBe(
			"이메일 주소를 다시 확인해 주세요",
		);
	});

	it("이메일 중복은 이메일 필드에 붙인다", async () => {
		const result = await signUp(stub({ code: "user_already_exists" }), input);

		expect(result.ok).toBe(false);
		if (result.ok) return;
		expect(result.errors.email).toContain("이미 가입한");
		expect(result.errors.display_name).toBeUndefined();
	});

	it("이유를 모르는 실패는 별명이 이미 있는지 확인해서 판정한다", async () => {
		const taken = await signUp(
			stub({ code: "unexpected_failure", taken: true }),
			input,
		);
		expect(taken.ok).toBe(false);
		if (taken.ok) return;
		expect(taken.errors.display_name).toContain("이미 쓰고 있는");

		const free = await signUp(
			stub({ code: "unexpected_failure", taken: false }),
			input,
		);
		expect(free.ok).toBe(false);
		if (free.ok) return;
		expect(free.errors.display_name).toBeUndefined();
		expect(free.formError).toBeTruthy();
	});

	it("에러가 없으면 성공이다", async () => {
		expect(await signUp(stub({}), input)).toEqual({ ok: true });
	});
});

describe("signIn", () => {
	it("어느 쪽이 틀렸는지 알려주지 않는다", async () => {
		const result = await signIn(stub({ code: "invalid_credentials" }), {
			email: "a@b.com",
			password: "wrong",
		});

		expect(result.ok).toBe(false);
		if (result.ok) return;
		// 필드에 붙이면 가입 여부가 새어 나간다
		expect(result.errors.email).toBeUndefined();
		expect(result.errors.password).toBeUndefined();
		expect(result.formError).toContain("맞지 않아요");
	});

	it("에러가 없으면 성공이다", async () => {
		expect(
			await signIn(stub({}), { email: "a@b.com", password: "hunter2" }),
		).toEqual({ ok: true });
	});
});
