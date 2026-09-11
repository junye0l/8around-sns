import { createServerClient } from "@supabase/ssr";
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import type { Database } from "@/types/database";

/**
 * 세션 갱신. 서버 컴포넌트는 쿠키를 쓸 수 없으므로 토큰 갱신은 여기서만 일어난다.
 * 이 함수가 없으면 토큰 만료 후 조용히 로그아웃된다.
 */
export async function updateSession(request: NextRequest) {
	let response = NextResponse.next({ request });

	const supabase = createServerClient<Database>(
		process.env.NEXT_PUBLIC_SUPABASE_URL as string,
		process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY as string,
		{
			cookies: {
				getAll() {
					return request.cookies.getAll();
				},
				setAll(cookiesToSet, headers) {
					for (const { name, value } of cookiesToSet) {
						request.cookies.set(name, value);
					}
					response = NextResponse.next({ request });
					for (const { name, value, options } of cookiesToSet) {
						response.cookies.set(name, value, options);
					}
					// 인증 쿠키가 실린 응답은 CDN이 캐시하면 안 된다.
					// 라이브러리가 넘겨주는 no-store 헤더를 그대로 붙인다.
					for (const [key, headerValue] of Object.entries(headers)) {
						response.headers.set(key, headerValue);
					}
				},
			},
		},
	);

	// 응답이 만들어지기 전에 호출해야 갱신된 세션이 쿠키에 실린다.
	await supabase.auth.getUser();

	return response;
}
