import { ImageResponse } from "next/og";

// ImageResponse는 CSS 변수를 읽지 못해 값을 옮겨 적는다. 출처는 docs/DESIGN.md의 primary-fill 라이트 값과 on-primary
const PRIMARY_FILL = "#5750e6";
const ON_PRIMARY = "#ffffff";

/**
 * 파비콘과 홈 화면 아이콘으로 쓰는 로고 마크 PNG. `components/ui/BrandMark.tsx`의 44px 비율을 그대로 늘리고 줄인다.
 * 둥근 모서리는 브라우저 탭용이다. iOS는 제 모양으로 모서리를 깎으므로 `rounded`를 끈다.
 *
 * 글꼴은 next/og 기본 글꼴이다. `app/fonts`의 Pretendard는 woff2라 ImageResponse가 읽지 못한다.
 * 색을 옮겨 적은 것과 글꼴 선택은 결정 0051.
 * @see app/icon.tsx
 * @see app/apple-icon.tsx
 */
export function brandIconImage(px: number, { rounded }: { rounded: boolean }) {
	return new ImageResponse(
		<div
			style={{
				width: "100%",
				height: "100%",
				display: "flex",
				alignItems: "center",
				justifyContent: "center",
				background: PRIMARY_FILL,
				color: ON_PRIMARY,
				// BrandMark 44px: rounded-xl 12px, text-title 20px
				borderRadius: rounded ? Math.round((px * 12) / 44) : 0,
				fontSize: Math.round((px * 20) / 44),
				fontWeight: 800,
			}}
		>
			8
		</div>,
		{ width: px, height: px },
	);
}
