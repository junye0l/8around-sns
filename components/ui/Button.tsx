import { cva, type VariantProps } from "class-variance-authority";
import Link from "next/link";
import type { ComponentProps } from "react";
import { cn } from "@/lib/utils/cn";

/**
 * 변형별 색과 상태. 너비는 정하지 않는다. 부르는 쪽이 `className`으로 준다.
 *
 * pressed는 hover와 같은 강한 파랑을 쓴다. 문서에 파랑이 둘뿐이라 세 번째를 지어내지
 * 않는다. 터치에는 hover가 없으므로 같은 색이어도 `active:`가 눌림을 알려준다.
 *
 * 테두리는 변형이 아니라 기본값에 있고 변형은 색만 바꾼다. outline에만 두면 변형이
 * 바뀔 때 상자가 사방 1px씩 커진다 — 팔로우 버튼이 primary에서 outline으로 넘어가며
 * 옆 칸을 밀고 아랫줄을 내리는 시프트가 그것이었다.
 *
 * 진행 중일 때의 회색은 `disabled:`가 아니라 `aria-busy:`가 칠한다. 진행 중에도
 * 요소는 살아 있어야 포커스를 잃지 않기 때문이다. 결정 0012.
 *
 * `sm`은 60x36이다. `docs/DESIGN.md`의 웹 버튼 40 또는 46px 어디에도 없는 값이고,
 * 사용자가 지정했다. 결정 0014.
 *
 * 포커스 링 색은 결정 0010.
 * @see docs/decisions/0010-focus-ring-primary.md
 */
const button = cva(
	"inline-flex items-center justify-center rounded-md border font-semibold transition-colors duration-[var(--motion-fast)] ease-(--ease-standard) focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary disabled:cursor-not-allowed aria-busy:cursor-progress",
	{
		variants: {
			size: {
				md: "px-4 py-3 text-body",
				// 60x36 고정. 폭을 고정해야 진행 중에도 자리가 안 흔들린다.
				// 들어가는 문구는 두 글자뿐이다 — 게시, 댓글, 답글
				sm: "h-9 w-15 text-body-sm",
			},
			variant: {
				primary:
					"border-transparent bg-primary text-canvas hover:bg-primary-hover active:bg-primary-hover disabled:bg-hairline disabled:text-fg-muted aria-busy:bg-hairline aria-busy:text-fg-muted aria-busy:hover:bg-hairline",
				outline:
					"border-fg bg-transparent text-fg hover:bg-background active:bg-hairline disabled:border-hairline disabled:text-fg-muted aria-busy:border-hairline aria-busy:text-fg-muted aria-busy:hover:bg-transparent",
			},
		},
		defaultVariants: { size: "md", variant: "primary" },
	},
);

type ButtonProps = ComponentProps<"button"> &
	VariantProps<typeof button> & {
		/**
		 * 진행 중. 문구는 그대로 두어 너비를 유지하고 누름만 막는다.
		 * 요소를 `disabled`로 만들지 않는다 — 포커스된 요소가 disabled가 되면
		 * 브라우저가 포커스를 body로 떨어뜨린다.
		 */
		loading?: boolean;
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
			aria-disabled={loading || undefined}
			disabled={disabled}
			onClick={(event) => {
				if (loading) {
					event.preventDefault();
					return;
				}
				onClick?.(event);
			}}
			className={classes}
			{...props}
		>
			{children}
		</button>
	);
}
