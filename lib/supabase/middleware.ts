import { createServerClient } from "@supabase/ssr";
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { authRedirect } from "@/lib/utils/auth-route";
import type { Database } from "@/types/database";

/**
 * 세션 갱신. 서버 컴포넌트는 쿠키를 쓸 수 없으므로 토큰 갱신은 여기서만 일어난다.
 * 이 함수가 없으면 토큰 만료 후 조용히 로그아웃된다.
 *
 * 세션을 확인하는 김에 접근도 가른다. 갱신 때문에 어차피 부르는 getUser라
 * 리다이렉트를 붙이는 데 추가 쿼리가 들지 않는다.
 *
 * 어디로 보낼지는 `lib/utils/auth-route.ts`가 정한다 — 여기 두면 테스트가 안 붙는다.
 */
export async function updateSession(request: NextRequest) {
	let response = NextResponse.next({ request });
	// 어떤 응답을 돌려주든 같이 실려야 한다. 아래 setAll이 채운다
	let authHeaders: Record<string, string> = {};

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
					authHeaders = headers;
					for (const [key, headerValue] of Object.entries(headers)) {
						response.headers.set(key, headerValue);
					}
				},
			},
		},
	);

	// 응답이 만들어지기 전에 호출해야 갱신된 세션이 쿠키에 실린다.
	const {
		data: { user },
	} = await supabase.auth.getUser();

	const destination = authRedirect(request.nextUrl.pathname, user !== null);
	if (!destination) return response;

	const url = request.nextUrl.clone();
	url.pathname = destination;
	const redirect = NextResponse.redirect(url);

	// 어디로 보낼지는 세션에 달렸다. 캐시되면 로그인한 사람이 /login으로 계속 튕긴다.
	// 아래 authHeaders는 세션 쿠키를 실제로 쓸 때만 채워지므로 그것만 믿을 수 없다 —
	// 비로그인 요청은 쿠키를 쓸 일이 없어 헤더가 빈 채로 나간다
	redirect.headers.set("Cache-Control", "no-store, must-revalidate");

	// 새 응답이라 갱신된 세션 쿠키도 물려받지 못한다.
	// 옮기지 않으면 갱신한 토큰이 버려지고 다음 요청에서 다시 갱신한다.
	for (const cookie of response.cookies.getAll()) {
		redirect.cookies.set(cookie);
	}
	// response.headers 통째로가 아니라 라이브러리가 준 것만 옮긴다.
	// next()가 붙이는 미들웨어 제어 헤더까지 리다이렉트에 실으면 안 된다
	for (const [key, headerValue] of Object.entries(authHeaders)) {
		redirect.headers.set(key, headerValue);
	}

	return redirect;
}
