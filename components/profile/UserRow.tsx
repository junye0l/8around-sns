import Link from "next/link";
import { FollowButton } from "@/components/follow/FollowButton";
import { Avatar } from "@/components/ui/Avatar";
import { GROUP_ROW } from "@/components/ui/GroupList";
import type { FollowUser } from "@/lib/queries/follow";

/**
 * 사람 목록의 한 행. 아바타 36, 이름, 소개 한 줄, 오른쪽 팔로우 버튼. 행 전체가 그 사람의 프로필 링크다.
 * 팔로워와 팔로잉 두 화면이 같은 모양이라 하나를 같이 쓴다 (규칙 2).
 *
 * 링크 안에 버튼을 넣을 수 없어 링크를 행 뒤에 깔고 버튼만 누름을 다시 받는다 (`components/ui/ContentCard.tsx`와 같다).
 * 내 행에는 버튼이 없다. 소개가 없으면 이름만 세로 가운데에 선다.
 *
 * `li`로 나오므로 부르는 쪽이 `GroupList`에 넣는다. 결정 0012.
 * @see docs/DESIGN.md 팔로워 · 팔로잉
 */
export function UserRow({
	user,
	following,
	isMe,
}: {
	user: FollowUser;
	/** 보는 사람이 이 사람을 팔로우 중인가 */
	following: boolean;
	isMe: boolean;
}) {
	return (
		<li className="relative">
			<Link
				aria-label={user.display_name}
				className="absolute inset-0 focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-primary"
				href={`/u/${user.id}`}
			/>
			<div
				className={`pointer-events-none relative flex items-center gap-3 ${GROUP_ROW}`}
			>
				<Avatar
					name={user.display_name}
					path={user.avatar_path}
					seed={user.id}
					size={36}
				/>
				<div className="min-w-0 flex-1">
					<p className="truncate text-callout font-bold text-fg">
						{user.display_name}
					</p>
					{user.bio && (
						<p className="line-clamp-1 break-keep text-subhead font-normal text-fg-muted wrap-anywhere">
							{user.bio}
						</p>
					)}
				</div>
				{!isMe && (
					<div className="pointer-events-auto shrink-0">
						<FollowButton following={following} size="sm" targetId={user.id} />
					</div>
				)}
			</div>
		</li>
	);
}
