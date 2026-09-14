"use client";

import {
	type ComponentProps,
	type ReactNode,
	useCallback,
	useState,
} from "react";
import { Composer } from "@/components/ui/Composer";
import { Dialog, DialogContent } from "@/components/ui/Dialog";

export type ComposeDialogProps = Omit<
	ComponentProps<typeof Composer>,
	"onSuccess"
> & {
	/** 모달 제목 */
	title: string;
	/** 모달을 여는 `DialogTrigger`들. 밖에서 열 때는 주지 않는다 */
	trigger?: ReactNode;
	/** 밖에서 여닫을 때만 준다. 주면 열림 상태의 출처가 부르는 쪽으로 넘어간다 */
	open?: boolean;
	onOpenChange?: (open: boolean) => void;
	/** 닫힐 때 포커스를 돌려줄 곳이 트리거가 아닐 때 준다. 밖에서 여는 자리가 쓴다 */
	onCloseAutoFocus?: (event: Event) => void;
};

/**
 * 입력칸을 담은 모달. 새 글, 댓글, 답글이 같이 쓴다
 * ([결정 0018](../../docs/decisions/0018-feed-compose-modal.md) ·
 * [0019](../../docs/decisions/0019-comment-compose-modal.md)).
 *
 * 액션과 문구를 밖에서 받는다. 모달과 입력칸은 여기 하나뿐이라 입력에 붙는 변경은
 * 한 자리에서 끝난다 (규칙 2). 숨은 입력은 `children`으로 넘기면 폼에 같이 실린다.
 *
 * 여는 길이 둘이다. 트리거를 주면 스스로 열고 닫는다. 더보기 메뉴처럼 트리거가 열리는
 * 순간 사라지는 자리에서는 `open`과 `onOpenChange`를 받아 부르는 쪽이 들고 있는다.
 */
export function ComposeDialog({
	title,
	trigger,
	open: openProp,
	onOpenChange,
	onCloseAutoFocus,
	...composer
}: ComposeDialogProps) {
	const [openState, setOpenState] = useState(false);
	const open = openProp ?? openState;
	const setOpen = onOpenChange ?? setOpenState;

	// Composer가 의존성으로 들고 있어서 매 렌더 새 함수를 주면 효과가 다시 돈다.
	// 부르는 쪽은 `useState`의 setter를 그대로 넘겨야 이게 유지된다
	const close = useCallback(() => setOpen(false), [setOpen]);

	return (
		<Dialog onOpenChange={setOpen} open={open}>
			{trigger}

			{/* 기본은 첫 버튼(취소)에 포커스가 간다. 쓰려고 연 창이라 입력칸으로 보낸다 */}
			<DialogContent
				onCloseAutoFocus={onCloseAutoFocus}
				onOpenAutoFocus={(event) => {
					event.preventDefault();
					(event.currentTarget as HTMLElement | null)
						?.querySelector("textarea")
						?.focus();
				}}
				title={title}
			>
				<Composer {...composer} onSuccess={close} />
			</DialogContent>
		</Dialog>
	);
}
