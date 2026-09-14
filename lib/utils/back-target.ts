/** 뒤로 가기가 돌아갈 주소와 그 화면 이름 */
export type BackTarget = { href: string; label: string };

const FIXED: Record<string, string> = {
	"/": "전체",
	"/following": "팔로잉",
	"/likes": "좋아요",
};

const PROFILE =
	/^\/u\/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/;

/**
 * 게시글 상세 주소의 `from`을 뒤로 가기로 바꾼다. 글 카드가 온 화면의 경로를 싣는다.
 *
 * 아는 경로 모양만 받는다. 아무 값이나 링크로 쓰면 다른 사이트로 보내는 주소를 만들 수 있다.
 * 모르는 값, 비었을 때, 배열로 여러 번 왔을 때는 전체로 돌아간다.
 */
export function backTarget(from: string | string[] | undefined): BackTarget {
	if (typeof from !== "string") return { href: "/", label: "전체" };
	if (Object.hasOwn(FIXED, from)) return { href: from, label: FIXED[from] };
	if (PROFILE.test(from)) return { href: from, label: "프로필" };
	return { href: "/", label: "전체" };
}

/** 글 상세 주소. 온 화면을 `from`으로 싣는다. 받는 쪽은 `backTarget` */
export function postHref(postId: string, from?: string) {
	return from
		? `/post/${postId}?from=${encodeURIComponent(from)}`
		: `/post/${postId}`;
}
