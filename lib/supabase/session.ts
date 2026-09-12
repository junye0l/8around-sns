import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/types/database";

/**
 * 지금 요청의 사용자 id. 세션이 없거나 토큰을 믿을 수 없으면 null.
 *
 * `getUser()`가 아니라 `getClaims()`다. `getUser()`는 부를 때마다 Auth 서버에 묻지만,
 * `getClaims()`는 JWT 서명을 공개키로 프로세스 안에서 검증한다. 공개키는 한 번 받아
 * 모듈 캐시에 남는다 (`@supabase/auth-js/dist/main/GoTrueClient.js`의 `GLOBAL_JWKS`).
 * 이 프로젝트가 비대칭 키(ES256)를 쓰는 것은 JWKS 엔드포인트로 확인했다 — 대칭 키였다면
 * 라이브러리가 조용히 `getUser()`로 돌아가 이득이 없다. 결정 0023.
 *
 * 세션 갱신과 리다이렉트는 여기가 아니라 프록시(`lib/supabase/middleware.ts`)가 한다.
 * 갱신은 서버에 물어야 하는 일이라 그쪽은 `getUser()`를 그대로 둔다.
 *
 * 권한은 이 값이 아니라 RLS가 본다 (규칙 9). 여기서 꺼낸 id는 "누구 이름으로 쓸지"와
 * "로그인이 풀렸는지"에만 쓰인다.
 */
export async function getSessionUserId(
	supabase: SupabaseClient<Database>,
): Promise<string | null> {
	const { data } = await supabase.auth.getClaims();
	return data?.claims.sub ?? null;
}
