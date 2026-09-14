import { z } from "zod";
import { INTEREST_CHARS_MAX, INTERESTS_MAX } from "@/lib/utils/content-limits";

/** 글자 수. DB `char_length`와 같게 코드 포인트로 센다. `.length`는 이모지를 2로 센다 */
export const interestLength = (value: string) => [...value].length;

/** 앞뒤 공백을 지우고 빈 값과 중복을 뺀다. 처음 나온 순서를 지킨다 */
export function normalizeInterests(values: string[]): string[] {
	return [...new Set(values.map((value) => value.trim()).filter(Boolean))];
}

/**
 * 서버가 받는 관심사. 문자열 배열만 받고, 다듬은 뒤 3개, 한 개에 2글자까지다.
 * 값의 출처는 `supabase/migrations/0011_profile_interests.sql`의 CHECK다. 결정 0036.
 */
export const interestsSchema = z
	.array(z.string(), "관심사를 다시 넣어 주세요")
	.transform(normalizeInterests)
	.refine((items) => items.length <= INTERESTS_MAX, {
		message: `관심사는 ${INTERESTS_MAX}개까지 넣을 수 있어요`,
	})
	.refine(
		(items) =>
			items.every((item) => interestLength(item) <= INTEREST_CHARS_MAX),
		{ message: `관심사는 한 개에 ${INTEREST_CHARS_MAX}글자까지 쓸 수 있어요` },
	);
