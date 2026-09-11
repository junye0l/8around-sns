import type { PostgrestError, SupabaseClient } from "@supabase/supabase-js";
import { describe, expect, it } from "vitest";
import type { Database } from "@/types/database";
import { setFollow } from "./follow";

const ME = "11111111-1111-4111-8111-111111111111";
const YOU = "22222222-2222-4222-8222-222222222222";

type Call = { op: "insert" | "delete"; row: Record<string, unknown> };

/** `follows` 테이블의 insert · delete만 흉내 내고 무엇이 불렸는지 기록한다 */
const stub = (code?: string) => {
	const calls: Call[] = [];
	const error = code ? ({ code, message: "" } as PostgrestError) : null;

	const client = {
		from: () => ({
			insert: async (row: Record<string, unknown>) => {
				calls.push({ op: "insert", row });
				return { error };
			},
			delete: () => ({
				match: async (row: Record<string, unknown>) => {
					calls.push({ op: "delete", row });
					return { error };
				},
			}),
		}),
	} as unknown as SupabaseClient<Database>;

	return { client, calls };
};

describe("setFollow", () => {
	it("follow는 insert, unfollow는 delete로 간다", async () => {
		const on = stub();
		expect(
			await setFollow(on.client, ME, { targetId: YOU, intent: "follow" }),
		).toEqual({ ok: true });
		expect(on.calls).toEqual([
			{ op: "insert", row: { follower_id: ME, following_id: YOU } },
		]);

		const off = stub();
		expect(
			await setFollow(off.client, ME, { targetId: YOU, intent: "unfollow" }),
		).toEqual({ ok: true });
		expect(off.calls).toEqual([
			{ op: "delete", row: { follower_id: ME, following_id: YOU } },
		]);
	});

	it("이미 팔로우 중이면(23505) 원하던 결과와 같으므로 성공이다", async () => {
		const { client } = stub("23505");

		expect(
			await setFollow(client, ME, { targetId: YOU, intent: "follow" }),
		).toEqual({ ok: true });
	});

	it("그 밖의 DB 실패는 문구로 돌려준다", async () => {
		const { client } = stub("23503");

		const result = await setFollow(client, ME, {
			targetId: YOU,
			intent: "follow",
		});
		expect(result.ok).toBe(false);
	});

	it("uuid가 아닌 상대와 알 수 없는 의도는 DB까지 가지 않는다", async () => {
		const bad = stub();
		expect(
			(await setFollow(bad.client, ME, { targetId: "nope", intent: "follow" }))
				.ok,
		).toBe(false);
		expect(
			(await setFollow(bad.client, ME, { targetId: YOU, intent: "block" })).ok,
		).toBe(false);
		expect(bad.calls).toEqual([]);
	});
});
