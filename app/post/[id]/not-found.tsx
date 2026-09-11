import Link from "next/link";

/**
 * 없는 글. `getPost`가 null을 주면 페이지가 `notFound()`로 여기로 넘긴다.
 *
 * 문구는 DESIGN.md §6 — 무엇이 없는지 한 줄로 말하고 다음 행동만 가리킨다.
 *
 * ponytail: 아래 링크는 `components/ui/Button.tsx`의 primary 뼈대를 옮겨 적은 것이다.
 * `Button`이 `<button type="button">`으로 고정이라 링크가 될 수 없다. 지금은 이 조합이
 * 두 번째로 나타난 지점이라 규칙 2가 공통화를 강제하지 않는다. 세 번째 링크형 버튼이
 * 생기면 `Button`이 `href`를 받아 `<Link>`로 갈라지게 열고 여기를 그걸로 바꾼다 (PR #8 리뷰).
 */
export default function PostNotFound() {
	return (
		<main className="flex flex-1 flex-col items-center justify-center gap-4 px-4 text-center">
			<p className="text-body font-semibold text-fg-strong">
				글을 찾지 못했어요
			</p>
			<p className="text-body-sm text-fg-muted">
				지워졌거나 주소가 바뀌었을 수 있어요.
			</p>
			<Link
				className="rounded-md bg-primary px-4 py-3 text-body font-semibold text-canvas transition-colors duration-[var(--motion-fast)] ease-(--ease-standard) hover:bg-primary-hover"
				href="/"
			>
				추천으로 돌아가기
			</Link>
		</main>
	);
}
