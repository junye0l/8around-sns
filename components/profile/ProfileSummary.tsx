import Link from "next/link";
import { InterestChips } from "@/components/profile/InterestChip";
import { Avatar } from "@/components/ui/Avatar";
import { PILL_BASE } from "@/components/ui/CommentCount";
import { getProfile } from "@/lib/queries/profile";
import { createClient } from "@/lib/supabase/server";
import { cn } from "@/lib/utils/cn";

/**
 * 1280px 이상 오른쪽 칸의 내 프로필 요약. 카드 한 장 전체가 내 프로필 링크라 안의 알약은 누를 수 없는 모양이다.
 * 소개는 3줄에서 자르고 "더 보기"를 두지 않는다.
 *
 * 뼈대가 가진 id로 소개, 관심사, 수를 따로 읽는다. 뼈대가 기다리지 않도록 `Suspense` 안에서 그린다.
 * 위를 가운데 칸 제목줄 높이만큼 비워 첫 카드와 윗선을 맞춘다.
 * @see docs/DESIGN.md 내 프로필 요약
 */
export async function ProfileSummary({
	me,
}: {
	me: Promise<{ id: string } | null>;
}) {
	const viewer = await me;
	if (!viewer) return null;

	const profile = await getProfile(await createClient(), viewer.id);
	if (!profile) return null;

	return (
		<Link
			className="block rounded-card bg-canvas p-5 shadow-card transition duration-(--motion-fast) ease-(--ease-standard) focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary active:scale-97"
			href={`/u/${profile.id}`}
		>
			<div className="flex items-center gap-3">
				<Avatar
					name={profile.display_name}
					path={profile.avatar_path}
					seed={profile.id}
					size={40}
				/>
				<p className="min-w-0 truncate text-callout font-bold text-fg">
					{profile.display_name}
				</p>
			</div>

			{profile.bio && (
				<p className="mt-3 line-clamp-3 whitespace-pre-line break-keep text-subhead font-normal text-fg wrap-anywhere">
					{profile.bio}
				</p>
			)}

			<div className="mt-3 flex flex-wrap gap-2">
				<span className={cn(PILL_BASE, "font-medium text-fg")}>
					팔로워
					<span className="font-bold tabular-nums">
						{profile.follower_count}
					</span>
				</span>
				<span className={cn(PILL_BASE, "font-medium text-fg")}>
					팔로잉
					<span className="font-bold tabular-nums">
						{profile.following_count}
					</span>
				</span>
			</div>

			{profile.interests.length > 0 && (
				<>
					<p className="mt-4 mb-2 text-footnote font-semibold text-fg-muted">
						내 관심사
					</p>
					<InterestChips items={profile.interests} />
				</>
			)}
		</Link>
	);
}
