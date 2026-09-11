import { Button } from "@/components/ui/Button";

/**
 * 어느 라우트에도 걸리지 않는 주소가 여기로 온다.
 * 무엇을 찾던 중인지 알 수 없으므로 추천으로 보낸다.
 */
export default function NotFound() {
	return (
		<main className="flex flex-1 flex-col items-center justify-center gap-4 px-4 text-center">
			<h1 className="text-body font-semibold text-fg">없는 주소예요</h1>
			<p className="text-body-sm text-fg-muted">
				주소가 바뀌었거나 지워졌을 수 있어요.
			</p>
			<Button href="/">추천으로 돌아가기</Button>
		</main>
	);
}
