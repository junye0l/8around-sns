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
 * 레일 맨 아래 "더 보기". 지금 들어 있는 것은 로그아웃 하나다.
 *
 * 항목이 하나뿐인데 메뉴로 감싸는 이유는 여기가 설정이 쌓일 자리이기 때문이다.
 * 로그아웃이 레일에 그냥 나와 있으면 항목이 늘 때마다 레일이 길어진다.
 *
 * 로그아웃만 빨강이다. 되돌리려면 다시 로그인해야 한다.
 */
export function MoreMenu({ className }: { className: string }) {
	return (
		<DropdownMenu>
			<DropdownMenuTrigger className={className}>
				<Menu aria-hidden className="size-6 shrink-0" />
				<span className="sr-only">더 보기</span>
			</DropdownMenuTrigger>

			<DropdownMenuContent>
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
