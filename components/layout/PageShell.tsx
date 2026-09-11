import { ChevronLeft } from "lucide-react";
import Link from "next/link";
import type { ReactNode } from "react";

/**
 * 화면 뼈대. 왼쪽 아이콘 레일, 가운데 카드 컬럼, 붙박이 제목줄.
 *
 * 카드는 여기서 한 번 그린다. 화면마다 테두리 상자를 다시 세우지 않는다 (규칙 2).
 * 카드가 남은 높이를 다 채우므로 내용이 짧아도 바닥까지 흰 면이 이어진다.
 *
 * 웹 폭만 맞춘다. 결정 0015.
 * @see docs/PLAN.md 좁은 폭 대응
 */
export function PageShell({
	nav,
	title,
	backHref,
	children,
}: {
	/** 왼쪽 레일. 레일은 배경이 없어서 데이터가 없는 화면은 그냥 비운다 */
	nav?: ReactNode;
	title: string;
	backHref?: string;
	children: ReactNode;
}) {
	return (
		<>
			{nav}

			{/* 레일이 fixed라 흐름 밖이다. min-w-206은 레일 76 두 개와 컬럼 672를 더한 824px로,
			    이보다 좁아지면 겹치는 대신 가로 스크롤이 생긴다 */}
			<div className="flex min-w-206 flex-1 flex-col">
				<main className="mx-auto flex w-full max-w-2xl flex-1 flex-col px-4">
					<header className="sticky top-0 z-10 flex h-15 shrink-0 items-center justify-center bg-background">
						{backHref && (
							<Link
								aria-label="뒤로"
								className="absolute left-2 rounded-full p-2 text-fg transition-colors duration-[var(--motion-fast)] ease-(--ease-standard) hover:bg-canvas focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
								href={backHref}
							>
								<ChevronLeft aria-hidden className="size-5 shrink-0" />
							</Link>
						)}
						{/* 좌우 여백은 뒤로 버튼 자리다. 제목이 길어도 버튼을 덮지 않는다 */}
						<h1 className="min-w-0 truncate px-12 text-body font-semibold text-fg">
							{title}
						</h1>
					</header>

					<div className="flex flex-1 flex-col overflow-hidden rounded-t-xl border border-hairline border-b-0 bg-canvas">
						{children}
					</div>
				</main>
			</div>
		</>
	);
}
