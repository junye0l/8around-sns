const SIZES = {
	30: "size-7.5 rounded-lg text-headline",
	44: "size-11 rounded-xl text-title",
} as const;

/**
 * 로고 마크. `primary-fill` 사각형 안에 흰 "8" 하나다.
 * 메뉴 맨 위(`components/layout/SideNav.tsx`)는 30px, 인증 화면(`components/auth/AuthPanels.tsx`)은 44px이다.
 * @see docs/DESIGN.md 탭과 메뉴
 */
export function BrandMark({ size = 44 }: { size?: keyof typeof SIZES }) {
	return (
		<span
			className={`flex shrink-0 items-center justify-center bg-primary-fill font-extrabold text-on-primary ${SIZES[size]}`}
		>
			8
		</span>
	);
}
