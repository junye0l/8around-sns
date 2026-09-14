"use client";

import { LogOut, Menu } from "lucide-react";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from "@/components/ui/DropdownMenu";
import { signOutAction } from "@/lib/actions/auth";

/**
 * "더 보기". 레일 맨 아래에, 모바일에서는 `PageShell` 제목줄 오른쪽에 선다. 지금 들어 있는 것은 로그아웃 하나다.
 *
 * 항목이 하나뿐인데 메뉴로 감싸는 이유는 여기가 설정이 쌓일 자리이기 때문이다.
 * 로그아웃이 레일에 그냥 나와 있으면 항목이 늘 때마다 레일이 길어진다.
 *
 * 로그아웃만 빨강이다. 되돌리려면 다시 로그인해야 한다.
 */
export function MoreMenu({
	className,
	labelClassName,
	side,
}: {
	className: string;
	labelClassName: string;
	/** 레일에서는 기본값(오른쪽), 모바일 제목줄에서는 아래로 연다 */
	side?: "right" | "bottom";
}) {
	return (
		<DropdownMenu>
			<DropdownMenuTrigger className={className}>
				<Menu aria-hidden className="size-6 shrink-0" />
				<span className={labelClassName}>더 보기</span>
			</DropdownMenuTrigger>

			<DropdownMenuContent side={side}>
				{/* 서버 액션을 폼으로 부른다. radix가 항목을 div로 그리므로 버튼을 안에 둔다 */}
				<form action={signOutAction}>
					{/* 선택 시 메뉴가 닫히면 폼이 언마운트돼 브라우저가 제출을 취소한다. 리다이렉트가 닫는다 */}
					<DropdownMenuItem
						asChild
						danger
						onSelect={(event) => event.preventDefault()}
					>
						<button className="w-full" type="submit">
							<LogOut aria-hidden className="size-5 shrink-0" />
							로그아웃
						</button>
					</DropdownMenuItem>
				</form>
			</DropdownMenuContent>
		</DropdownMenu>
	);
}
