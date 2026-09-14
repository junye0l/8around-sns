"use client";

import {
	type ReactNode,
	type RefObject,
	useCallback,
	useEffect,
	useId,
	useRef,
	useState,
} from "react";
import { Button } from "@/components/ui/Button";
import { Composer } from "@/components/ui/Composer";
import {
	ConfirmContent,
	Dialog,
	DialogShell,
	Sheet,
	SheetHeader,
} from "@/components/ui/Dialog";
import { useSubmitAction } from "@/hooks/useSubmitAction";

type ComposerResult = { ok: true } | { ok: false; error: string };

export type ComposeDialogProps = {
	/** 시트 제목 */
	title: string;
	action: (
		prev: ComposerResult | null,
		formData: FormData,
	) => Promise<ComposerResult>;
	authorName: string;
	authorAvatar?: string | null;
	/** 사진 없는 아바타의 톤을 고르는 사용자 id. 글 카드와 같은 톤이 된다 */
	authorId?: string;
	placeholder: string;
	/** 머리 오른쪽 보내기 버튼의 글자 */
	submitLabel: string;
	maxLength: number;
	/** 처음 채워둘 본문. 수정할 때 지금 글이 여기로 들어온다 */
	initialContent?: string;
	/** 액션에 같이 보낼 숨은 입력 */
	children?: ReactNode;
	/** 시트를 여는 `DialogTrigger`들. 밖에서 열 때는 주지 않는다 */
	trigger?: ReactNode;
	/** 밖에서 여닫을 때만 준다. 주면 열림 상태의 출처가 부르는 쪽으로 넘어간다 */
	open?: boolean;
	onOpenChange?: (open: boolean) => void;
	/** 닫힐 때 포커스를 돌려줄 곳이 트리거가 아닐 때 준다. 밖에서 여는 자리가 쓴다 */
	onCloseAutoFocus?: (event: Event) => void;
};

/**
 * 글쓰기 시트. 새 글, 수정, 댓글, 답글이 같이 쓴다
 * ([결정 0018](../../docs/decisions/0018-feed-compose-modal.md) ·
 * [0019](../../docs/decisions/0019-comment-compose-modal.md)).
 * 768px 미만은 바텀 시트, 이상은 가운데 모달이다. 머리 왼쪽 취소, 가운데 제목, 오른쪽 보내기.
 *
 * 공백뿐이거나 처음 값과 같으면 보내기가 꺼진다 (결정 0042). 보내는 중에는 입력이 읽기 전용이고 취소가 꺼진다.
 * 실패하면 시트를 닫지 않고 입력칸 아래에 문구를 띄운다.
 *
 * 보낼 수 있는 상태에서 닫으려 하면(취소, 바깥 누르기, Esc, 끌어내리기) 버릴지 묻는다.
 * 보내는 중에는 닫기 자체를 막는다. 결정 0044.
 *
 * 여는 길이 둘이다. 트리거를 주면 스스로 열고 닫는다. 더보기 메뉴처럼 트리거가 열리는
 * 순간 사라지는 자리에서는 `open`과 `onOpenChange`를 받아 부르는 쪽이 들고 있는다.
 * @see docs/DESIGN.md 글쓰기 시트
 */
