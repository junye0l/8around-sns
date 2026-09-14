/**
 * 로고 자리. 48px 칸 가운데 글자 "8" 하나다.
 * 왼쪽 레일(`components/layout/SideNav.tsx`)과 인증 화면(`components/auth/AuthPanels.tsx`)이
 * 같은 왼쪽 위 자리에 둔다. 로그인 전후로 로고가 움직이지 않는다.
 */
export function BrandMark() {
	return (
		<span className="flex size-12 items-center justify-center text-title text-fg">
			8
		</span>
	);
}
