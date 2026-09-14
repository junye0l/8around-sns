import { Button } from "@/components/ui/Button";

/**
 * 없는 사람. `getProfile`이 null을 주면 페이지가 `notFound()`로 여기로 넘긴다.
 */
export default function ProfileNotFound() {
	return (
		<main className="flex flex-1 flex-col items-center justify-center gap-4 px-4 text-center">
			<h1 className="text-body font-semibold text-fg">그런 사람이 없어요</h1>
			<p className="text-body-sm text-fg-muted">
				탈퇴했거나 별명이 바뀌었을 수 있어요.
			</p>
			<Button href="/">추천으로 돌아가기</Button>
		</main>
	);
}
