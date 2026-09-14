"use client";

import { CircleAlert } from "lucide-react";
import { useId, useRef, useState } from "react";
import { InterestChip } from "@/components/profile/InterestChip";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils/cn";
import { INTEREST_CHARS_MAX, INTERESTS_MAX } from "@/lib/utils/content-limits";
import { interestLength, normalizeInterests } from "@/lib/utils/interests";

/**
 * 프로필 편집 시트의 관심사 칸. 넣은 관심사가 칩으로 칸 안에 서고, 그 뒤에 이어 쓴다.
 * Enter나 칸 안 "추가"로 넣고 칩의 지우기로 뺀다. 3개가 차면 입력이 막힌다.
 * 폼에는 항목마다 `name="interests"` hidden input으로 실린다. 검증은 서버가 다시 한다 (규칙 9). 결정 0036.
 *
 * 칩이 칸 안에 있어 라벨을 내려놓지 않고 늘 위에 둔다. 모양은 `TextField`의 시트 안 칸과 같다.
 * @see docs/DESIGN.md 프로필 편집
 */
export function InterestsField({
	defaultValue,
	error,
	onChange,
	pending = false,
}: {
	defaultValue: string[];
	/** 서버가 돌려준 관심사 에러 문구 */
	error?: string;
	/** 넣거나 뺄 때마다 지금 목록. 편집 시트가 바뀐 것이 있는지 본다 */
	onChange?: (items: string[]) => void;
	/** 저장 중. 값을 바꾸지 못하게 막는다 */
	pending?: boolean;
}) {
	const [items, setItems] = useState(defaultValue);
	const [draft, setDraft] = useState("");
	const input = useRef<HTMLInputElement>(null);
	const id = useId();
	const full = items.length >= INTERESTS_MAX;
	const locked = pending || full;

	function update(next: string[]) {
		setItems(next);
		onChange?.(next);
	}

	function add() {
		if (locked || draft.trim() === "") return;
		// maxLength는 UTF-16으로 세고 한글 조합 중에는 넘칠 수 있어 글자 수를 한 번 더 본다
		if (interestLength(draft.trim()) > INTEREST_CHARS_MAX) return;
		update(normalizeInterests([...items, draft]));
		setDraft("");
	}

	return (
		<div className="flex flex-col gap-1">
			{/* 칸 어디를 눌러도 입력으로 간다. 칩의 지우기와 추가 버튼은 자기 누름을 먼저 받는다 */}
			<div
				className={cn(
					// 허용: 테두리 1.5px은 docs/DESIGN.md TextField 값이다. Tailwind 테두리 폭은 정수 px만 준다
					"cursor-text rounded-field border-[1.5px] bg-fill px-4 pt-2 pb-2.5 transition duration-(--motion-fast) ease-(--ease-standard) has-focus-visible:border-primary has-focus-visible:bg-canvas",
					error ? "border-danger" : "border-transparent",
				)}
				onPointerDown={(event) => {
					if (event.target === event.currentTarget) {
						event.preventDefault();
						input.current?.focus();
					}
				}}
			>
				<label className="text-footnote text-fg-muted" htmlFor={id}>
					관심사
				</label>
				<div className="mt-1 flex flex-wrap items-center gap-1.5">
					{items.map((item) => (
						<InterestChip
							disabled={pending}
							key={item}
							label={item}
							onRemove={() => {
								update(items.filter((value) => value !== item));
								// 지운 버튼이 사라지면 포커스가 body로 떨어진다
								input.current?.focus();
							}}
						/>
					))}
					<input
						aria-describedby={`${id}-desc`}
						aria-invalid={error ? true : undefined}
						className="h-7 min-w-20 flex-1 bg-transparent text-body text-fg outline-none placeholder:text-fg-muted read-only:cursor-not-allowed"
						id={id}
						maxLength={INTEREST_CHARS_MAX}
						onChange={(event) => setDraft(event.target.value)}
						onKeyDown={(event) => {
							if (event.key !== "Enter") return;
							// 폼 제출을 막는다. 한글 조합을 끝내는 Enter는 넣지 않는다
							event.preventDefault();
							if (!event.nativeEvent.isComposing) add();
						}}
						placeholder={full ? "3개를 다 채웠어요" : "예: 운동"}
						readOnly={locked}
						ref={input}
						value={draft}
					/>
					<Button
						disabled={locked || draft.trim() === ""}
						onClick={add}
						size="sm"
						variant="ghost"
					>
						추가
					</Button>
				</div>
			</div>
			<p
				className={cn(
					"flex min-h-lh items-center gap-1 px-1 text-footnote",
					error ? "text-danger" : "text-fg-muted",
				)}
				id={`${id}-desc`}
				role={error ? "alert" : undefined}
			>
				{error && <CircleAlert aria-hidden className="size-4 shrink-0" />}
				{error ??
					`한 개에 ${INTEREST_CHARS_MAX}글자까지, 최대 ${INTERESTS_MAX}개 가능해요`}
			</p>

			{items.map((item) => (
				<input key={item} name="interests" type="hidden" value={item} />
			))}
		</div>
	);
}
