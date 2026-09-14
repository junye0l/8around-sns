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
		/** 새 카드 모양일 때 이름 옆 칩으로 선다 */
		interests?: string[];
	};
	createdAt: string;
	content: string;
	/** 본문 아래 줄. 좋아요 버튼과 댓글 수가 여기 붙는다 */
	footer?: ReactNode;
	/** 오른쪽 위 모서리. 내 글이면 더보기 메뉴가 여기 선다 */
	menu?: ReactNode;
	/**
	 * 아래 칸과 한 스레드로 이어진다. 아바타 밑으로 세로선이 흐르고 구분선은 빠진다.
	 * @see docs/decisions/0008-reply-tree-on-post.md
	 */
	connected?: boolean;
	/**
	 * 새 카드 모양. 글 하나가 카드 한 장이고, `href`를 주면 카드 전체가 그 주소로 가는 링크다.
	 * 리뉴얼 전 한 줄 모양을 쓰는 상세 화면이 리뉴얼 5단계(`docs/PLAN.md`)에서 옮기면 이 갈래를 지운다.
	 */
	card?: boolean;
	href?: string;
};

/**
 * 누군가 쓴 글 한 칸. 게시글과 댓글이 같은 모양이라 하나를 같이 쓴다.
 *
 * 이름과 시간이 한 줄에 왼쪽부터 선다. 시간을 오른쪽 끝으로 밀지 않는다,
 * 눈이 이름에서 본문으로 내려가는 길에 시간이 같이 읽힌다. 레퍼런스(Threads)의 배치다.
 *
 * 목록의 마지막 칸은 바깥 테두리와 겹치므로 아래 선을 뺀다.
 */
export function ContentCard({
	author,
	createdAt,
	content,
	footer,
	menu,
	connected = false,
	card = false,
	href,
}: ContentCardProps) {
	if (card) {
		return (
			<CardSurface
				author={author}
				content={content}
				createdAt={createdAt}
				footer={footer}
				href={href}
				menu={menu}
			/>
		);
	}

	return (
		<article
			className={`flex gap-3 px-4 py-4 md:px-6 ${connected ? "" : "border-hairline border-b last:border-b-0"}`}
		>
			<div className="flex flex-col items-center gap-2">
				<Avatar path={author.avatar_path} />

				{/* 칸 사이가 위아래 패딩 16px씩 = 32px 벌어져 있다. 그만큼 아래로 넘겨야
				    선이 다음 아바타에 닿는다 (`-mb-8`, 4px 그리드 위의 값).
				    위 패딩을 바꾸면 이 값도 같이 바꾼다 */}
				{connected && <div className="-mb-8 w-px flex-1 bg-hairline" />}
			</div>

			{/* min-w-0 이 없으면 긴 이름이 flex 칸을 밀어내 시각이 잘린다 */}
			<div className="min-w-0 flex-1">
				<div className="flex min-w-0 items-baseline gap-2 text-body-sm">
					{/* 이름을 누르면 그 사람의 프로필로 간다. 아바타는 aria-hidden이라
					    링크로 감싸면 이름 없는 링크가 하나 더 생긴다 */}
					<Link
						className="-m-1 min-w-0 truncate rounded-md p-1 font-semibold text-fg transition-colors duration-[var(--motion-fast)] ease-(--ease-standard) hover:bg-background focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
						href={`/u/${author.id}`}
					>
						{author.display_name}
					</Link>
					<time className="shrink-0 text-fg-muted" dateTime={createdAt}>
						{formatRelativeTime(createdAt)}
					</time>

					{/* -my-2 -mr-2 는 아이콘 버튼의 누를 자리(p-2)만큼 되돌린다. 메뉴가 있는 칸과
					    없는 칸의 높이가 같아지고, 아이콘이 카드 오른쪽 여백에 맞춰 선다 */}
					{menu && <div className="-my-2 -mr-2 ml-auto self-start">{menu}</div>}
				</div>

				{/* 줄바꿈은 살리고, 띄어쓰기 없는 긴 문자열은 칸을 넘지 않게 끊는다 */}
				<p className="mt-0.5 whitespace-pre-wrap break-words text-body text-fg">
					{content}
				</p>

				{/* -ml-2 는 아이콘 버튼의 누를 자리(p-2)만큼 되돌려 아이콘이 본문과 같은 선에 서게 한다 */}
				{footer && <div className="-ml-2 mt-1 flex">{footer}</div>}
			</div>
		</article>
	);
}

/*
 * 새 카드 모양. 카드 전체 링크는 카드 뒤에 깐 링크 하나다. 링크 안에 이름 링크, 알약, 더 보기를
 * 넣으면 누를 수 있는 것이 겹쳐 HTML이 깨진다. 면은 누름을 통과시키고(`pointer-events-none`)
 * 각자 누르는 것만 다시 받는다. 링크를 누르는 동안 면이 `scale(.97)`로 줄어든다.
 * 줄 간격 값은 docs/DESIGN.md 글 카드와 작업 중 사용자가 정한 값이다
 */
function CardSurface({
	author,
	createdAt,
	content,
	footer,
	menu,
	href,
}: Omit<ContentCardProps, "card" | "connected">) {
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
