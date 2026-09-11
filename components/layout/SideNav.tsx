"use client";

import { Home, LogOut, User } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOutAction } from "@/lib/actions/auth";

/**
 * 왼쪽 네비 레일. 웹 폭만 맞춘다.
 *
 * 항목은 추천, 프로필, 로그아웃뿐이다. 검색, 알림, 메시지는 범위 밖이라 자리를 만들지 않는다.
 * @see docs/PLAN.md 좁은 폭 대응과 남은 화면
 *
 * 지금 어디인지를 `usePathname`으로 직접 읽는다. 화면마다 prop으로 내려주면
 * 라우트가 늘 때마다 호출부를 전부 고쳐야 하고, 한 곳만 빠뜨려도 조용히 틀린다.
 *
 * 별명을 모르면 프로필 줄을 세우지 않는다. 세션은 있는데 `profiles` 조회가 빌 수
 * 있고, 그때 자리를 채우려고 지어낸 이름은 없는 주소로 가는 링크가 된다.
 */
const ROW =
	"flex w-full items-center gap-3 rounded-md px-3 py-3 text-body text-fg transition-colors duration-[var(--motion-fast)] ease-(--ease-standard) hover:bg-background focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-primary";

const CURRENT = "bg-background font-semibold";

export function SideNav({ username }: { username: string | null }) {
	const pathname = usePathname();
	const profileHref = username && `/u/${username}`;

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

			<div className="mt-auto">
				<p className="truncate px-3 py-2 text-body-sm text-fg-muted">
					@{username ?? "나"}
				</p>
				<form action={signOutAction}>
					<button className={ROW} type="submit">
						<LogOut aria-hidden className="size-5 shrink-0" />
						로그아웃
					</button>
				</form>
			</div>
		</nav>
	);
}
