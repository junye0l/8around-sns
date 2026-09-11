import { Home, LogOut } from "lucide-react";
import { signOutAction } from "@/lib/actions/auth";

/**
 * 왼쪽 네비 레일.
 *
 * 지금은 웹 폭만 맞춘다. 태블릿·모바일은 `docs/PLAN.md` §7에 따로 세워뒀다 —
 * 폭마다 분기를 먼저 깔면 레이아웃이 바뀔 때마다 두 벌을 고치게 된다.
 *
 * 지금 들어갈 수 있는 항목은 추천과 로그아웃뿐이다. 검색·알림·메시지는
 * `AGENTS.md` 범위 밖이라 자리만 만들어두지 않는다 — 눌러도 아무 일이 없는
 * 메뉴는 없는 메뉴보다 나쁘다. 팔로잉 피드와 프로필이 `docs/PLAN.md` §5에서 이 자리를 채운다.
 */
const ROW =
	"flex w-full items-center gap-3 rounded-md px-3 py-3 text-body text-fg transition-colors duration-[var(--motion-fast)] ease-(--ease-standard) hover:bg-surface";

export function SideNav({ username }: { username: string }) {
	return (
		<nav className="fixed inset-y-0 left-0 flex w-60 flex-col border-hairline border-r bg-canvas px-3 py-4">
			<span className="px-3 py-3 text-title text-fg">8around</span>

			{/* 지금 갈 수 있는 곳이 여기뿐이라 링크가 아니라 현재 위치 표시다 */}
			<span
				aria-current="page"
				className={`${ROW} mt-4 bg-surface font-semibold`}
			>
				<Home aria-hidden className="size-5 shrink-0" />
				추천
			</span>

			<div className="mt-auto">
				<p className="truncate px-3 py-2 text-body-sm text-fg-muted">
					@{username}
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
