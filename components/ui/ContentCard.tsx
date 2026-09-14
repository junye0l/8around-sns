import Link from "next/link";
import type { ReactNode } from "react";
import { InterestTag } from "@/components/profile/InterestChip";
import { Avatar } from "@/components/ui/Avatar";
import { formatRelativeTime } from "@/lib/utils/relative-time";

type ContentCardProps = {
	author: {
		id: string;
		display_name: string;
		avatar_path: string | null;
		/** 이름 옆 칩으로 선다. 최대 3개 */
		interests?: string[];
	};
	createdAt: string;
	content: string;
	/** 본문 아래 줄. 좋아요 버튼과 댓글 수가 여기 붙는다 */
	footer?: ReactNode;
	/** 오른쪽 위 모서리. 내 글이면 더보기 메뉴가 여기 선다 */
	menu?: ReactNode;
	/** 카드 전체가 가는 주소 */
	href?: string;
};

/**
 * 글 카드. 글 하나가 카드 한 장이고 카드 전체가 상세로 가는 링크다. 이름, 알약, 더 보기는 각자 누른다.
 *
 * 카드 전체 링크는 카드 뒤에 깐 링크 하나다. 링크 안에 이름 링크, 알약, 더 보기를
 * 넣으면 누를 수 있는 것이 겹쳐 HTML이 깨진다. 면은 누름을 통과시키고(`pointer-events-none`)
 * 각자 누르는 것만 다시 받는다. 링크를 누르는 동안 면이 `scale(.97)`로 줄어든다.
 * 줄 간격 값은 docs/DESIGN.md 글 카드와 작업 중 사용자가 정한 값이다.
 * @see docs/DESIGN.md 글 카드
 */
export function ContentCard({
	author,
	createdAt,
	content,
	footer,
	menu,
	href,
}: ContentCardProps) {
	return (
		<article className="relative">
			{href && (
				<Link
					aria-label={`${author.display_name}님의 글 보기`}
					className="peer absolute inset-0 rounded-card focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
					href={href}
				/>
			)}
			<div className="pointer-events-none relative flex gap-3 rounded-card bg-canvas px-5 py-4 shadow-card transition duration-(--motion-fast) ease-(--ease-standard) peer-active:scale-97">
				<Avatar
					name={author.display_name}
					path={author.avatar_path}
					seed={author.id}
					size={40}
				/>

				<div className="min-w-0 flex-1">
					<div className="flex min-w-0 flex-wrap items-center gap-x-1.5 gap-y-1 text-subhead">
						<Link
							className="pointer-events-auto -m-1 min-w-0 truncate rounded-lg p-1 font-bold text-fg focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
							href={`/u/${author.id}`}
						>
							{author.display_name}
						</Link>
						{author.interests?.slice(0, 3).map((item) => (
							<InterestTag key={item} label={item} />
						))}
						<time className="shrink-0 text-fg-muted" dateTime={createdAt}>
							{formatRelativeTime(createdAt)}
						</time>
						{menu && (
							<div className="pointer-events-auto -my-2 -mr-2 ml-auto">
								{menu}
							</div>
						)}
					</div>

					<p className="mt-0.5 whitespace-pre-line break-keep text-body text-fg wrap-anywhere">
						{content}
					</p>

					{footer && (
						<div className="pointer-events-auto mt-3 flex flex-wrap items-start gap-2">
							{footer}
						</div>
					)}
				</div>
			</div>
		</article>
	);
}
