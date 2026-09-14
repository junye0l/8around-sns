import { cva, type VariantProps } from "class-variance-authority";
import { LoaderCircle } from "lucide-react";
import Link from "next/link";
import type { ComponentProps } from "react";
import { cn } from "@/lib/utils/cn";

/**
 * 변형별 색과 크기. 모양은 전부 알약이다. 값의 출처는 `docs/DESIGN.md`의 Button.
 *
 * 꺼진 모양은 `disabled:`가 아니라 `aria-disabled:`가 칠한다. 진행 중이든 보낼 것이 없든
 * 요소는 살아 있어야 포커스를 잃지 않고 키보드로 닿는다. 결정 0012, 0042.
 * 진행 중(`aria-busy`)은 꺼진 색을 칠하지 않고 변형 색 그대로 스피너만 돈다.
 *
 * `outline`은 리뉴얼 전 변형이다. 쓰는 화면이 옮겨가면 지운다.
 * @see docs/decisions/0010-focus-ring-primary.md
 */
const button = cva(
	"relative inline-flex items-center justify-center rounded-full font-bold transition duration-(--motion-fast) ease-(--ease-standard) focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary active:scale-97 active:brightness-92 aria-disabled:cursor-not-allowed aria-disabled:active:scale-100 aria-disabled:active:brightness-100 aria-disabled:not-aria-busy:bg-hairline aria-disabled:not-aria-busy:text-fg-disabled aria-busy:cursor-progress",
	{
		variants: {
			size: {
				lg: "h-13 w-full px-5 text-body",
				md: "h-11 px-5 text-callout",
				sm: "h-8 px-3.5 text-subhead",
			},
			variant: {
				primary: "bg-primary-fill text-on-primary",
				secondary: "bg-fill text-fg",
				ghost: "text-primary",
				danger: "bg-danger-soft text-danger",
				outline: "border border-hairline text-fg",
			},
		},
		defaultVariants: { size: "md", variant: "primary" },
	},
);

type ButtonProps = ComponentProps<"button"> &
	VariantProps<typeof button> & {
		/**
		 * 진행 중. 글자 자리에 스피너가 서서 폭이 그대로다. 누름을 막는다.
		 * 요소를 `disabled`로 만들지 않는다 — 포커스된 요소가 disabled가 되면
		 * 브라우저가 포커스를 body로 떨어뜨린다.
		 */
		loading?: boolean;
		/**
		 * 보낼 것이 없다. `aria-disabled`로 끄고 누름을 막는다. 누름이 막히면
		 * 폼의 Enter 암묵 제출도 같이 막힌다, 브라우저가 기본 버튼을 누르는 것으로 제출하기 때문이다
		 */
		disabled?: boolean;
		/** 주면 `<Link>`가 된다. 모양은 같고 하는 일만 이동이다 */
		href?: string;
	};

export function Button({
	size,
	variant,
	loading = false,
	disabled,
	className,
	href,
	children,
	onClick,
	...props
}: ButtonProps) {
	const classes = cn(button({ size, variant }), className);
	const blocked = loading || disabled;

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
			// 살아 있는 채로 "지금은 못 누른다"만 알린다. 포커스가 유지된다
			aria-disabled={blocked || undefined}
			onClick={(event) => {
				if (blocked) {
					event.preventDefault();
					return;
				}
				onClick?.(event);
			}}
			className={classes}
			{...props}
		>
			<span className={cn("contents", loading && "invisible")}>{children}</span>
			{loading && (
				<LoaderCircle
					aria-hidden
					className={cn(
						"absolute animate-spin",
						size === "sm" ? "size-4" : "size-5",
					)}
				/>
			)}
		</button>
	);
}
