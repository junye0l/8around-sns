import { z } from "zod";
import { DISPLAY_NAME_MAX } from "@/lib/utils/content-limits";

/** 겹치는 별명에 쓰는 문구. 가입과 프로필 편집이 같이 쓴다 */
export const DISPLAY_NAME_TAKEN =
	"이미 쓰고 있는 별명이에요. 다른 별명으로 해주세요";

/**
 * 별명 형식. 앞뒤 공백을 지우고 1~30자다. 값의 출처는 `supabase/migrations/0001_init.sql`의
 * `profiles_display_name_length` 제약이고, 겹치지 않는지는 `0009_display_name_unique.sql`의 유일 인덱스가 막는다.
 * 가입과 프로필 편집이 같이 쓴다.
 */
export const displayNameSchema = z
	.string("별명을 입력해 주세요")
	.trim()
	.min(1, "별명을 입력해 주세요")
	.max(DISPLAY_NAME_MAX, `별명은 ${DISPLAY_NAME_MAX}자까지 쓸 수 있어요`);
