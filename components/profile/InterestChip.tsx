import { X } from "lucide-react";
import { cn } from "@/lib/utils/cn";
import { type Tone, toneOf } from "@/lib/utils/tone";

const TONE: Record<Tone, string> = {
	violet: "bg-chip-violet text-chip-violet-fg",
	blue: "bg-chip-blue text-chip-blue-fg",
	green: "bg-chip-green text-chip-green-fg",
	orange: "bg-chip-orange text-chip-orange-fg",
	pink: "bg-chip-pink text-chip-pink-fg",
	teal: "bg-chip-teal text-chip-teal-fg",
};

/**
 * 글 카드 작성자 줄의 작은 관심사 칩. 글자를 해시한 톤으로 칠한다. 누를 수 없다.
 * @see docs/DESIGN.md 관심사 칩
 */
export function InterestTag({ label }: { label: string }) {
	return (
		<span
			className={`inline-block max-w-full truncate rounded-full px-2 text-chip ${TONE[toneOf(label)]}`}
		>
			{label}
		</span>
	);
}

/**
 * 큰 관심사 칩. 프로필 헤더, 내 프로필 요약, 편집 시트가 쓴다. 14px / 600, 좌우 12px, 위아래 4px, 관심사 톤.
 * `onRemove`를 주면 오른쪽에 지우기 버튼이 붙는다.
 * @see docs/DESIGN.md 관심사 칩
 */
export function InterestChip({
	label,
	onRemove,
	disabled = false,
}: {
	label: string;
	onRemove?: () => void;
	/** 저장 중. 지우기를 살려 둔 채 누름만 막는다. 포커스를 잃지 않게 aria-disabled로 한다 */
	disabled?: boolean;
}) {
	return (
		<span
			className={cn(
				"inline-flex max-w-full items-center gap-1 rounded-full py-1 text-subhead font-semibold",
				TONE[toneOf(label)],
				onRemove ? "pr-1.5 pl-3" : "px-3",
			)}
		>
			<span className="truncate">{label}</span>
			{onRemove && (
				<button
					aria-disabled={disabled || undefined}
					aria-label={`${label} 지우기`}
					className="flex size-5 shrink-0 items-center justify-center rounded-full transition duration-(--motion-fast) ease-(--ease-standard) focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary active:scale-97 aria-disabled:cursor-not-allowed"
					onClick={() => {
						if (!disabled) onRemove();
					}}
					type="button"
				>
					<X aria-hidden className="size-4" />
				</button>
			)}
		</span>
	);
}

/** 관심사 칩 줄. 비면 아무것도 그리지 않는다 */
export function InterestChips({ items }: { items: string[] }) {
	if (items.length === 0) return null;

	return (
		<ul aria-label="관심사" className="flex flex-wrap gap-1.5">
			{items.map((item) => (
				<li className="max-w-full" key={item}>
					<InterestChip label={item} />
				</li>
			))}
		</ul>
	);
}
