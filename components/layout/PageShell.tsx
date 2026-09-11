import { ChevronLeft } from "lucide-react";
import Link from "next/link";
import type { ReactNode } from "react";

/**
 * 화면 뼈대. 레일 · 가운데 컬럼 · 붙박이 제목줄.
 *
 * 지금은 웹 폭만 맞춘다. 태블릿·모바일은 `docs/PLAN.md` §7에 따로 세워뒀다.
 */

export function PageShell({
	nav,
	title,
	backHref,
	children,
}: {
	/** 왼쪽 레일. 데이터가 없는 화면은 빈 레일을 넣는다 */
	nav: ReactNode;
	title: string;
	backHref?: string;
	children: ReactNode;
}) {
	return (
		<>
			{nav}

			{/* 레일은 fixed라 흐름 밖이다. 컬럼은 레일 오른쪽이 아니라 뷰포트 가운데에 선다.
			    min-w-6xl(1152px = 레일 240 × 2 + 컬럼 672)보다 좁아지면 겹치는 대신
			    가로 스크롤이 생긴다 — 좁은 폭 대응은 `docs/PLAN.md` §7에서 따로 한다 */}
			<div className="min-w-6xl">
				<main className="mx-auto w-full max-w-2xl px-4 pb-4">
					<div className="sticky top-0 z-10 flex items-center gap-2 bg-background py-4">
						{backHref && (
							<Link
								aria-label="뒤로"
								className="-ml-2 rounded-md p-2 text-fg transition-colors duration-[var(--motion-fast)] ease-(--ease-standard) hover:bg-surface"
								href={backHref}
							>
								<ChevronLeft aria-hidden className="size-5 shrink-0" />
							</Link>
						)}
						<h1 className="text-title text-fg">{title}</h1>
					</div>

					{children}
				</main>
			</div>
		</>
	);
}
