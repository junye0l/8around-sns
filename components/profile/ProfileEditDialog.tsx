"use client";

import { Pencil } from "lucide-react";
import { useActionState, useEffect, useRef, useState } from "react";
import { Avatar } from "@/components/ui/Avatar";
import { Button } from "@/components/ui/Button";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/Dialog";
import { TextField } from "@/components/ui/TextField";
import { updateProfileAction } from "@/lib/actions/profile";
import type { UpdateProfileResult } from "@/lib/services/profile";
import {
	AVATAR_MAX_BYTES,
	AVATAR_TYPES,
	BIO_MAX,
	DISPLAY_NAME_MAX,
} from "@/lib/utils/content-limits";

/** 올리는 이미지 한 변. 프로필 헤더 84px의 3배를 덮는다. 결정 0030 */
const AVATAR_SIDE = 256;

/**
 * 가운데를 정사각형으로 잘라 256px WebP로 줄인다. 이미지가 아니면 던진다.
 * 브라우저가 WebP로 못 구우면 PNG가 나오고, 그것도 서버가 받는 형식이다.
 * 캔버스에 묶여 있어 `lib/utils/`로 빼지 않는다.
 */
async function shrink(file: File): Promise<Blob> {
	const bitmap = await createImageBitmap(file);
	const side = Math.min(bitmap.width, bitmap.height);
	const canvas = document.createElement("canvas");
	canvas.width = AVATAR_SIDE;
	canvas.height = AVATAR_SIDE;
	canvas
		.getContext("2d")
		?.drawImage(
			bitmap,
			(bitmap.width - side) / 2,
			(bitmap.height - side) / 2,
			side,
			side,
			0,
			0,
			AVATAR_SIDE,
			AVATAR_SIDE,
		);
	bitmap.close();

	return new Promise((resolve, reject) =>
		canvas.toBlob(
			(blob) => (blob ? resolve(blob) : reject(new Error("toBlob"))),
			"image/webp",
			0.85,
		),
	);
}

/**
 * 내 프로필의 "프로필 편집" 버튼과 모달. 별명, 소개, 프로필 이미지를 바꾼다.
 * 남의 프로필에서 팔로우 버튼이 서는 자리에 같은 높이(40px)로 선다.
 *
 * 모달은 `components/ui/Dialog.tsx`를 쓴다. 포커스 가두기, Esc, 닫힌 뒤 버튼으로 포커스 돌려주기는 radix가 한다.
 * 폼은 모달 안에 있어 닫히면 같이 사라지고, 다시 열면 지금 프로필 값에서 시작한다.
 */
export function ProfileEditDialog({
	displayName,
	bio,
	avatarPath,
}: {
	displayName: string;
	bio: string | null;
	avatarPath: string | null;
}) {
	const [open, setOpen] = useState(false);

	return (
		<Dialog onOpenChange={setOpen} open={open}>
			<DialogTrigger asChild>
				<Button className="w-full" variant="outline">
					프로필 편집
				</Button>
			</DialogTrigger>

			{/* 기본은 첫 버튼(취소)에 포커스가 간다. 고치려고 연 창이라 별명 칸으로 보낸다 */}
			<DialogContent
				className="max-w-md"
				onOpenAutoFocus={(event) => {
					event.preventDefault();
					(event.currentTarget as HTMLElement | null)
						?.querySelector<HTMLInputElement>("input[name=display_name]")
						?.focus();
				}}
				title="프로필 편집"
			>
				<ProfileEditForm
					avatarPath={avatarPath}
					bio={bio}
					displayName={displayName}
					onSuccess={() => setOpen(false)}
				/>
			</DialogContent>
		</Dialog>
	);
}

