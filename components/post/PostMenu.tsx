"use client";

import { Ellipsis, Pencil, Trash2 } from "lucide-react";
import { useActionState, useState } from "react";
import { POST_COMPOSE } from "@/components/post/post-compose";
import { ComposeDialog } from "@/components/ui/ComposeDialog";
import {
	Dialog,
	DialogClose,
	DialogDescription,
	DialogShell,
	DialogTitle,
} from "@/components/ui/Dialog";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from "@/components/ui/DropdownMenu";
import { deletePostAction, updatePostAction } from "@/lib/actions/post";

/**
 * 내가 쓴 글 오른쪽 위의 더보기. 수정과 삭제가 들어 있다.
 *
 * 부르는 쪽이 내 글일 때만 그린다. 그건 친절함이고, 남의 글을 고치거나 지우는 요청을
 * 실제로 막는 것은 RLS다 (규칙 9, `lib/services/post.ts`).
 *
 * 모달을 메뉴 안에 두지 않는다. 항목을 고르면 메뉴가 닫히면서 그 안의 것이 같이
 * 사라지므로, 열림 상태를 여기서 들고 `ComposeDialog`에 넘긴다.
 */
export function PostMenu({
	postId,
	content,
	authorName,
}: {
	postId: string;
	/** 지금 본문. 수정 모달이 이걸 채운 채로 열린다 */
	content: string;
	/** 수정 모달 아바타에 쓸 이름 */
	authorName: string;
}) {
	const [editing, setEditing] = useState(false);
	const [deleting, setDeleting] = useState(false);

	return (
		<>
			<DropdownMenu>
				{/* 아이콘만 있는 버튼이라 이름을 따로 준다. 모양은 좋아요·댓글 수와 맞춘다 */}
				<DropdownMenuTrigger
					aria-label="이 글 더 보기"
					className="inline-flex cursor-pointer items-center rounded-full p-2 text-fg-muted transition-colors duration-[var(--motion-fast)] ease-(--ease-standard) hover:bg-background hover:text-fg focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
				>
					<Ellipsis aria-hidden className="size-5 shrink-0" />
				</DropdownMenuTrigger>

				{/* 카드 오른쪽 위에 있어 아래로 편다. 레일의 메뉴만 오른쪽으로 연다 */}
				<DropdownMenuContent side="bottom">
					<DropdownMenuItem onSelect={() => setEditing(true)}>
						<Pencil aria-hidden className="size-5 shrink-0" />
						수정
					</DropdownMenuItem>
					<DropdownMenuItem danger onSelect={() => setDeleting(true)}>
						<Trash2 aria-hidden className="size-5 shrink-0" />
						삭제
					</DropdownMenuItem>
				</DropdownMenuContent>
			</DropdownMenu>

			{/* 입력칸과 모달은 새 글과 같은 것을 쓴다 (규칙 2). 액션과 문구만 갈린다 */}
			<ComposeDialog
				{...POST_COMPOSE}
				action={updatePostAction}
				authorName={authorName}
				initialContent={content}
				onOpenChange={setEditing}
				open={editing}
				submitLabel="수정"
				title="글 수정"
			>
				<input name="post_id" type="hidden" value={postId} />
			</ComposeDialog>

			<DeleteDialog
				onOpenChange={setDeleting}
				open={deleting}
				postId={postId}
			/>
		</>
	);
}

/**
 * 삭제 확인. 되돌릴 수 없고 댓글과 좋아요까지 같이 사라지므로 한 번 묻는다.
 *
 * 입력 모달과 모양이 다르다. 물음과 답 둘뿐이라 제목줄을 위에 따로 두지 않고,
 * 질문이 곧 제목이고 아래 한 줄에 취소와 삭제가 나란히 선다. 껍데기는 같은 것을 쓴다.
 *
 * 지워지면 목록을 다시 그리면서 이 컴포넌트가 통째로 사라진다. 닫는 처리를 따로 하지 않는다.
 */
function DeleteDialog({
	postId,
	open,
	onOpenChange,
}: {
	postId: string;
	open: boolean;
	onOpenChange: (open: boolean) => void;
}) {
	const [result, formAction, pending] = useActionState(deletePostAction, null);

	return (
		<Dialog onOpenChange={onOpenChange} open={open}>
			{/* 입력이 없어 세로 가운데에 둔다. 키보드가 올라와 자리가 흔들릴 일이 없다 */}
			<DialogShell className="-translate-y-1/2 top-1/2 max-w-sm">
				<form action={formAction}>
					<input name="post_id" type="hidden" value={postId} />

					<div className="px-6 py-6 text-center">
						<DialogTitle className="text-body font-semibold text-fg">
							게시물을 삭제하시겠어요?
						</DialogTitle>
						<DialogDescription className="mt-1 text-body-sm text-fg-muted">
							좋아요와 댓글도 함께 삭제됩니다.
						</DialogDescription>

						{result && !result.ok && (
							<p className="mt-2 text-body-sm text-danger" role="alert">
								{result.error}
							</p>
						)}
					</div>

					{/* 두 답이 같은 무게로 나란히 선다. 가르는 것은 카드 구분선과 같은 1px이다 */}
					<div className="flex border-hairline border-t text-body">
						<DialogClose className="flex-1 py-4 text-fg transition-colors duration-[var(--motion-fast)] ease-(--ease-standard) hover:bg-background focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-primary">
							취소
						</DialogClose>
						<div aria-hidden className="w-px bg-hairline" />
						<button
							className="flex-1 py-4 font-semibold text-danger transition-colors duration-[var(--motion-fast)] ease-(--ease-standard) hover:bg-background focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-primary disabled:text-fg-muted"
							disabled={pending}
							type="submit"
						>
							삭제
						</button>
					</div>
				</form>
			</DialogShell>
		</Dialog>
	);
}