export function ComposeDialog({
	title,
	trigger,
	open: openProp,
	onOpenChange,
	onCloseAutoFocus,
	...body
}: ComposeDialogProps) {
	const [openState, setOpenState] = useState(false);
	const open = openProp ?? openState;
	const setOpen = onOpenChange ?? setOpenState;
	const [confirming, setConfirming] = useState(false);
	// 본문이 열릴 때마다 새로 마운트돼 입력과 결과가 저절로 비워진다. 닫을지 가르는 데 필요한 두 값만 여기로 올린다
	const guard = useRef({ canSubmit: false, pending: false });

	const requestOpenChange = (next: boolean) => {
		if (next) return setOpen(true);
		if (guard.current.pending) return;
		if (guard.current.canSubmit) return setConfirming(true);
		setOpen(false);
	};

	const close = useCallback(() => setOpen(false), [setOpen]);

	return (
		<Sheet onOpenChange={requestOpenChange} open={open}>
			{trigger}

			<DialogShell
				aria-describedby={undefined}
				// 안쪽 좌우 여백 16px씩을 더해 면이 560px이다 (docs/DESIGN.md 글쓰기 시트)
				className="top-24 max-w-148"
				onCloseAutoFocus={onCloseAutoFocus}
				// 기본은 첫 버튼(취소)에 포커스가 간다. 쓰려고 연 창이라 입력칸으로 보낸다
				onOpenAutoFocus={(event) => {
					event.preventDefault();
					(event.currentTarget as HTMLElement | null)
						?.querySelector("textarea")
						?.focus();
				}}
				variant="sheet"
			>
				<ComposeBody
					{...body}
					guard={guard}
					onCancel={() => requestOpenChange(false)}
					onSuccess={close}
					title={title}
				/>
			</DialogShell>

			<DiscardDialog
				onDiscard={() => {
					setConfirming(false);
					setOpen(false);
				}}
				onOpenChange={setConfirming}
				open={confirming}
			/>
		</Sheet>
	);
}

function ComposeBody({
	title,
	action,
	submitLabel,
	initialContent = "",
	children,
	guard,
	onCancel,
	onSuccess,
	...composer
}: Omit<
	ComposeDialogProps,
	"trigger" | "open" | "onOpenChange" | "onCloseAutoFocus"
> & {
	guard: RefObject<{ canSubmit: boolean; pending: boolean }>;
	onCancel: () => void;
	onSuccess: () => void;
}) {
	const [result, formAction, pending] = useSubmitAction<ComposerResult | null>(
		action,
		null,
	);
	// 제어 입력이다. React 19는 함수 action이 끝나면 폼을 비우는데, 그러면 실패했을 때 쓰던 글까지 날아간다
	const [content, setContent] = useState(initialContent);
	const formId = useId();

	// 공백뿐이거나 고친 것이 없으면 보낼 것이 없다. 서버도 같은 것을 거른다(lib/utils/content.ts)
	const canSubmit =
		content.trim() !== "" && content.trim() !== initialContent.trim();

	useEffect(() => {
		guard.current = { canSubmit, pending };
	});
	useEffect(
		() => () => {
			guard.current = { canSubmit: false, pending: false };
		},
		[guard],
	);

	// result는 액션이 끝날 때마다 새 객체라 이걸로 성공을 구분한다
	useEffect(() => {
		if (result?.ok) onSuccess();
	}, [result, onSuccess]);

	return (
		<>
			<SheetHeader
				canSubmit={canSubmit}
				formId={formId}
				onCancel={onCancel}
				pending={pending}
				submitLabel={submitLabel}
				title={title}
			/>

			<Composer
				{...composer}
				content={content}
				error={result && !result.ok ? result.error : null}
				formAction={formAction}
				formId={formId}
				onContentChange={setContent}
				pending={pending}
			>
				{children}
			</Composer>
		</>
	);
}

// 첫 포커스는 "계속 쓰기"다. 실수로 Enter를 눌러도 글이 남는다
function DiscardDialog({
	open,
	onOpenChange,
	onDiscard,
}: {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	onDiscard: () => void;
}) {
	return (
		<Dialog onOpenChange={onOpenChange} open={open}>
			<ConfirmContent title="작성 중인 글을 버릴까요?">
				<div className="mt-5 flex gap-2">
					<Button
						className="flex-1"
						onClick={() => onOpenChange(false)}
						variant="secondary"
					>
						계속 쓰기
					</Button>
					<Button className="flex-1" onClick={onDiscard} variant="danger">
						버리기
					</Button>
				</div>
			</ConfirmContent>
		</Dialog>
	);
}
