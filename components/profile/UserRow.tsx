import Link from "next/link";
import { Avatar } from "@/components/ui/Avatar";
import type { FollowUser } from "@/lib/queries/follow";

/**
 * 사람 목록의 한 줄. 누르면 그 사람의 프로필로 간다.
 * 팔로워와 팔로잉 두 화면이 같은 모양이라 하나를 같이 쓴다 (규칙 2).
 *
 * 줄 안에 팔로우 버튼을 두지 않는다. 팔로우는 프로필 화면에서 한다 — 목록마다
 * 버튼을 세우면 같은 동작이 두 곳에 생기고, 목록은 "누가 있는지"만 답하면 된다.
 *
 * `li`로 나오므로 부르는 쪽이 `ul`로 감싼다. 목록을 목록으로 읽어야 스크린리더가
 * 항목 수를 알려주고 항목 단위로 건너뛴다.
 */
export function UserRow({ user }: { user: FollowUser }) {
	return (
		<li className="border-hairline border-b last:border-b-0">
			<Link
				className="flex gap-3 px-6 py-3 transition-colors duration-[var(--motion-fast)] ease-(--ease-standard) hover:bg-background focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-primary"
				href={`/u/${user.username}`}
			>
				<Avatar name={user.display_name} />

				{/* min-w-0 이 없으면 긴 별명이 flex 칸을 밀어내 시각이 잘린다 */}
				<div className="min-w-0 flex-1">
					<p className="truncate text-body-sm font-semibold text-fg">
						{user.display_name}
					</p>
					<p className="truncate text-body-sm text-fg-muted">
						@{user.username}
					</p>
					{user.bio && (
						<p className="mt-1 line-clamp-2 break-words text-body-sm text-fg">
							{user.bio}
						</p>
					)}
				</div>
			</Link>
		</li>
	);
}
