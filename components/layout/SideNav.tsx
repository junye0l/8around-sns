"use client";

import { Home, User, Users } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Suspense, use } from "react";
import { MoreMenu } from "@/components/layout/MoreMenu";
import { ComposeButton } from "@/components/post/ComposeButton";
import { BrandMark } from "@/components/ui/BrandMark";

/**
 * 왼쪽 아이콘 레일. 로고가 위, 항목이 가운데, 더 보기가 아래다. 웹 폭만 맞춘다.
 *
 * 항목은 추천, 새로운 게시글, 팔로잉, 프로필뿐이다. 검색, 알림, 메시지는 범위 밖이라
 * 자리를 만들지 않는다.
 * @see docs/PLAN.md 좁은 폭 대응과 남은 화면
 *
 * 문구는 `sr-only`다. 지금 어디인지는 아이콘 색이 말한다, 회색이 기본이고 검정이 현재다.
 * 결정 0015. 마우스를 올리거나 키보드 포커스가 들어오면 레일이 240px로 넓어지며 문구가
 * 아이콘 오른쪽에 나온다. 흐름 밖(`fixed`)이라 컬럼은 밀리지 않고 위를 덮는다.
 *
 * 지금 어디인지를 `usePathname`으로 직접 읽는다. 화면마다 prop으로 내려주면
 * 라우트가 늘 때마다 호출부를 전부 고쳐야 하고, 한 곳만 빠뜨려도 조용히 틀린다.
 *
 * 프로필을 모르면 프로필 줄과 글쓰기 줄을 세우지 않는다. 세션은 있는데 `profiles`
 * 조회가 빌 수 있고, 그때 자리를 채우려고 지어낸 이름은 없는 주소로 가는 링크가 된다.
 *
 * 프로필은 Promise로 받아 그 두 줄만 기다린다. 기다리는 동안 같은 크기의 빈칸을 두어
 * 가운데 정렬된 다른 아이콘이 움직이지 않는다. 결정 0028.
 */
// px-3은 접힌 48px 칸에서 24px 아이콘을 가운데 놓는 값이라 펼칠 때 정렬 클래스를 바꾸지 않는다
const ITEM =
	"flex size-12 items-center gap-3 rounded-lg px-3 text-fg-muted transition-colors duration-[var(--motion-fast)] ease-(--ease-standard) hover:bg-background hover:text-fg focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary group-hover:w-full group-has-focus-visible:w-full";

// focus-within이 아니라 has-focus-visible이다. 마우스 클릭도 링크에 포커스를 남겨서 레일이 안 접힌다
const LABEL =
	"sr-only group-hover:not-sr-only group-hover:whitespace-nowrap group-has-focus-visible:not-sr-only group-has-focus-visible:whitespace-nowrap";

const CURRENT = "text-fg";

type NavProfile = { username: string; display_name: string } | null;

export function SideNav({ profile }: { profile: Promise<NavProfile> }) {
	const pathname = usePathname();

	return (
		<nav className="group fixed inset-y-0 left-0 z-20 flex w-19 flex-col overflow-hidden px-3.5 py-4 text-body transition-all duration-[var(--motion-fast)] ease-(--ease-standard) hover:w-60 hover:bg-background has-focus-visible:w-60 has-focus-visible:bg-background">
			<BrandMark />

			<div className="my-auto flex flex-col gap-2">
				<Link
					aria-current={pathname === "/" ? "page" : undefined}
					className={`${ITEM} ${pathname === "/" ? CURRENT : ""}`}
					href="/"
				>
					<Home aria-hidden className="size-6 shrink-0" />
					<span className={LABEL}>추천</span>
				</Link>

				<Suspense fallback={<div className="size-12" />}>
					<ComposeItem profile={profile} />
				</Suspense>

				<Link
					aria-current={pathname === "/following" ? "page" : undefined}
					className={`${ITEM} ${pathname === "/following" ? CURRENT : ""}`}
					href="/following"
				>
					<Users aria-hidden className="size-6 shrink-0" />
					<span className={LABEL}>팔로잉</span>
				</Link>

				<Suspense fallback={<div className="size-12" />}>
					<ProfileItem pathname={pathname} profile={profile} />
				</Suspense>
			</div>

			<MoreMenu className={ITEM} labelClassName={LABEL} />
		</nav>
	);
}

function ComposeItem({ profile }: { profile: Promise<NavProfile> }) {
	const me = use(profile);
	if (!me) return null;

	return (
		<ComposeButton
			authorName={me.display_name}
			className={`${ITEM} bg-background`}
			labelClassName={LABEL}
		/>
	);
}

function ProfileItem({
	profile,
	pathname,
}: {
	profile: Promise<NavProfile>;
	pathname: string;
}) {
	const me = use(profile);
	if (!me) return null;

	const href = `/u/${me.username}`;
	// startsWith만 쓰면 `/u/bobby`가 `/u/bob`의 현재 위치로 잡힌다
	const current = pathname === href || pathname.startsWith(`${href}/`);

	return (
		<Link
			aria-current={current ? "page" : undefined}
			className={`${ITEM} ${current ? CURRENT : ""}`}
			href={href}
		>
			<User aria-hidden className="size-6 shrink-0" />
			<span className={LABEL}>프로필</span>
		</Link>
	);
}
