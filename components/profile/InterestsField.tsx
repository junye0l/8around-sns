"use client";

import { useRef, useState } from "react";
import { InterestChip } from "@/components/profile/InterestChip";
import { Button } from "@/components/ui/Button";
import { TextField } from "@/components/ui/TextField";
import { INTEREST_CHARS_MAX, INTERESTS_MAX } from "@/lib/utils/content-limits";
import { interestLength, normalizeInterests } from "@/lib/utils/interests";

/**
 * 프로필 편집 모달의 관심사 칸. 입력칸에 쓰고 Enter나 추가 버튼으로 넣는다. 넣은 것은 지울 수 있는 칩이 된다.
 * 폼에는 항목마다 `name="interests"` hidden input으로 실린다. 검증은 서버가 다시 한다(규칙 9).
 *
 * 3개가 차면 입력칸은 readOnly, 추가 버튼은 aria-disabled다. 진짜 disabled로 바꾸면
 * 방금 누른 요소에서 포커스가 body로 떨어진다(`components/ui/Button.tsx`와 같은 이유).
 * 결정 0036.
 */
export function InterestsField({
	defaultValue,
	error,
	pending = false,
}: {
	defaultValue: string[];
	/** 서버가 돌려준 관심사 에러 문구 */
	error?: string;
	/** 저장 중. 값을 바꾸지 못하게 막는다 */
	pending?: boolean;
}) {
	const [items, setItems] = useState(defaultValue);
	const [draft, setDraft] = useState("");
	const input = useRef<HTMLInputElement>(null);
	const full = items.length >= INTERESTS_MAX;
	const locked = pending || full;

	function add() {
		if (locked) return;
		// maxLength는 UTF-16으로 세고 한글 조합 중에는 넘칠 수 있어 글자 수를 한 번 더 본다
		if (interestLength(draft.trim()) > INTEREST_CHARS_MAX) return;
		setItems(normalizeInterests([...items, draft]));
		setDraft("");
	}

	return (
		<div className="flex flex-col gap-2">
			<div className="flex items-start gap-2">
				<div className="min-w-0 flex-1">
					<TextField
						error={error}
						hint={`한 개에 ${INTEREST_CHARS_MAX}글자, ${INTERESTS_MAX}개까지 가능해요`}
						label="관심사"
						maxLength={INTEREST_CHARS_MAX}
						onChange={(event) => setDraft(event.target.value)}
						onKeyDown={(event) => {
							if (event.key !== "Enter") return;
							// 폼 제출을 막는다. 한글 조합을 끝내는 Enter는 넣지 않는다
							event.preventDefault();
							if (!event.nativeEvent.isComposing) add();
						}}
						placeholder={full ? "3개를 다 채웠어요" : "예: 운동, 여행, AI"}
						readOnly={locked}
						ref={input}
						value={draft}
					/>
				</div>
				<Button
					aria-disabled={locked || undefined}
					className="h-14 aria-disabled:cursor-not-allowed aria-disabled:text-fg-muted aria-disabled:hover:bg-transparent"
					onClick={add}
					variant="outline"
				>
					추가
				</Button>
			</div>

			{items.length > 0 && (
				<ul aria-label="넣은 관심사" className="flex flex-wrap gap-2">
					{items.map((item) => (
						<li className="max-w-full" key={item}>
							<InterestChip
								disabled={pending}
								label={item}
								onRemove={() => {
									setItems(items.filter((value) => value !== item));
									// 지운 버튼이 사라지면 포커스가 body로 떨어진다
									input.current?.focus();
								}}
							/>
						</li>
					))}
				</ul>
			)}

			{items.map((item) => (
				<input key={item} name="interests" type="hidden" value={item} />
			))}
		</div>
	);
}
