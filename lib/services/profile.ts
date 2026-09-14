import type { SupabaseClient } from "@supabase/supabase-js";
import { z } from "zod";
import {
	AVATAR_MAX_BYTES,
	AVATAR_TYPES,
	DISPLAY_NAME_MAX,
} from "@/lib/utils/content-limits";
import type { Database } from "@/types/database";

export type UpdateProfileResult =
	| { ok: true }
	| { ok: false; error: string; field?: "display_name" | "avatar" };

const displayNameSchema = z
	.string("이름을 입력해 주세요")
	.trim()
	.min(1, "이름을 입력해 주세요")
	.max(DISPLAY_NAME_MAX, `이름은 ${DISPLAY_NAME_MAX}자까지 쓸 수 있어요`);

// 파일을 고르지 않으면 폼에 값이 없거나 빈 파일이 실린다. 둘 다 "안 바꾼다"다
const avatarSchema = z
	.instanceof(Blob)
	.nullish()
	.transform((file) => (file && file.size > 0 ? file : null))
	.refine((file) => !file || Object.hasOwn(AVATAR_TYPES, file.type), {
		message: "JPG, PNG, WebP 이미지만 올릴 수 있어요",
	})
	.refine((file) => !file || file.size <= AVATAR_MAX_BYTES, {
		message: `${AVATAR_MAX_BYTES / 1024}KB 이하 이미지만 올릴 수 있어요`,
	});

/**
 * 프로필 편집. 이름과 프로필 이미지를 한 번에 저장한다. 아이디는 바꾸지 않는다.
 * 검증은 여기서 한다 (규칙 9). Next를 모르므로 테스트에서 그대로 부를 수 있다.
 *
 * 이미지가 있으면 `<userId>/<uuid>.<ext>`에 새로 올리고 프로필이 그 경로를 가리키게 한 뒤
 * 옛 파일을 지운다. 누구 폴더에 쓸 수 있는지와 누구 행을 고칠 수 있는지는 RLS가 본다
 * (`supabase/migrations/0007_profile_avatars.sql`, `0001_init.sql`). 결정 0030.
 */
export async function updateProfile(
	supabase: SupabaseClient<Database>,
	userId: string,
	input: { displayName: unknown; avatar: unknown },
): Promise<UpdateProfileResult> {
	const name = displayNameSchema.safeParse(input.displayName);
	if (!name.success) {
		return {
			ok: false,
			error: name.error.issues[0].message,
			field: "display_name",
		};
	}

	const avatar = avatarSchema.safeParse(input.avatar);
	if (!avatar.success) {
		return {
			ok: false,
			error: avatar.error.issues[0].message,
			field: "avatar",
		};
	}

	const file = avatar.data;
	if (!file) {
		const { error } = await supabase
			.from("profiles")
			.update({ display_name: name.data })
			.eq("id", userId);
		return error ? failed() : { ok: true };
	}

	const { data: current } = await supabase
		.from("profiles")
		.select("avatar_path")
		.eq("id", userId)
		.maybeSingle();

	const ext = AVATAR_TYPES[file.type as keyof typeof AVATAR_TYPES];
	const path = `${userId}/${crypto.randomUUID()}.${ext}`;
	const bucket = supabase.storage.from("avatars");

	const upload = await bucket.upload(path, file, { contentType: file.type });
	if (upload.error) return failed();

	const { error } = await supabase
		.from("profiles")
		.update({ display_name: name.data, avatar_path: path })
		.eq("id", userId);

	if (error) {
		await bucket.remove([path]);
		return failed();
	}

	// ponytail: 옛 파일 지우기가 실패하면 고아 파일이 남는다. 쌓이면 폴더 단위로 정리한다
	if (current?.avatar_path) await bucket.remove([current.avatar_path]);

	return { ok: true };
}

function failed(): UpdateProfileResult {
	return {
		ok: false,
		error: "프로필을 저장하지 못했어요. 잠시 뒤에 다시 해주세요",
	};
}
