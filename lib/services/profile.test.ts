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
	it("이미지 없이 이름만 다듬어서 저장한다", async () => {
		const { client, calls } = stub();
		expect(
			await updateProfile(client, USER, {
				displayName: "  새 이름 ",
				avatar: new File([], ""),
			}),
		).toEqual({ ok: true });
		expect(calls).toEqual([{ display_name: "새 이름" }]);
	});

	it("이미지를 자기 폴더에 올리고 그 경로를 저장한다", async () => {
		const { client, calls } = stub();
		const avatar = new Blob(["x"], { type: "image/webp" });
		expect(
			await updateProfile(client, USER, { displayName: "이름", avatar }),
		).toEqual({ ok: true });
		expect(calls[0]).toMatch(new RegExp(`^${USER}/[0-9a-f-]{36}\\.webp$`));
		expect(calls[1]).toEqual({ display_name: "이름", avatar_path: calls[0] });
	});

	it("빈 이름, 긴 이름, 다른 형식, 큰 파일은 DB까지 가지 않는다", async () => {
		const cases = [
			[{ displayName: "   ", avatar: null }, "display_name"],
			[{ displayName: "가".repeat(31), avatar: null }, "display_name"],
			[
				{
					displayName: "이름",
					avatar: new Blob(["x"], { type: "text/plain" }),
				},
				"avatar",
			],
			[
				{
					displayName: "이름",
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
});
