import { fileURLToPath } from "node:url";
import { defineConfig } from "vitest/config";

export default defineConfig({
	resolve: {
		// tsconfig.json:21-23 의 "@/*" 를 vitest에도 그대로 적용한다.
		// 없으면 테스트에서만 `@/` import가 깨진다.
		alias: { "@": fileURLToPath(new URL(".", import.meta.url)) },
	},
});
