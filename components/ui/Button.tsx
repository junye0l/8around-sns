import Link from "next/link";
import type { ComponentProps } from "react";

type ButtonProps = ComponentProps<"button"> & {
	/** outline은 중립색만 쓴다. 한 화면에 primary는 하나다 */
	variant?: "primary" | "outline";
	/** 진행 중. 문구를 바꾸고 입력을 막는다 */
	loading?: boolean;
	/**
	 * 주면 `<Link>`가 된다. 모양은 같고 하는 일만 이동이다.
	 * 이동에는 진행 중도 비활성도 없으므로 `loading`·`disabled`와 button 전용
	 * 속성은 이 갈래에서 쓰이지 않는다.
	 */
	href?: string;
};

/**
 * 변형별 색. 너비는 정하지 않는다. 부르는 쪽이 `className`으로 준다.
 * 여기서 기본 너비를 주면 호출부의 `w-auto`가 지는데, Tailwind는 문자열 순서가
 * 아니라 CSS 출력 순서로 이기고 `.w-auto`가 `.w-full`보다 앞에 나오기 때문이다.
 */
const VARIANTS = {
	primary:
		"bg-primary text-canvas hover:bg-primary-hover disabled:bg-hairline disabled:text-fg-muted",
	outline:
		"border border-fg bg-transparent text-fg hover:bg-background disabled:border-hairline disabled:text-fg-muted",
} as const;

export function Button({
	variant = "primary",
	loading = false,
	disabled,
	className = "",
	href,
	children,
	...props
}: ButtonProps) {
	const classes = `rounded-md px-4 py-3 text-body font-semibold transition-colors duration-[var(--motion-fast)] ease-(--ease-standard) ${VARIANTS[variant]} ${className}`;

	if (href) {
		return (
			<Link className={classes} href={href}>
				{children}
			</Link>
		);
	}

	return (
		<button
			type="button"
			disabled={disabled || loading}
			className={classes}
			{...props}
		>
			{children}
		</button>
	);
}
