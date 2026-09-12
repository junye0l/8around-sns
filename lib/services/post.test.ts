import type { SupabaseClient } from "@supabase/supabase-js";
import { describe, expect, it } from "vitest";
import type { Database } from "@/types/database";
import { deletePost, updatePost } from "./post";

const POST = "33333333-3333-4333-8333-333333333333";

/**
 * `posts`의 update · delete만 흉내 낸다. `row`가 null이면 RLS가 걸러 0행이 된 상태다.
 * 무엇이 DB까지 갔는지 `calls`로 본다 — 검증에서 걸렸으면 비어 있어야 한다.
 */
const stub = (row: { id: string } | null = { id: POST }) => {
	const calls: unknown[] = [];
	const result = { data: row, error: null };

	const client = {
		from: () => ({
			update: (patch: Record<string, unknown>) => {
				calls.push(patch);
				return {
					eq: () => ({ select: () => ({ maybeSingle: async () => result }) }),
				};
			},
			delete: () => ({
				eq: (_col: string, id: string) => {
					calls.push(id);
					return { select: () => ({ maybeSingle: async () => result }) };
				},
			}),
		}),
	} as unknown as SupabaseClient<Database>;

	return { client, calls };
};

describe("updatePost", () => {
	it("본문을 다듬어서 넘긴다", async () => {
		const { client, calls } = stub();

		expect(
			await updatePost(client, { postId: POST, content: "  고친 글 " }),
		).toEqual({ ok: true });
		expect(calls).toEqual([{ content: "고친 글" }]);
	});

	it("빈 본문과 이상한 id는 DB까지 가지 않는다", async () => {
		const empty = stub();
		expect(
			await updatePost(empty.client, { postId: POST, content: "   " }),
		).toEqual({ ok: false, error: "내용을 입력해 주세요" });
		expect(empty.calls).toEqual([]);

		const bad = stub();
		expect(
			await updatePost(bad.client, { postId: "없음", content: "글" }),
		).toEqual({ ok: false, error: "사라진 글이에요" });
		expect(bad.calls).toEqual([]);
	});

	it("RLS가 걸러 0행이면 실패로 돌려준다", async () => {
		const { client } = stub(null);

		expect(await updatePost(client, { postId: POST, content: "글" })).toEqual({
			ok: false,
			error: "내가 쓴 글만 고칠 수 있어요",
		});
	});
});

describe("deletePost", () => {
	it("id를 그대로 넘긴다", async () => {
		const { client, calls } = stub();

		expect(await deletePost(client, POST)).toEqual({ ok: true });
		expect(calls).toEqual([POST]);
	});

	it("RLS가 걸러 0행이면 실패로 돌려준다", async () => {
		const { client } = stub(null);

		expect(await deletePost(client, POST)).toEqual({
			ok: false,
			error: "내가 쓴 글만 지울 수 있어요",
		});
	});
});
