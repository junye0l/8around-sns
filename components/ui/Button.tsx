import type { ComponentProps } from "react";

type ButtonProps = ComponentProps<"button"> & {
	/** outline은 주황을 쓰지 않는다 — 한 화면에 primary 하나 (DESIGN.md §1) */
	variant?: "primary" | "outline";
	/** 진행 중. 문구를 바꾸고 입력을 막는다 */
	loading?: boolean;
};

/**
 * Box Button (DESIGN.md §4 SEED Product Components).
 *
 * 너비는 정하지 않는다. 부르는 쪽이 준다 — 기본값을 두면 호출부의 w-auto가
 * 이기지 못한다. Tailwind는 className 문자열 순서가 아니라 CSS 출력 순서로
 * 승부가 갈리고, .w-auto 가 .w-full 보다 앞에 나온다.
 *
 * 높이·여백은 문서에 SEED 수치가 없어서 지어내지 않고, 4px 그리드(§5)와
 * radius 스케일(§5 Medium 8px)로만 조립했다. 마케팅 CTA의 #ff6600 / pill 기하는
 * 제품 버튼에 쓰지 말라고 §2에 못박혀 있다.
 */
const VARIANTS = {
	primary:
		"bg-primary text-canvas hover:bg-primary-hover disabled:bg-hairline disabled:text-fg-muted",
	outline:
		"border border-fg bg-transparent text-fg hover:bg-surface disabled:border-hairline disabled:text-fg-muted",
} as const;

export function Button({
	variant = "primary",
	loading = false,
	disabled,
	className = "",
	children,
	...props
}: ButtonProps) {
	return (
		<button
			type="button"
			disabled={disabled || loading}
			className={`rounded-md px-4 py-3 text-body font-semibold transition-colors duration-[var(--motion-fast)] ease-(--ease-standard) ${VARIANTS[variant]} ${className}`}
			{...props}
		>
			{children}
		</button>
	);
}
