import Link from "next/link";
import type { ProfileDetail } from "@/lib/queries/profile";

const TAB =
	"flex-1 border-b-2 py-3 text-center text-body-sm font-semibold transition-colors duration-[var(--motion-fast)] ease-(--ease-standard) hover:text-fg focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-primary";

/**
 * 팔로워 · 팔로잉 목록 맨 위의 두 칸. 지금 보는 쪽은 아래 선이 검정이다.
 *
 * ARIA 탭이 아니라 링크 둘이다. 각 목록이 자기 라우트를 가지므로(결정 0011) 패널을
 * 바꿔 끼우는 것이 아니라 화면을 옮기는 것이고, 그건 링크가 맞다. 키보드도 링크가 안다.
 */
export function FollowTabs({
	profile,
	current,
}: {
	profile: Pick<
		ProfileDetail,
		"username" | "follower_count" | "following_count"
	>;
	current: "followers" | "following";
}) {
	const tabs = [
		{ key: "followers", label: "팔로워", count: profile.follower_count },
		{ key: "following", label: "팔로잉", count: profile.following_count },
	] as const;

	return (
		<nav aria-label="팔로우 목록" className="flex">
			{tabs.map((tab) => {
				const on = tab.key === current;
				return (
					<Link
						aria-current={on ? "page" : undefined}
						className={`${TAB} ${on ? "border-fg text-fg" : "border-hairline text-fg-muted"}`}
						href={`/u/${profile.username}/${tab.key}`}
						key={tab.key}
					>
						{tab.label} <span className="tabular-nums">{tab.count}</span>
					</Link>
				);
			})}
		</nav>
	);
}
