"use client";

import { useSyncExternalStore } from "react";

/**
 * 미디어 쿼리가 지금 맞는지. 폭이 바뀌면 다시 그린다.
 * 서버와 첫 하이드레이션에서는 `false`다. 열려 있을 때만 그려지는 시트처럼 첫 페인트에 보이지 않는 자리에서 쓴다.
 */
export function useMediaQuery(query: string) {
	return useSyncExternalStore(
		(onChange) => {
			const list = window.matchMedia(query);
			list.addEventListener("change", onChange);
			return () => list.removeEventListener("change", onChange);
		},
		() => window.matchMedia(query).matches,
		() => false,
	);
}
