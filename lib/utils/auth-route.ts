/**
 * 비로그인 사용자가 볼 수 있는 전부. 여기 없는 경로는 전부 로그인이 필요하다.
 *
 * 막을 경로를 나열하지 않고 허용할 경로를 나열한다. 반대로 하면 화면이 늘 때마다
 * 목록에 더해야 하고, 빠뜨린 화면이 조용히 열린다 (규칙 9 — 한 곳에서 막는다).
 */
const PUBLIC_PATHS = ["/login", "/signup"];

/**
 * 세션 상태와 경로만으로 갈 곳을 정한다. 돌려보낼 필요가 없으면 null.
 *
 * 미들웨어에서 떼어낸 이유는 테스트다. 이 판정이 미들웨어 안에 있으면
 * `npm run verify`가 통과하는 채로 아무도 가입하지 못하는 상태가 나올 수 있다.
 */
export function authRedirect(
	pathname: string,
	signedIn: boolean,
): string | null {
	const isPublic = PUBLIC_PATHS.includes(pathname);

	// 로그인한 사람에게 가입·로그인 화면은 의미가 없다
	if (signedIn) return isPublic ? "/" : null;

	return isPublic ? null : "/login";
}
