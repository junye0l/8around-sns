"use client";

import {
	type ReactNode,
	useCallback,
	useEffect,
	useId,
	useRef,
	useState,
} from "react";
import { InterestsField } from "@/components/profile/InterestsField";
import { Avatar } from "@/components/ui/Avatar";
import { Button } from "@/components/ui/Button";
import { DialogShell, Sheet, SheetHeader } from "@/components/ui/Dialog";
import { TextField } from "@/components/ui/TextField";
import { useFocusFirstInvalid } from "@/hooks/useFocusFirstInvalid";
import { useSubmitAction } from "@/hooks/useSubmitAction";
import { updateProfileAction } from "@/lib/actions/profile";
import type { UpdateProfileResult } from "@/lib/services/profile";
import {
	AVATAR_MAX_BYTES,
	AVATAR_TYPES,
	BIO_MAX,
	DISPLAY_NAME_MAX,
} from "@/lib/utils/content-limits";

/** 올리는 이미지 한 변. 프로필 헤더 76px의 3배를 덮는다. 결정 0030 */
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
 * 프로필 편집 시트. 별명, 소개, 관심사, 프로필 사진을 바꾼다.
 * 글쓰기 시트와 같은 틀이다(768px 미만 바텀 시트, 이상 모달). 머리 "취소" / "프로필 편집" / "저장".
 * 닫을 때 묻지 않는다 (결정 0044).
 *
 * 여는 버튼은 `trigger`로 받는다. 헤더의 "프로필 편집"과 관심사가 비었을 때의 "관심사 추가"가 같은 시트를 연다.
 * 폼은 시트 안에 있어 닫히면 같이 사라지고, 다시 열면 지금 프로필 값에서 시작한다.
 * @see docs/DESIGN.md 프로필 편집
 */
export function ProfileEditDialog({
	displayName,
	bio,
	interests,
	avatarPath,
	userId,
	trigger,
}: {
	displayName: string;
	bio: string | null;
	interests: string[];
	avatarPath: string | null;
	/** 사진 없는 아바타의 톤을 고르는 사용자 id */
	userId: string;
	/** 시트를 여는 `DialogTrigger`들 */
	trigger: ReactNode;
}) {
	const [open, setOpen] = useState(false);
	const close = useCallback(() => setOpen(false), []);

	return (
		<Sheet onOpenChange={setOpen} open={open}>
			{trigger}

			<DialogShell
				aria-describedby={undefined}
				// 안쪽 좌우 여백 16px씩을 더해 면이 560px이다. 글쓰기 시트와 같다
				className="top-12 max-w-148"
				// 기본은 첫 버튼(취소)에 포커스가 간다. 고치려고 연 창이라 별명 칸으로 보낸다
				onOpenAutoFocus={(event) => {
					event.preventDefault();
					(event.currentTarget as HTMLElement | null)
						?.querySelector<HTMLInputElement>("input[name=display_name]")
						?.focus();
				}}
				variant="sheet"
			>
				<ProfileEditForm
					avatarPath={avatarPath}
					bio={bio}
					displayName={displayName}
					interests={interests}
					onCancel={close}
					onSuccess={close}
					userId={userId}
				/>
			</DialogShell>
		</Sheet>
	);
}

function ProfileEditForm({
	displayName,
	bio,
	interests,
	avatarPath,
	userId,
	onCancel,
	onSuccess,
}: {
	displayName: string;
	bio: string | null;
	interests: string[];
	avatarPath: string | null;
	userId: string;
	onCancel: () => void;
	onSuccess: () => void;
}) {
	const [result, formAction, pending] =
		useSubmitAction<UpdateProfileResult | null>(updateProfileAction, null);
	const [name, setName] = useState(displayName);
	const [bioText, setBioText] = useState(bio ?? "");
	const [interestItems, setInterestItems] = useState(interests);
	const [avatar, setAvatar] = useState<Blob | null>(null);
	const [preview, setPreview] = useState<string | null>(null);
	const [fileError, setFileError] = useState<string | null>(null);
	const fileInput = useRef<HTMLInputElement>(null);
	const form = useFocusFirstInvalid(result);
	const formId = useId();

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
	const interestsError =
		serverError?.field === "interests" ? serverError.error : undefined;
	const avatarError =
		fileError ?? (serverError?.field === "avatar" ? serverError.error : null);
	const formError =
		serverError && !serverError.field ? serverError.error : null;

	// 연 뒤로 바뀐 것이 없으면 저장할 것이 없다. 비교는 서버가 저장하는 모양(앞뒤 공백 없음)으로 한다
	const unchanged =
		avatar === null &&
		name.trim() === displayName.trim() &&
		bioText.trim() === (bio ?? "").trim() &&
		interestItems.join("\n") === interests.join("\n");

	return (
		<>
			<SheetHeader
				canSubmit={!unchanged}
				formId={formId}
				onCancel={onCancel}
				pending={pending}
				submitLabel="저장"
				title="프로필 편집"
			/>

			<form
				action={(formData) => {
					// 원본 파일이 아니라 줄인 것을 싣는다. 파일 칸에는 name이 없어 원본은 안 실린다
					if (avatar) formData.set("avatar", avatar, "avatar");
					formAction(formData);
				}}
				className="flex flex-col gap-3 px-5 pb-5"
				id={formId}
				ref={form}
			>
				{/* 사진 위에 아이콘을 겹치지 않는다. 바꾸는 길은 아래 글자 버튼 하나다 (결정 0030 업로드 흐름) */}
				<div className="flex flex-col items-center gap-2">
					<Avatar
						eager
						name={name.trim() || displayName}
						path={avatarPath}
						preview={preview}
						seed={userId}
						size={76}
					/>
					<Button
						disabled={pending}
						onClick={() => fileInput.current?.click()}
						size="sm"
						variant="ghost"
					>
						사진 바꾸기
					</Button>
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
						<p className="text-center text-footnote text-danger" role="alert">
							{avatarError}
						</p>
					)}
				</div>

				<TextField
					error={nameError}
					hint={`${DISPLAY_NAME_MAX}자까지 가능해요`}
					label="별명"
					// 브라우저 쪽 상한은 친절함이다. 진짜 방어는 서버와 DB 제약이 한다 (규칙 9)
					maxLength={DISPLAY_NAME_MAX}
					name="display_name"
					onChange={(event) => setName(event.target.value)}
					readOnly={pending}
					sheet
					value={name}
				/>

				<TextField
					error={bioError}
					hint={`${BIO_MAX}자까지 가능해요`}
					label="소개"
					maxLength={BIO_MAX}
					multiline
					name="bio"
					onChange={(event) => setBioText(event.target.value)}
					readOnly={pending}
					sheet
					value={bioText}
				/>

				<InterestsField
					defaultValue={interests}
					error={interestsError}
					onChange={setInterestItems}
					pending={pending}
				/>

				{formError && (
					<p className="text-footnote text-danger" role="alert">
						{formError}
					</p>
				)}
			</form>
		</>
	);
}
