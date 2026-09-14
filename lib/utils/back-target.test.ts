import { describe, expect, it } from "vitest";
import { backTarget, commentHref, postHref } from "@/lib/utils/back-target";

const ID = "8dc59883-2484-404d-bc1b-e328dfec2386";

describe("backTarget", () => {
	it("피드 세 화면은 제 이름으로 돌아간다", () => {
		expect(backTarget("/")).toEqual({ href: "/", label: "전체" });
		expect(backTarget("/following")).toEqual({
			href: "/following",
			label: "팔로잉",
		});
		expect(backTarget("/likes")).toEqual({ href: "/likes", label: "좋아요" });
	});

	it("프로필은 그 사람의 주소로 돌아간다", () => {
		expect(backTarget(`/u/${ID}`)).toEqual({
			href: `/u/${ID}`,
			label: "프로필",
		});
	});

	it("모르는 값은 전체로 돌아간다", () => {
		for (const from of [
			undefined,
			"",
			"https://evil.example",
			"//evil.example",
			`/u/${ID}/followers`,
			"/u/not-a-uuid",
			"toString",
			["/", "/likes"],
		]) {
			expect(backTarget(from)).toEqual({ href: "/", label: "전체" });
		}
	});
});

describe("postHref", () => {
	it("온 화면을 인코딩해 싣고, 없으면 싣지 않는다", () => {
		expect(postHref(ID, "/following")).toBe(`/post/${ID}?from=%2Ffollowing`);
		expect(postHref(ID)).toBe(`/post/${ID}`);
	});
});

describe("commentHref", () => {
	it("게시글 → 댓글 → 게시글로 돌아와도 처음 온 화면이 남는다", () => {
		const from = backTarget("/likes").href;
		const comment = commentHref(ID, from);
		expect(comment).toBe(`/comment/${ID}?from=%2Flikes`);
		const back =
			new URL(comment, "http://x").searchParams.get("from") ?? undefined;
		expect(backTarget(back)).toEqual({ href: "/likes", label: "좋아요" });
		expect(postHref(ID, backTarget(back).href)).toBe(
			`/post/${ID}?from=%2Flikes`,
		);
	});
});
