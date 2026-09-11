import { Home, LogOut } from "lucide-react";
import { signOutAction } from "@/lib/actions/auth";

/**
 * 왼쪽 네비 레일. 웹 폭만 맞춘다.
 *
 * 항목은 추천과 로그아웃뿐이다. 검색, 알림, 메시지는 범위 밖이라 자리를 만들지 않는다.
 * @see docs/PLAN.md 좁은 폭 대응과 남은 화면
 */
const ROW =
	"flex w-full items-center gap-3 rounded-md px-3 py-3 text-body text-fg transition-colors duration-[var(--motion-fast)] ease-(--ease-standard) hover:bg-background";

export function SideNav({ username }: { username: string }) {
	return (
		<nav className="fixed inset-y-0 left-0 flex w-60 flex-col border-hairline border-r bg-canvas px-3 py-4">
			<span className="px-3 py-3 text-title text-fg">8around</span>

			{/* 지금 갈 수 있는 곳이 여기뿐이라 링크가 아니라 현재 위치 표시다 */}
			<span
				aria-current="page"
				className={`${ROW} mt-4 bg-background font-semibold`}
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
