import { ChevronLeft } from "lucide-react";
import Link from "next/link";
import type { ReactNode } from "react";
import { MoreMenu } from "@/components/layout/MoreMenu";
import { cn } from "@/lib/utils/cn";

/**
 * 화면 뼈대. 가운데 카드 컬럼과 붙박이 제목줄. 왼쪽 레일은 `app/(main)/layout.tsx`가 그린다.
 *
 * 카드는 여기서 한 번 그린다. 화면마다 테두리 상자를 다시 세우지 않는다 (규칙 2).
 * 카드가 남은 높이를 다 채우므로 내용이 짧아도 바닥까지 흰 면이 이어진다.
 *
 * 제목은 항상 왼쪽이다. 뒤로 버튼이 있으면 그 오른쪽에 나란히 선다.
 *
 * 768px 이상은 레일 옆 가운데 컬럼이 폭에 맞춰 줄어든다. 그보다 좁으면 카드 테두리 없이
 * 흰 면이 화면을 채우고, 레일 대신 아래 탭바와 제목줄 오른쪽 더 보기가 선다. 결정 0033.
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
		// 레일이 fixed라 흐름 밖이다. 좌우 76px(px-19)이 레일 자리를 비워서 컬럼이 가운데에 서고
		// 좁아지면 겹치는 대신 컬럼이 줄어든다
		<div className="flex flex-1 flex-col md:px-19">
			<main className="mx-auto flex w-full max-w-2xl flex-1 flex-col md:px-4">
				{/* 뒤로 버튼이 흐름 안에 서므로 제목이 그 옆으로 밀린다. 겹칠 자리가 없어
					    제목 길이를 신경 쓰지 않아도 된다 */}
				<header className="sticky top-0 z-10 flex h-14 shrink-0 items-center gap-1 border-hairline border-b bg-canvas px-2 md:h-15 md:border-b-0 md:bg-background">
					{backHref && (
						<Link
							aria-label="뒤로"
							className="rounded-full p-2 text-fg transition-colors duration-[var(--motion-fast)] ease-(--ease-standard) hover:bg-canvas focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
							href={backHref}
						>
							<ChevronLeft aria-hidden className="size-5 shrink-0" />
						</Link>
					)}
					{/* 뒤로 버튼이 없으면 카드 안 내용의 좌우 패딩(모바일 px-4, 넓으면 px-6)에 맞춘다.
						    버튼이 있으면 버튼의 누를 자리(p-2)가 이미 그만큼을 대신한다 */}
					<h1
						className={cn(
							"min-w-0 flex-1 truncate text-title text-fg",
							backHref ? "" : "px-2 md:px-4",
						)}
					>
						{title}
					</h1>

					{/* 넓은 폭에서는 레일 맨 아래에 있다 */}
					<MoreMenu
						className="rounded-full p-2 text-fg transition-colors duration-[var(--motion-fast)] ease-(--ease-standard) hover:bg-background focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary md:hidden"
						labelClassName="sr-only"
						side="bottom"
					/>
				</header>

				{/* pb-16은 아래 탭바(h-16)에 마지막 줄이 가리지 않게 비운 자리다 */}
				<div className="flex flex-1 flex-col overflow-hidden bg-canvas pb-16 md:rounded-t-xl md:border md:border-hairline md:border-b-0 md:pb-0">
					{children}
				</div>
			</main>
		</div>
	);
}
