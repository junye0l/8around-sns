"use client";

import { Home, User, Users } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { MoreMenu } from "@/components/layout/MoreMenu";
import { ComposeButton } from "@/components/post/ComposeButton";

/**
 * 왼쪽 네비 레일. 웹 폭만 맞춘다.
 *
 * 항목은 추천, 새로운 게시글, 프로필, 팔로잉뿐이다. 검색, 알림, 메시지는 범위 밖이라
 * 자리를 만들지 않는다.
 * @see docs/PLAN.md 좁은 폭 대응과 남은 화면
 *
 * 지금 어디인지를 `usePathname`으로 직접 읽는다. 화면마다 prop으로 내려주면
 * 라우트가 늘 때마다 호출부를 전부 고쳐야 하고, 한 곳만 빠뜨려도 조용히 틀린다.
 *
 * 프로필을 모르면 프로필 줄과 글쓰기 줄을 세우지 않는다. 세션은 있는데 `profiles`
 * 조회가 빌 수 있고, 그때 자리를 채우려고 지어낸 이름은 없는 주소로 가는 링크가 된다.
 */
const ROW =
	"flex w-full items-center gap-3 rounded-md px-3 py-3 text-body text-fg transition-colors duration-[var(--motion-fast)] ease-(--ease-standard) hover:bg-background focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-primary";

const CURRENT = "bg-background font-semibold";

export function SideNav({
	profile,
}: {
	profile: { username: string; display_name: string } | null;
}) {
	const pathname = usePathname();
	const profileHref = profile && `/u/${profile.username}`;

	// startsWith만 쓰면 `/u/bobby`가 `/u/bob`의 현재 위치로 잡힌다
	const onProfile =
		profileHref !== null &&
		(pathname === profileHref || pathname.startsWith(`${profileHref}/`));

	return (
		<nav className="fixed inset-y-0 left-0 flex w-60 flex-col border-hairline border-r bg-canvas px-3 py-4">
			<span className="px-3 py-3 text-title text-fg">8around</span>

			<Link
				aria-current={pathname === "/" ? "page" : undefined}
				className={`${ROW} mt-4 ${pathname === "/" ? CURRENT : ""}`}
				href="/"
			>
				<Home aria-hidden className="size-5 shrink-0" />
				추천
			</Link>

			{profile && (
				<ComposeButton authorName={profile.display_name} className={ROW} />
			)}

			{profileHref && (
				<Link
					aria-current={onProfile ? "page" : undefined}
					className={`${ROW} ${onProfile ? CURRENT : ""}`}
					href={profileHref}
				>
					<User aria-hidden className="size-5 shrink-0" />
					프로필
				</Link>
			)}

			<Link
				aria-current={pathname === "/following" ? "page" : undefined}
				className={`${ROW} ${pathname === "/following" ? CURRENT : ""}`}
				href="/following"
			>
				<Users aria-hidden className="size-5 shrink-0" />
				팔로잉
			</Link>

			<div className="mt-auto">
				<p className="truncate px-3 py-2 text-body-sm text-fg-muted">
					@{profile?.username ?? "나"}
				</p>
				<MoreMenu className={ROW} />
			</div>
		</nav>
	);
}
