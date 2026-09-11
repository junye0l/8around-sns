"use client";

import { Button } from "@/components/ui/Button";

/**
 * 화면을 못 그렸을 때 모든 라우트가 여기로 온다. 라우트마다 따로 만들지 않는다.
 */
export default function FeedError({ reset }: { reset: () => void }) {
	return (
		<main className="flex flex-1 flex-col items-center justify-center gap-4 px-4 text-center">
			<p className="text-body font-semibold text-fg">글을 불러오지 못했어요</p>
			<p className="text-body-sm text-fg-muted">
				잠시 뒤에 다시 시도해 주세요.
			</p>
			<Button onClick={reset}>다시 시도</Button>
		</main>
	);
}
