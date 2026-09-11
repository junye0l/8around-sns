import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import type { Database } from "@/types/database";

/**
 * 서버 컴포넌트 · Server Action용 클라이언트.
 * 요청마다 새로 만든다. 절대 모듈 스코프에 캐싱하지 않는다 — 요청 간 세션이 섞인다.
 */
export async function createClient() {
	const cookieStore = await cookies();

	return createServerClient<Database>(
		process.env.NEXT_PUBLIC_SUPABASE_URL as string,
		process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY as string,
		{
			cookies: {
				getAll() {
					return cookieStore.getAll();
				},
				setAll(cookiesToSet) {
					try {
						for (const { name, value, options } of cookiesToSet) {
							cookieStore.set(name, value, options);
						}
					} catch {
						// 서버 컴포넌트에서는 쿠키를 쓸 수 없다.
						// 세션 갱신은 middleware가 처리하므로 여기서는 무시해도 된다.
					}
				},
			},
		},
	);
}
