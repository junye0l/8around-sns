import { cva, type VariantProps } from "class-variance-authority";
import Link from "next/link";
import type { ComponentProps } from "react";
import { cn } from "@/lib/utils/cn";

/**
 * 변형별 색과 상태. 너비는 정하지 않는다. 부르는 쪽이 `className`으로 준다.
 *
 * pressed는 hover와 같은 강한 파랑을 쓴다. 문서에 파랑이 둘뿐이라 세 번째를 지어내지
 * 않는다. 터치에는 hover가 없으므로 같은 색이어도 `active:`가 눌림을 알려준다.
 */
const button = cva(
	"inline-flex items-center justify-center rounded-md px-4 py-3 text-body font-semibold transition-colors duration-[var(--motion-fast)] ease-(--ease-standard) focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary disabled:cursor-not-allowed",
	{
		variants: {
			variant: {
				primary:
					"bg-primary text-canvas hover:bg-primary-hover active:bg-primary-hover disabled:bg-hairline disabled:text-fg-muted",
				outline:
					"border border-fg bg-transparent text-fg hover:bg-background active:bg-hairline disabled:border-hairline disabled:text-fg-muted",
			},
		},
		defaultVariants: { variant: "primary" },
	},
);

type ButtonProps = ComponentProps<"button"> &
	VariantProps<typeof button> & {
		/** 진행 중. 문구는 그대로 두어 너비를 유지하고 입력만 막는다 */
		loading?: boolean;
		/** 주면 `<Link>`가 된다. 모양은 같고 하는 일만 이동이다 */
		href?: string;
	};

export function Button({
	variant,
	loading = false,
	disabled,
	className,
	href,
	children,
	...props
}: ButtonProps) {
	const classes = cn(button({ variant }), className);

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
			aria-busy={loading || undefined}
			disabled={disabled || loading}
			className={classes}
			{...props}
		>
			{children}
		</button>
	);
}
