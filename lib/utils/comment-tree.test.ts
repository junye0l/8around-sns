import { describe, expect, it } from "vitest";
import { toCommentTree } from "./comment-tree";

const row = (id: string, parent_id: string | null = null) => ({
	id,
	parent_id,
});

describe("toCommentTree", () => {
	it("답글을 부모 아래로 접는다", () => {
		const tree = toCommentTree([row("a"), row("b"), row("a1", "a")]);

		expect(tree.map((node) => node.id)).toEqual(["a", "b"]);
		expect(tree[0].replies.map((reply) => reply.id)).toEqual(["a1"]);
		expect(tree[1].replies).toEqual([]);
	});

	it("읽어 온 순서를 그대로 쓴다 — 댓글도 답글도 오래된 순이다", () => {
		const tree = toCommentTree([
			row("a"),
			row("a1", "a"),
			row("a2", "a"),
			row("a3", "a"),
		]);

		expect(tree[0].replies.map((reply) => reply.id)).toEqual([
			"a1",
			"a2",
			"a3",
		]);
	});

	it("부모가 목록에 없는 답글은 버린다", () => {
		const tree = toCommentTree([row("a"), row("x1", "없는부모")]);

		expect(tree).toHaveLength(1);
		expect(tree[0].replies).toEqual([]);
	});

	it("빈 목록은 빈 트리다", () => {
		expect(toCommentTree([])).toEqual([]);
	});
});
