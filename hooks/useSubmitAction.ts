"use client";

import { useActionState, useRef } from "react";

/**
 * `useActionState`에 중복 제출 막이를 붙인 것. 돌려주는 모양이 같다.
 *
 * `pending`은 다음 렌더에야 켜진다. 그 전에 한 번 더 제출되면 React가 액션을 줄 세워
 * 두 번 보낸다. 같은 틱에 두 번 누르면 글과 댓글이 두 개 생긴다. 막이는 렌더를 기다리지 않는
 * ref라 첫 제출이 끝날 때까지 뒤따르는 제출을 버린다. 끝나면(성공, 실패, 던짐 모두) 다시 받는다.
 *
 * 폼에서만 쓴다. `<form action={submit}>`으로 넘긴다. 서버는 같은 글이 두 번 와도 거르지 않는다,
 * 같은 말을 두 번 쓰는 것도 정상 요청이라서다. 한 번 누른 것이 두 번 가지 않게 하는 곳은 여기다.
 */
export function useSubmitAction<State>(
	action: (prev: Awaited<State>, formData: FormData) => Promise<State>,
	initialState: Awaited<State>,
) {
	const inFlight = useRef(false);
	const [state, formAction, pending] = useActionState<State, FormData>(
		async (prev, formData) => {
			try {
				return await action(prev, formData);
			} finally {
				inFlight.current = false;
			}
		},
		initialState,
	);

	const submit = (formData: FormData) => {
		if (inFlight.current) return;
		inFlight.current = true;
		formAction(formData);
	};

	return [state, submit, pending] as const;
}
