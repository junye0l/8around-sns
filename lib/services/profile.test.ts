import type { SupabaseClient } from "@supabase/supabase-js";
import { describe, expect, it } from "vitest";
import { AVATAR_MAX_BYTES } from "@/lib/utils/content-limits";
import type { Database } from "@/types/database";
import { updateProfile } from "./profile";

const USER = "11111111-1111-4111-8111-111111111111";

/** 무엇이 DB와 Storage까지 갔는지 `calls`로 본다. 검증에서 걸렸으면 비어 있어야 한다 */
const stub = () => {
	const calls: unknown[] = [];
	const client = {
		from: () => ({
			update: (patch: unknown) => {
				calls.push(patch);
				return { eq: async () => ({ error: null }) };
			},
			select: () => ({
				eq: () => ({
					maybeSingle: async () => ({ data: { avatar_path: null } }),
				}),
			}),
		}),
		storage: {
			from: () => ({
				upload: async (path: string) => {
					calls.push(path);
					return { error: null };
				},
				remove: async () => ({ error: null }),
			}),
		},
	} as unknown as SupabaseClient<Database>;
	return { client, calls };
};

describe("updateProfile", () => {
	it("이미지 없이 이름과 소개를 다듬어서 저장한다", async () => {
		const { client, calls } = stub();
		expect(
			await updateProfile(client, USER, {
				displayName: "  새 이름 ",
				bio: " 러닝하는 개발자\n",
				avatar: new File([], ""),
			}),
		).toEqual({ ok: true });
		expect(calls).toEqual([
			{ display_name: "새 이름", bio: "러닝하는 개발자" },
		]);
	});

	it("폼이 실은 \\r\\n 줄바꿈을 한 글자로 세고 \\n으로 저장한다", async () => {
		const { client, calls } = stub();
		const bio = `${"가".repeat(79)}\r\n${"나".repeat(80)}`;
		expect(
			await updateProfile(client, USER, {
				displayName: "이름",
				bio,
				avatar: null,
			}),
		).toEqual({ ok: true });
		expect(calls).toEqual([
			{ display_name: "이름", bio: `${"가".repeat(79)}\n${"나".repeat(80)}` },
		]);
	});

	it("공백뿐인 소개는 null로 지운다", async () => {
		const { client, calls } = stub();
		await updateProfile(client, USER, {
			displayName: "이름",
			bio: "   ",
			avatar: null,
		});
		expect(calls).toEqual([{ display_name: "이름", bio: null }]);
	});

	it("이미지를 자기 폴더에 올리고 그 경로를 저장한다", async () => {
		const { client, calls } = stub();
		const avatar = new Blob(["x"], { type: "image/webp" });
		expect(
			await updateProfile(client, USER, {
				displayName: "이름",
				bio: "",
				avatar,
			}),
		).toEqual({ ok: true });
		expect(calls[0]).toMatch(new RegExp(`^${USER}/[0-9a-f-]{36}\\.webp$`));
		expect(calls[1]).toEqual({
			display_name: "이름",
			bio: null,
			avatar_path: calls[0],
		});
	});

	it("빈 이름, 긴 이름, 긴 소개, 다른 형식, 큰 파일은 DB까지 가지 않는다", async () => {
		const cases = [
			[{ displayName: "   ", bio: null, avatar: null }, "display_name"],
			[
				{ displayName: "가".repeat(31), bio: null, avatar: null },
				"display_name",
			],
			[{ displayName: "이름", bio: "가".repeat(161), avatar: null }, "bio"],
			[
				{
					displayName: "이름",
					bio: null,
					avatar: new Blob(["x"], { type: "text/plain" }),
				},
				"avatar",
			],
			[
				{
					displayName: "이름",
					bio: null,
					avatar: new Blob([new Uint8Array(AVATAR_MAX_BYTES + 1)], {
						type: "image/png",
					}),
				},
				"avatar",
			],
		] as const;

		for (const [input, field] of cases) {
			const { client, calls } = stub();
			const result = await updateProfile(client, USER, input);
			expect(result).toMatchObject({ ok: false, field });
			expect(calls).toEqual([]);
		}
	});

	it("다른 사람과 겹치는 별명은 별명 칸 에러로 돌려준다", async () => {
		const client = {
			from: () => ({
				update: () => ({ eq: async () => ({ error: { code: "23505" } }) }),
			}),
		} as unknown as SupabaseClient<Database>;

		const result = await updateProfile(client, USER, {
			displayName: "minsu",
			bio: null,
			avatar: null,
		});

		expect(result).toMatchObject({ ok: false, field: "display_name" });
	});
});
