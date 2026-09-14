"use client";

import { Heart, Home, type LucideIcon, Plus, User, Users } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Suspense, use } from "react";
import { MoreMenu } from "@/components/layout/MoreMenu";
import { ComposeButton } from "@/components/post/ComposeButton";
import { BrandMark } from "@/components/ui/BrandMark";
import { Button } from "@/components/ui/Button";
import { DialogTrigger } from "@/components/ui/Dialog";
import { cn } from "@/lib/utils/cn";

// 768 미만 하단 탭 칸, 768 이상 76px 레일 칸(아이콘 위 라벨), 1024 이상 220px 메뉴 줄(아이콘 옆 라벨)
const ITEM =
	"flex flex-1 flex-col items-center justify-center gap-0.5 text-caption text-fg-muted transition duration-(--motion-fast) ease-(--ease-standard) focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-primary active:scale-97 md:h-14 md:w-15 md:flex-none md:rounded-2xl lg:h-auto lg:w-full lg:flex-row lg:justify-start lg:gap-3 lg:px-3.5 lg:py-3 lg:text-body lg:font-medium lg:text-fg";

// 색만으로 말하지 않는다. 굵기가 같이 바뀌고, 메뉴 줄은 면이 선다
const CURRENT =
	"font-bold text-primary lg:bg-canvas lg:font-bold lg:text-fg lg:shadow-card";

const ICON = "size-5.5 shrink-0";

type NavProfile = {
	id: string;
	display_name: string;
	avatar_path: string | null;
} | null;

/**
 * 로그인 뒤 화면의 이동 메뉴. 폭에 따라 셋으로 선다. 값은 `docs/DESIGN.md` 반응형과 탭과 메뉴.
 *
 * - 768px 미만: 화면 아래 탭 다섯 칸. 더 보기는 `PageShell` 제목줄로 간다
 * - 768 ~ 1023px: 왼쪽 76px 레일. 위 로고, 가운데 탭과 같은 다섯 칸, 아래 더 보기
 * - 1024px 이상: 220px 메뉴. 새 글은 네 목적지 아래 채움 버튼으로 옮겨간다
 *
 * 지금 어디인지를 `usePathname`으로 직접 읽는다. 화면마다 prop으로 내려주면
 * 라우트가 늘 때마다 호출부를 전부 고쳐야 하고, 한 곳만 빠뜨려도 조용히 틀린다.
 *
 * 프로필을 모르면 프로필 칸과 새 글 칸을 세우지 않는다. 세션은 있는데 `profiles`
 * 조회가 빌 수 있고, 그때 자리를 채우려고 지어낸 이름은 없는 주소로 가는 링크가 된다.
 * 프로필은 Promise로 받아 그 칸만 기다린다. 결정 0028.
 */
export function SideNav({ profile }: { profile: Promise<NavProfile> }) {
	const pathname = usePathname();

	return (
		<nav
			className={cn(
				"fixed inset-x-0 bottom-0 z-20 flex box-content h-16 border-hairline border-t bg-canvas/94",
				// 허용: 아래 안전영역은 기기 뷰포트에 묶인 값이라 토큰이 없다
				"pb-[env(safe-area-inset-bottom)]",
				"md:sticky md:top-0 md:box-border md:h-dvh md:w-19 md:shrink-0 md:flex-col md:items-center md:border-t-0 md:bg-transparent md:py-4",
				"lg:w-55 lg:items-stretch lg:py-6",
			)}
		>
			<div className="mb-6 max-md:hidden lg:px-3.5">
				<BrandMark size={30} />
			</div>

			<div className="flex flex-1 md:flex-none md:flex-col md:gap-1">
				<NavItem current={pathname === "/"} href="/" icon={Home} label="전체" />
				<NavItem
					current={pathname === "/following"}
					href="/following"
					icon={Users}
					label="팔로잉"
				/>
				<Suspense fallback={<div className="flex-1 md:size-14 lg:hidden" />}>
					<ComposeItem profile={profile} />
				</Suspense>
				<NavItem
					current={pathname === "/likes"}
					href="/likes"
					icon={Heart}
					label="좋아요"
				/>
				<Suspense
					fallback={
						<div className="flex-1 md:h-14 md:w-15 lg:h-12 lg:w-full" />
					}
				>
					<ProfileItem pathname={pathname} profile={profile} />
				</Suspense>
			</div>

			<Suspense>
				<ComposeItem profile={profile} wide />
			</Suspense>

			<MoreMenu
				className={cn(ITEM, "max-md:hidden md:mt-auto")}
				labelClassName=""
				variant="dropdown"
			/>
		</nav>
	);
}

function NavItem({
	href,
	icon: Icon,
	label,
	current,
}: {
	href: string;
	icon: LucideIcon;
	label: string;
	current: boolean;
}) {
	return (
		<Link
			aria-current={current ? "page" : undefined}
			className={cn(ITEM, current && CURRENT)}
			href={href}
		>
			<Icon aria-hidden className={cn(ICON, current && "text-primary")} />
			{label}
		</Link>
	);
}

// 1024 미만은 탭 칸, 이상은 목적지 아래 채움 버튼이다. Tab 순서가 보이는 순서와 같도록 자리마다 따로 둔다
function ComposeItem({
	profile,
	wide = false,
}: {
	profile: Promise<NavProfile>;
	wide?: boolean;
}) {
	const me = use(profile);
	if (!me) return null;

	return (
		<ComposeButton
			authorAvatar={me.avatar_path}
			authorId={me.id}
			authorName={me.display_name}
			trigger={
				wide ? (
					<DialogTrigger asChild>
						<Button className="mt-4 max-lg:hidden" size="lg">
							새 글 쓰기
						</Button>
					</DialogTrigger>
				) : (
					<DialogTrigger className={cn(ITEM, "lg:hidden")}>
						<Plus aria-hidden className={ICON} />새 글
					</DialogTrigger>
				)
			}
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

	const href = `/u/${me.id}`;
	// startsWith만 쓰면 `/u/bobby`가 `/u/bob`의 현재 위치로 잡힌다
	const current = pathname === href || pathname.startsWith(`${href}/`);

	return <NavItem current={current} href={href} icon={User} label="프로필" />;
}
