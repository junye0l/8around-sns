"use client";

import { Home, User, Users } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { MoreMenu } from "@/components/layout/MoreMenu";
import { ComposeButton } from "@/components/post/ComposeButton";

/**
 * 왼쪽 아이콘 레일. 로고가 위, 항목이 가운데, 더 보기가 아래다. 웹 폭만 맞춘다.
 *
 * 항목은 추천, 새로운 게시글, 팔로잉, 프로필뿐이다. 검색, 알림, 메시지는 범위 밖이라
 * 자리를 만들지 않는다.
 * @see docs/PLAN.md 좁은 폭 대응과 남은 화면
 *
 * 문구는 `sr-only`다. 지금 어디인지는 아이콘 색이 말한다, 회색이 기본이고 검정이 현재다.
 * 결정 0015.
 *
 * 지금 어디인지를 `usePathname`으로 직접 읽는다. 화면마다 prop으로 내려주면
 * 라우트가 늘 때마다 호출부를 전부 고쳐야 하고, 한 곳만 빠뜨려도 조용히 틀린다.
 *
 * 프로필을 모르면 프로필 줄과 글쓰기 줄을 세우지 않는다. 세션은 있는데 `profiles`
 * 조회가 빌 수 있고, 그때 자리를 채우려고 지어낸 이름은 없는 주소로 가는 링크가 된다.
 */
const ITEM =
	"flex size-12 items-center justify-center rounded-lg text-fg-muted transition-colors duration-[var(--motion-fast)] ease-(--ease-standard) hover:bg-background hover:text-fg focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary";

const CURRENT = "text-fg";

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
		<nav className="fixed inset-y-0 left-0 z-20 flex w-19 flex-col items-center py-4">
			<span className="flex size-12 items-center justify-center text-title text-fg">
				8
			</span>

			<div className="my-auto flex flex-col gap-2">
				<Link
					aria-current={pathname === "/" ? "page" : undefined}
					className={`${ITEM} ${pathname === "/" ? CURRENT : ""}`}
					href="/"
				>
					<Home aria-hidden className="size-6 shrink-0" />
					<span className="sr-only">추천</span>
				</Link>

				{profile && (
					<ComposeButton
						authorName={profile.display_name}
						className={`${ITEM} bg-background`}
					/>
				)}

				<Link
					aria-current={pathname === "/following" ? "page" : undefined}
					className={`${ITEM} ${pathname === "/following" ? CURRENT : ""}`}
					href="/following"
				>
					<Users aria-hidden className="size-6 shrink-0" />
					<span className="sr-only">팔로잉</span>
				</Link>

				{profileHref && (
					<Link
						aria-current={onProfile ? "page" : undefined}
						className={`${ITEM} ${onProfile ? CURRENT : ""}`}
						href={profileHref}
					>
						<User aria-hidden className="size-6 shrink-0" />
						<span className="sr-only">프로필</span>
					</Link>
				)}
			</div>

			<MoreMenu className={ITEM} />
		</nav>
	);
}
