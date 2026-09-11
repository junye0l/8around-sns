"use client";

import { Button } from "@/components/ui/Button";

/**
 * 화면을 못 그린 경우 (DESIGN.md §4 States "Error (network / server-blocking)").
 * 문서는 subline을 gray-800으로 적지만 §2 팔레트에 없는 값이라 지어내지 않고
 * 있는 중립색(`text-fg-muted`, gray-600)을 쓴다 (§7 Unknowns).
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