function ProfileEditForm({
	displayName,
	bio,
	avatarPath,
	onSuccess,
}: {
	displayName: string;
	bio: string | null;
	avatarPath: string | null;
	onSuccess: () => void;
}) {
	const [result, formAction, pending] = useActionState<
		UpdateProfileResult | null,
		FormData
	>(updateProfileAction, null);
	const [name, setName] = useState(displayName);
	const [avatar, setAvatar] = useState<Blob | null>(null);
	const [preview, setPreview] = useState<string | null>(null);
	const [fileError, setFileError] = useState<string | null>(null);
	const fileInput = useRef<HTMLInputElement>(null);

	useEffect(() => {
		if (result?.ok) onSuccess();
	}, [result, onSuccess]);

	// 고를 때마다 새 주소를 만들므로 옛 주소를 놓아준다
	useEffect(() => {
		return () => {
			if (preview) URL.revokeObjectURL(preview);
		};
	}, [preview]);

	async function pick(file: File | undefined) {
		if (!file) return;
		setFileError(null);

		// 서버가 다시 본다 (lib/services/profile.ts). 여기는 줄이기 전에 빨리 알려주는 친절함이다
		if (!Object.hasOwn(AVATAR_TYPES, file.type)) {
			setFileError("JPG, PNG, WebP 이미지만 올릴 수 있어요");
			return;
		}

		try {
			const blob = await shrink(file);
			if (blob.size > AVATAR_MAX_BYTES) throw new Error("too large");
			setAvatar(blob);
			setPreview(URL.createObjectURL(blob));
		} catch {
			setFileError("이미지를 읽지 못했어요. 다른 파일을 골라주세요");
		}
	}

	const serverError = result && !result.ok ? result : null;
	const nameError =
		serverError?.field === "display_name" ? serverError.error : undefined;
	const bioError = serverError?.field === "bio" ? serverError.error : undefined;
	const avatarError =
		fileError ?? (serverError?.field === "avatar" ? serverError.error : null);
	const formError =
		serverError && !serverError.field ? serverError.error : null;

	return (
		<form
			action={(formData) => {
				// 원본 파일이 아니라 줄인 것을 싣는다. 파일 칸에는 name이 없어 원본은 안 실린다
				if (avatar) formData.set("avatar", avatar, "avatar");
				formAction(formData);
			}}
			className="flex flex-col gap-6 px-6 pt-2 pb-6"
		>
			<div className="flex flex-col items-center gap-2">
				{/* 사진 자체가 버튼이다. 늘 깔린 어두운 막과 연필이 누를 수 있다고 말하고, hover와 pressed에서 막이 짙어진다.
				    저장 중에는 진짜 disabled 대신 aria-disabled로 막는다. 포커스가 body로 떨어지지 않는다 (결정 0012, Button.tsx와 같다) */}
				<button
					aria-busy={pending || undefined}
					aria-disabled={pending || undefined}
					aria-label="프로필 사진 바꾸기"
					className="group/avatar relative shrink-0 rounded-full focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary aria-busy:cursor-not-allowed"
					onClick={() => {
						if (!pending) fileInput.current?.click();
					}}
					type="button"
				>
					<Avatar className="size-21" path={avatarPath} preview={preview} />
					<span
						aria-hidden
						className="absolute inset-0 flex items-center justify-center rounded-full bg-fg/30 text-canvas transition-colors duration-[var(--motion-fast)] ease-(--ease-standard) group-hover/avatar:bg-fg/50 group-active/avatar:bg-fg/60 group-aria-busy/avatar:bg-fg/30 group-aria-busy/avatar:group-hover/avatar:bg-fg/30"
					>
						<Pencil className="size-6" />
					</span>
				</button>
				<input
					accept={Object.keys(AVATAR_TYPES).join(",")}
					aria-label="프로필 사진 파일"
					className="sr-only"
					onChange={(event) => {
						pick(event.target.files?.[0]);
						// 같은 파일을 다시 골라도 onChange가 오게 비운다
						event.target.value = "";
					}}
					ref={fileInput}
					tabIndex={-1}
					type="file"
				/>
				{avatarError && (
					<p className="text-center text-body-sm text-danger" role="alert">
						{avatarError}
					</p>
				)}
			</div>

			<TextField
				readOnly={pending}
				error={nameError}
				label="별명"
				// 브라우저 쪽 상한은 친절함이다. 진짜 방어는 서버와 DB 제약이 한다 (규칙 9)
				maxLength={DISPLAY_NAME_MAX}
				name="display_name"
				onChange={(event) => setName(event.target.value)}
				value={name}
			/>

			<TextField
				defaultValue={bio ?? ""}
				error={bioError}
				hint={`${BIO_MAX}자까지 가능해요`}
				label="소개"
				maxLength={BIO_MAX}
				multiline
				name="bio"
				readOnly={pending}
			/>

			{formError && (
				<p className="text-body-sm text-danger" role="alert">
					{formError}
				</p>
			)}

			<Button className="w-full" loading={pending} type="submit">
				저장
			</Button>
		</form>
	);
}
