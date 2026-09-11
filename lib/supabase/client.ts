import { createBrowserClient } from "@supabase/ssr";
import type { Database } from "@/types/database";

/**
 * 클라이언트 컴포넌트용. 읽기는 서버에서 하므로 쓰임새는 좁다 —
 * 로그아웃처럼 브라우저에서 직접 세션을 건드려야 할 때만 쓴다.
 */
export function createClient() {
	return createBrowserClient<Database>(
		process.env.NEXT_PUBLIC_SUPABASE_URL as string,
		process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY as string,
	);
}
