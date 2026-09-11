import { describe, expect, it } from "vitest";
import { authRedirect } from "./auth-route";

describe("authRedirect", () => {
	it("비로그인은 가입·로그인 화면에 그대로 둔다", () => {
		expect(authRedirect("/login", false)).toBeNull();
		expect(authRedirect("/signup", false)).toBeNull();
	});

	it("비로그인이 그 밖의 화면에 오면 로그인으로 보낸다", () => {
		expect(authRedirect("/", false)).toBe("/login");
		expect(authRedirect("/settings", false)).toBe("/login");
	});

	it("로그인한 사용자는 가입·로그인 화면에서 홈으로 돌려보낸다", () => {
		expect(authRedirect("/login", true)).toBe("/");
		expect(authRedirect("/signup", true)).toBe("/");
	});

	it("로그인한 사용자의 나머지 경로는 건드리지 않는다", () => {
		expect(authRedirect("/", true)).toBeNull();
		expect(authRedirect("/settings", true)).toBeNull();
	});
});
