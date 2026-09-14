import { ChevronLeft } from "lucide-react";
import Link from "next/link";
import type { ReactNode } from "react";
import { MoreMenu } from "@/components/layout/MoreMenu";
import { cn } from "@/lib/utils/cn";

/**
 * 화면 가운데 칸. 큰 제목줄과 그 아래 내용이다. 메뉴와 칸의 폭은 `app/(main)/layout.tsx`가 정한다.
 *
 * 제목줄은 내용과 같이 스크롤된다. 뒤로 가기가 있으면 큰 제목 위 한 줄에 `primary` 글자로 선다. 768px 미만은 오른쪽에 더 보기가 서고, 이상은 메뉴 맨 아래에 있다.
 *
 * 카드는 화면이 그린다. 글 하나가 카드 한 장이고 카드 사이는 화면이 `gap-3`으로 둔다.
 * @see docs/DESIGN.md 반응형
 */
export function PageShell({
	title,
	backHref,
	backLabel,
	titleHidden = false,
	children,
}: {
	title: string;
	backHref?: string;
	/** 돌아갈 화면 이름. 없으면 화살표만 서고 이름은 스크린리더용 "뒤로"다 */
	backLabel?: string;
	/** 큰 제목을 스크린리더에만 둔다. 남의 프로필은 이름을 카드에만 쓴다 (docs/DESIGN.md 프로필) */
	titleHidden?: boolean;
	children: ReactNode;
}) {
	return (
		<main className="flex w-full min-w-0 max-w-150 flex-1 flex-col px-3 pb-20 md:px-0 md:pb-10">
			<header className="pt-4 pb-3 md:pt-6 md:pb-4">
				{backHref && (
					// -ml-1.5는 화살표 아이콘 안쪽 여백만큼 당겨 화살표 끝이 제목 글자와 같은 선에 서게 한다
					<Link
						className="-ml-1.5 mb-1 inline-flex items-center gap-0.5 rounded-lg pr-1 text-callout font-semibold text-primary transition duration-(--motion-fast) ease-(--ease-standard) focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary active:scale-97"
						href={backHref}
					>
						<ChevronLeft aria-hidden className="size-5 shrink-0" />
						{backLabel ?? <span className="sr-only">뒤로</span>}
					</Link>
				)}
				<div className="flex items-center gap-1">
					<h1
						className={cn(
							"min-w-0 flex-1 truncate text-large-title text-fg",
							titleHidden && "sr-only",
						)}
					>
						{title}
					</h1>
					<MoreMenu
						className="-mr-2 ml-auto flex size-10 items-center justify-center rounded-full text-fg transition duration-(--motion-fast) ease-(--ease-standard) focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary active:scale-97 md:hidden"
						variant="sheet"
					/>
				</div>
			</header>

			{children}
		</main>
	);
}
