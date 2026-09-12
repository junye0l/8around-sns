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
			{label} <span className="tabular-nums">{count}</span>
		</Link>
	);
}

/**
 * 프로필 맨 위 칸. 왼쪽에 이름과 별명, 오른쪽에 큰 아바타, 그 아래 소개와
 * 팔로워 · 팔로잉 수, 맨 아래 전폭 버튼. 레퍼런스(Threads)의 배치다.
 * 검정 버튼과 여백 치수는 결정 0015를 따른다.
 *
 * 아래 자리는 부르는 쪽이 채운다. 남의 프로필이면 팔로우 버튼이 오고
 * 내 프로필이면 비어 있다 — 이 컴포넌트가 "누가 보고 있는지"를 알 필요가 없다.
 */
export function ProfileHeader({
	profile,
	action,
}: {
	profile: ProfileDetail;
	/** 맨 아래 전폭으로 설 것. 팔로우 버튼이 여기 들어온다 */
	action?: ReactNode;
}) {
	return (
		<section className="border-hairline border-b px-6 py-5">
			<div className="flex items-start gap-4">
				{/* min-w-0 이 없으면 긴 별명이 flex 칸을 밀어내 아바타가 잘린다 */}
				<div className="min-w-0 flex-1">
					<p className="truncate text-title text-fg">{profile.display_name}</p>
					<p className="truncate text-body text-fg">@{profile.username}</p>
				</div>
				{/* 84px. 레퍼런스 프로필 아바타의 관측치이고 4px 그리드 위에 있다. 글자도 같이 키운다 */}
				<Avatar className="size-21 text-title" name={profile.display_name} />
			</div>

			{profile.bio && (
				<p className="mt-3 whitespace-pre-wrap break-words text-body text-fg">
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

			{action && <div className="mt-4">{action}</div>}
		</section>
	);
}
