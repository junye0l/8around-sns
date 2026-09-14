import type { SupabaseClient } from "@supabase/supabase-js";
import { describe, expect, it } from "vitest";
import type { Database } from "@/types/database";
import { deleteComment, updateComment } from "./comment";

const COMMENT = "44444444-4444-4444-8444-444444444444";

/**
 * `comments`의 update · delete만 흉내 낸다. `row`가 null이면 RLS가 걸러 0행이 된 상태다.
 * 무엇이 DB까지 갔는지 `calls`로 본다. `lib/services/post.test.ts`와 같은 모양이다.
 */
const stub = (row: { id: string } | null = { id: COMMENT }) => {
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

describe("updateComment", () => {
	it("본문만 다듬어서 넘긴다", async () => {
		const { client, calls } = stub();

		expect(
			await updateComment(client, {
				commentId: COMMENT,
				content: " 고친 댓글 ",
			}),
		).toEqual({ ok: true });
		expect(calls).toEqual([{ content: "고친 댓글" }]);
	});

	it("빈 본문, 긴 본문, 이상한 id는 DB까지 가지 않는다", async () => {
		for (const input of [
			{ commentId: COMMENT, content: "   " },
			{ commentId: COMMENT, content: "가".repeat(1001) },
			{ commentId: "없음", content: "댓글" },
		]) {
			const { client, calls } = stub();
			expect((await updateComment(client, input)).ok).toBe(false);
			expect(calls).toEqual([]);
		}
	});

	it("RLS가 걸러 0행이면 실패로 돌려준다", async () => {
		const { client } = stub(null);

		expect(
			await updateComment(client, { commentId: COMMENT, content: "댓글" }),
		).toEqual({ ok: false, error: "내가 쓴 댓글만 고칠 수 있어요" });
	});
});

describe("deleteComment", () => {
	it("id를 그대로 넘긴다", async () => {
		const { client, calls } = stub();

		expect(await deleteComment(client, COMMENT)).toEqual({ ok: true });
		expect(calls).toEqual([COMMENT]);
	});

	it("RLS가 걸러 0행이면 실패로 돌려준다", async () => {
		const { client } = stub(null);

		expect(await deleteComment(client, COMMENT)).toEqual({
			ok: false,
			error: "내가 쓴 댓글만 지울 수 있어요",
		});
	});
});
