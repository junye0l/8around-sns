import type { SupabaseClient } from "@supabase/supabase-js";
import { z } from "zod";
import {
	AVATAR_MAX_BYTES,
	AVATAR_TYPES,
	BIO_MAX,
} from "@/lib/utils/content-limits";
import {
	DISPLAY_NAME_TAKEN,
	displayNameSchema,
} from "@/lib/utils/display-name";
import { interestsSchema } from "@/lib/utils/interests";
import type { Database } from "@/types/database";

export type UpdateProfileResult =
	| { ok: true }
	| {
			ok: false;
			error: string;
			field?: "display_name" | "bio" | "interests" | "avatar";
	  };

// 다 지우고 저장하면 빈 문자열이 아니라 null이다. 프로필에서 소개 줄이 사라진다.
// 폼 제출은 줄바꿈을 \r\n으로 싣는다. 브라우저 maxLength는 줄바꿈을 1자로 세므로 여기서도 1자로 맞춘다
const bioSchema = z
	.string()
	.transform((bio) => bio.replaceAll("\r\n", "\n"))
	.pipe(z.string().trim().max(BIO_MAX, `소개는 ${BIO_MAX}자까지 쓸 수 있어요`))
	.nullish()
	.transform((bio) => bio || null);

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
 * 프로필 편집. 별명, 소개, 관심사, 프로필 이미지를 한 번에 저장한다.
 * 검증은 여기서 한다 (규칙 9). Next를 모르므로 테스트에서 그대로 부를 수 있다.
 *
 * 이미지가 있으면 `<userId>/<uuid>.<ext>`에 새로 올리고 프로필이 그 경로를 가리키게 한 뒤
 * 옛 파일을 지운다. 누구 폴더에 쓸 수 있는지와 누구 행을 고칠 수 있는지는 RLS가 본다
 * (`supabase/migrations/0007_profile_avatars.sql`, `0001_init.sql`). 결정 0030.
 */
export async function updateProfile(
	supabase: SupabaseClient<Database>,
	userId: string,
	input: {
		displayName: unknown;
		bio: unknown;
		interests: unknown;
		avatar: unknown;
	},
): Promise<UpdateProfileResult> {
	const name = displayNameSchema.safeParse(input.displayName);
	if (!name.success) {
		return {
			ok: false,
			error: name.error.issues[0].message,
			field: "display_name",
		};
	}

	const bio = bioSchema.safeParse(input.bio);
	if (!bio.success) {
		return { ok: false, error: bio.error.issues[0].message, field: "bio" };
	}

	const interests = interestsSchema.safeParse(input.interests);
	if (!interests.success) {
		return {
			ok: false,
			error: interests.error.issues[0].message,
			field: "interests",
		};
	}

	const fields = {
		display_name: name.data,
		bio: bio.data,
		interests: interests.data,
	};

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
			.update(fields)
			.eq("id", userId);
		return error ? failed(error.code) : { ok: true };
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
		.update({ ...fields, avatar_path: path })
		.eq("id", userId);

	if (error) {
		await bucket.remove([path]);
		return failed(error.code);
	}

	// ponytail: 옛 파일 지우기가 실패하면 고아 파일이 남는다. 쌓이면 폴더 단위로 정리한다
	if (current?.avatar_path) await bucket.remove([current.avatar_path]);

	return { ok: true };
}

// 23505는 유일 인덱스 위반이다. 이 표에서 겹칠 수 있는 값은 별명뿐이다 (0009_display_name_unique.sql)
function failed(code?: string): UpdateProfileResult {
	if (code === "23505") {
		return { ok: false, error: DISPLAY_NAME_TAKEN, field: "display_name" };
	}
	return {
		ok: false,
		error: "프로필을 저장하지 못했어요. 잠시 뒤에 다시 해주세요",
	};
}
