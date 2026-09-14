import { ChevronLeft } from "lucide-react";
import Link from "next/link";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils/cn";

/**
 * 화면 뼈대. 가운데 카드 컬럼과 붙박이 제목줄. 왼쪽 레일은 `app/(main)/layout.tsx`가 그린다.
 *
 * 카드는 여기서 한 번 그린다. 화면마다 테두리 상자를 다시 세우지 않는다 (규칙 2).
 * 카드가 남은 높이를 다 채우므로 내용이 짧아도 바닥까지 흰 면이 이어진다.
 *
 * 제목은 항상 왼쪽이다. 뒤로 버튼이 있으면 그 오른쪽에 나란히 선다.
 *
 * 웹 폭만 맞춘다. 결정 0015.
 * @see docs/PLAN.md 좁은 폭 대응
 */
export function PageShell({
	title,
	backHref,
	children,
}: {
	title: string;
	backHref?: string;
	children: ReactNode;
}) {
	return (
		// 레일이 fixed라 흐름 밖이다. min-w-206은 레일 76 두 개와 컬럼 672를 더한 824px로,
		// 이보다 좁아지면 겹치는 대신 가로 스크롤이 생긴다
		<div className="flex min-w-206 flex-1 flex-col">
			<main className="mx-auto flex w-full max-w-2xl flex-1 flex-col px-4">
				{/* 뒤로 버튼이 흐름 안에 서므로 제목이 그 옆으로 밀린다. 겹칠 자리가 없어
					    제목 길이를 신경 쓰지 않아도 된다 */}
				<header className="sticky top-0 z-10 flex h-15 shrink-0 items-center gap-1 bg-background px-2">
					{backHref && (
						<Link
							aria-label="뒤로"
							className="rounded-full p-2 text-fg transition-colors duration-[var(--motion-fast)] ease-(--ease-standard) hover:bg-canvas focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
							href={backHref}
						>
							<ChevronLeft aria-hidden className="size-6 shrink-0" />
						</Link>
					)}
					{/* 뒤로 버튼이 없으면 카드 안 내용의 px-6에 맞춘다. 버튼이 있으면
						    버튼의 누를 자리(p-2)가 이미 그만큼을 대신한다 */}
					<h1
						className={cn(
							"min-w-0 truncate text-title text-fg",
							backHref ? "" : "px-4",
						)}
					>
						{title}
					</h1>
				</header>

				<div className="flex flex-1 flex-col overflow-hidden rounded-t-xl border border-hairline border-b-0 bg-canvas">
					{children}
				</div>
			</main>
		</div>
	);
}
