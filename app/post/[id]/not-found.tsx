import { Button } from "@/components/ui/Button";

/**
 * 없는 글. `getPost`가 null을 주면 페이지가 `notFound()`로 여기로 넘긴다.
 *
 * 문구는 DESIGN.md §6 — 무엇이 없는지 한 줄로 말하고 다음 행동만 가리킨다.
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
			<Button href="/">추천으로 돌아가기</Button>
		</main>
	);
}
