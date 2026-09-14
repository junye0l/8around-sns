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
 * `card`면 내용을 카드 한 장에 담는다. 리뉴얼 전 화면이 흰 면 하나를 전제로 구분선을 긋기 때문이다.
 * 화면을 글 카드로 나누는 단계(`docs/PLAN.md` 리뉴얼 4~6단계)가 `card={false}`로 옮기고, 다 옮기면 이 갈래를 지운다.
 * @see docs/DESIGN.md 반응형
 */
export function PageShell({
	title,
	backHref,
	backLabel,
	card = true,
	children,
}: {
	title: string;
	backHref?: string;
	/** 돌아갈 화면 이름. 없으면 화살표만 서고 이름은 스크린리더용 "뒤로"다 */
	backLabel?: string;
	card?: boolean;
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
					<h1 className="min-w-0 flex-1 truncate text-large-title text-fg">
						{title}
					</h1>
					<MoreMenu
						className="-mr-2 flex size-10 items-center justify-center rounded-full text-fg transition duration-(--motion-fast) ease-(--ease-standard) focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary active:scale-97 md:hidden"
						variant="sheet"
					/>
				</div>
			</header>

			<div
				className={cn(
					"flex flex-1 flex-col",
					card && "overflow-hidden rounded-card bg-canvas shadow-card",
				)}
			>
				{children}
			</div>
		</main>
	);
}
