import Link from "next/link";
import type { ReactNode } from "react";
import { Avatar } from "@/components/ui/Avatar";
import type { ProfileDetail } from "@/lib/queries/profile";

/**
 * 수를 누르면 그 목록으로 간다. 팔로워와 팔로잉이 같은 모양이라 하나를 같이 쓴다.
 * 링크가 아니라 버튼처럼 보이지 않게 파랑을 쓰지 않는다 — 파랑은 동작에만 칠한다.
 *
 * 숫자는 `tabular-nums`로 고정폭을 쓴다. 폰트 스택이 실제로 집는 SF는 기본 숫자가
 * 비례폭이라 `1`이 `9`보다 좁고, 팔로우 한 번에 수가 0에서 1로 바뀌면 그 차이만큼
 * 옆 글자와 다음 링크가 밀렸다. 자릿수가 같으면 이제 아무것도 움직이지 않는다.
 */
function CountLink({
	href,
	count,
	label,
}: {
	href: string;
	count: number;
	label: string;
}) {
	return (
		<Link
			// 누를 자리를 넓히되 -m-2 로 되돌려서 줄 간격은 그대로 둔다
			className="-m-2 rounded-md p-2 text-body-sm text-fg-muted transition-colors duration-[var(--motion-fast)] ease-(--ease-standard) hover:bg-background hover:text-fg focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
			href={href}
		>
			<span className="font-semibold text-fg tabular-nums">{count}</span>{" "}
			{label}
		</Link>
	);
}

/**
 * 프로필 맨 위 칸. 이름, 별명, 소개, 팔로워 · 팔로잉 수가 선다.
 *
 * 오른쪽 자리는 부르는 쪽이 채운다. 남의 프로필이면 팔로우 버튼이 오고
 * 내 프로필이면 비어 있다 — 이 컴포넌트가 "누가 보고 있는지"를 알 필요가 없다.
 */
export function ProfileHeader({
	profile,
	action,
}: {
	profile: ProfileDetail;
	/** 오른쪽 위에 설 것. 팔로우 버튼이 여기 들어온다 */
	action?: ReactNode;
}) {
	return (
		<section className="flex gap-3 border-hairline border-b p-4">
			<Avatar name={profile.display_name} />

			{/* min-w-0 이 없으면 긴 별명이 flex 칸을 밀어내 시각이 잘린다 */}
			<div className="min-w-0 flex-1">
				<div className="flex items-start gap-4">
					<div className="min-w-0 flex-1">
						<p className="truncate text-body font-semibold text-fg">
							{profile.display_name}
						</p>
						<p className="truncate text-body-sm text-fg-muted">
							@{profile.username}
						</p>
					</div>
					{action}
				</div>

				{profile.bio && (
					<p className="mt-2 whitespace-pre-wrap break-words text-body text-fg">
						{profile.bio}
					</p>
				)}

				<div className="mt-3 flex gap-6">
					<CountLink
						count={profile.follower_count}
						href={`/u/${profile.username}/followers`}
						label="팔로워"
					/>
					<CountLink
						count={profile.following_count}
						href={`/u/${profile.username}/following`}
						label="팔로잉"
					/>
				</div>
			</div>
		</section>
	);
}
