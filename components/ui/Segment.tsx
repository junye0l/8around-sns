import Link from "next/link";
import { cn } from "@/lib/utils/cn";

/**
 * 세그먼트의 틀과 칸. `hairline` 바탕 12px 모서리, 켜진 칸은 `canvas`와 `shadow-card`.
 * 더 보기의 디자인 고르기(`components/layout/MoreMenu.tsx`)와 팔로워 · 팔로잉 전환이 같이 쓴다 (규칙 2).
 * @see docs/DESIGN.md 탭과 메뉴
 */
export const SEGMENT = "flex h-10 gap-1 rounded-xl bg-hairline p-1";

export const SEGMENT_ITEM =
	"flex flex-1 cursor-pointer select-none items-center justify-center rounded-lg text-subhead font-semibold text-fg-muted transition duration-(--motion-fast) ease-(--ease-standard) active:scale-97";

/** 켜진 칸의 모양. 켜졌는지는 부르는 쪽이 aria 속성으로 말한다 */
export const SEGMENT_ON = "bg-canvas text-fg shadow-card";

/**
 * 주소로 가는 세그먼트. 칸마다 라우트 링크이고 지금 주소인 칸이 켜진다.
 */
export function SegmentLinks({
	label,
	items,
}: {
	/** 스크린리더가 읽을 묶음 이름 */
	label: string;
	items: { href: string; label: string; current: boolean }[];
}) {
	return (
		<nav aria-label={label} className={SEGMENT}>
			{items.map((item) => (
				<Link
					aria-current={item.current ? "page" : undefined}
					className={cn(
						SEGMENT_ITEM,
						"tabular-nums focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary",
						item.current && SEGMENT_ON,
					)}
					href={item.href}
					key={item.href}
				>
					{item.label}
				</Link>
			))}
		</nav>
	);
}
