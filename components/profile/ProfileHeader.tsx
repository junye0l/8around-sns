import Link from "next/link";
import type { ReactNode } from "react";
import { InterestChips } from "@/components/profile/InterestChip";
import { Avatar } from "@/components/ui/Avatar";
import { PILL } from "@/components/ui/CommentCount";
import type { ProfileDetail } from "@/lib/queries/profile";
import { cn } from "@/lib/utils/cn";

/**
 * 팔로워 · 팔로잉 수 알약. 숫자를 굵게 앞에 두고 글자는 `fg`다. 누르면 그 목록으로 간다.
 * 숫자는 `tabular-nums`라 팔로우 한 번에 수가 바뀌어도 옆이 밀리지 않는다.
 */
function CountPill({
	href,
	count,
	label,
}: {
	href: string;
	count: number;
	label: string;
}) {
	return (
		<Link className={cn(PILL, "font-medium text-fg")} href={href}>
			{label}
			<span className="font-bold tabular-nums">{count}</span>
		</Link>
	);
}

/**
 * 프로필 헤더 카드. 아바타 76과 이름, 이름 아래 큰 관심사 칩, 그 아래 전체 폭 소개, 수 알약 둘, 전체 폭 버튼.
 * 소개는 자르지 않는다. 최대 폭 34em이다.
 *
 * 버튼 자리(`action`)와 칩이 비었을 때의 자리(`emptyInterests`)는 부르는 쪽이 채운다.
 * 내 프로필이면 프로필 편집과 관심사 추가, 남의 프로필이면 팔로우 버튼이 온다.
 * @see docs/DESIGN.md 프로필
 */
export function ProfileHeader({
	profile,
	action,
	emptyInterests,
}: {
	profile: ProfileDetail;
	action?: ReactNode;
	/** 관심사가 없을 때 칩 자리에 설 것. 남의 프로필은 비워 칩 줄이 없다 */
	emptyInterests?: ReactNode;
}) {
	const chips =
		profile.interests.length > 0 ? (
			<InterestChips items={profile.interests} />
		) : (
			emptyInterests
		);

	return (
		<section className="rounded-card bg-canvas p-5 shadow-card">
			<div className="flex items-center gap-4">
				<Avatar
					eager
					name={profile.display_name}
					path={profile.avatar_path}
					seed={profile.id}
					size={76}
				/>
				{/* min-w-0 이 없으면 긴 별명이 flex 칸을 밀어내 아바타가 줄어든다 */}
				<div className="min-w-0 flex-1">
					<p className="break-keep text-name text-fg wrap-anywhere">
						{profile.display_name}
					</p>
					{chips && <div className="mt-1.5">{chips}</div>}
				</div>
			</div>

			{profile.bio && (
				<p
					// 허용: 소개 최대 폭 34em은 docs/DESIGN.md 프로필 값이다
					className="mt-4 max-w-[34em] whitespace-pre-line break-keep text-callout text-fg wrap-anywhere"
				>
					{profile.bio}
				</p>
			)}

			<div className="mt-4 flex flex-wrap gap-2">
				<CountPill
					count={profile.follower_count}
					href={`/u/${profile.id}/followers`}
					label="팔로워"
				/>
				<CountPill
					count={profile.following_count}
					href={`/u/${profile.id}/following`}
					label="팔로잉"
				/>
			</div>

			{action && <div className="mt-4">{action}</div>}
		</section>
	);
}
