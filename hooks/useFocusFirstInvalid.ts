"use client";

import { useEffect, useRef } from "react";

/**
 * 제출 결과가 올 때마다 폼 안 첫 에러 칸(`[aria-invalid]`)으로 포커스를 옮긴다.
 * 돌려주는 ref를 `<form ref>`에 단다. 에러 칸이 없으면 포커스를 옮기지 않는다.
 * 로그인, 가입, 프로필 편집이 같이 쓴다 (규칙 2).
 * @see docs/DESIGN.md 로그인, 회원가입
 */
export function useFocusFirstInvalid(result: unknown) {
	const form = useRef<HTMLFormElement>(null);

	// result는 액션이 끝날 때마다 새 객체라 같은 에러가 다시 와도 다시 옮긴다
	useEffect(() => {
		if (!result) return;
		form.current?.querySelector<HTMLElement>("[aria-invalid]")?.focus();
	}, [result]);

	return form;
}
