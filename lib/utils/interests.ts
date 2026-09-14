/**
 * 관심사 상한. 값의 출처는 `supabase/migrations/0011_profile_interests.sql`의 CHECK이고 여기는 옮겨 적은 것이다.
 * zod를 import 하지 않는다. 클라이언트 입력칸까지 가는 파일이다.
 */
export const INTERESTS_MAX = 3;
export const INTEREST_CHARS_MAX = 2;

/** 글자 수. DB `char_length`와 같게 코드 포인트로 센다. `.length`는 이모지를 2로 센다 */
export const interestLength = (value: string) => [...value].length;

/** 앞뒤 공백을 지우고 빈 값과 중복을 뺀다. 처음 나온 순서를 지킨다 */
export function normalizeInterests(values: string[]): string[] {
	return [...new Set(values.map((value) => value.trim()).filter(Boolean))];
}

/** 정규화한 목록이 제약을 넘으면 문구를, 아니면 null을 준다 */
export function interestsError(items: string[]): string | null {
	if (items.length > INTERESTS_MAX)
		return `관심사는 ${INTERESTS_MAX}개까지 넣을 수 있어요`;
	if (items.some((item) => interestLength(item) > INTEREST_CHARS_MAX))
		return `관심사는 한 개에 ${INTEREST_CHARS_MAX}글자까지 쓸 수 있어요`;
	return null;
}
