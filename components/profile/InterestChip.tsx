import { X } from "lucide-react";
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
 * 관심사 한 개. 테두리 없는 회색 채움 알약이고 누를 수 없다. 파랑을 쓰지 않는다, 동작이 아니다.
 * `onRemove`를 주면 오른쪽에 지우기 버튼이 붙는다. 프로필 편집 모달이 쓴다.
 * 결정 0036, 0038, 0039.
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
			className={`inline-flex h-8 max-w-full items-center gap-1 rounded-full bg-background text-body-sm text-fg ${onRemove ? "pr-1 pl-3" : "px-3"}`}
		>
			<span className="truncate">{label}</span>
			{onRemove && (
				<button
					aria-disabled={disabled || undefined}
					aria-label={`${label} 지우기`}
					className="flex size-6 shrink-0 items-center justify-center rounded-full text-fg-muted transition-colors duration-[var(--motion-fast)] ease-(--ease-standard) hover:bg-hairline hover:text-fg focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary active:bg-fg/10 aria-disabled:cursor-not-allowed aria-disabled:hover:bg-transparent aria-disabled:hover:text-fg-muted"
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

/**
 * 프로필 화면의 관심사 줄. 비면 아무것도 그리지 않는다.
 * 칩 바깥 끝이 위아래 별명, 소개와 같은 왼쪽 끝에 선다. 칩 글자는 안쪽 여백만큼 들어간다. 결정 0039.
 */
export function InterestChips({ items }: { items: string[] }) {
	if (items.length === 0) return null;

	return (
		<ul aria-label="관심사" className="flex flex-wrap gap-2">
			{items.map((item) => (
				<li className="max-w-full" key={item}>
					<InterestChip label={item} />
				</li>
			))}
		</ul>
	);
}
