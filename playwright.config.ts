import { defineConfig, devices } from "@playwright/test";

/**
 * 심사 시나리오 E2E. 떠 있는 서버에 붙기만 하고 서버를 띄우지 않는다 (AGENTS.md 규칙 7).
 * 파일 이름을 `*.e2e.ts`로 두어 Vitest의 기본 `*.test.ts`, `*.spec.ts`와 겹치지 않게 한다.
 * @see docs/decisions/0048-e2e-against-remote-db.md
 */
export default defineConfig({
	testDir: "e2e",
	testMatch: "*.e2e.ts",
	// 개발 서버가 화면을 처음 컴파일하는 시간까지 기다린다
	timeout: 120_000,
	expect: { timeout: 15_000 },
	retries: 0,
	workers: 1,
	reporter: "list",
	use: {
		baseURL: process.env.E2E_BASE_URL ?? "http://localhost:3000",
		...devices["Desktop Chrome"],
		viewport: { width: 1280, height: 900 },
		// 한 동작이 테스트 전체 시간을 다 쓰면 브라우저가 닫혀 정리 단계가 돌지 못한다
		actionTimeout: 15_000,
		navigationTimeout: 30_000,
		trace: "retain-on-failure",
	},
});
