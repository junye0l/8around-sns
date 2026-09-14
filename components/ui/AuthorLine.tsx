import Link from "next/link";
import type { ReactNode } from "react";
import { InterestTag } from "@/components/profile/InterestChip";
import { Avatar } from "@/components/ui/Avatar";
import { formatRelativeTime } from "@/lib/utils/relative-time";

/**
 * 작성자 머리 한 줄. 아바타 32, 이름, 관심사 칩 최대 3, 시각, 오른쪽 더 보기.
 * 게시글 상세의 원글 카드와 댓글 상세의 맥락 카드가 같이 쓴다 (규칙 2).
 * @see docs/DESIGN.md 게시글 상세
 */
export function AuthorLine({
	author,
	createdAt,
	menu,
}: {
	author: {
		id: string;
		display_name: string;
		avatar_path: string | null;
		interests?: string[];
	};
	createdAt: string;
	/** 내 것이면 더 보기 메뉴 */
	menu?: ReactNode;
}) {
	return (
		<div className="flex min-w-0 items-center gap-2">
			<Avatar
				name={author.display_name}
				path={author.avatar_path}
				seed={author.id}
				size={32}
			/>
			<div className="flex min-w-0 flex-1 flex-wrap items-center gap-x-1.5 gap-y-1 text-subhead">
				<Link
					className="-m-1 min-w-0 truncate rounded-lg p-1 font-bold text-fg focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
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
			</div>
			{menu && <div className="-my-2 -mr-2 shrink-0">{menu}</div>}
		</div>
	);
}
