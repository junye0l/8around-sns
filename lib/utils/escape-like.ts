/**
 * `like`, `ilike` 패턴의 특수 문자 `%`, `_`, `\`를 글자 그대로 찾게 바꾼다.
 * 별명에 밑줄이 들어가면 한 글자 와일드카드가 되어 다른 별명과 맞아버린다.
 */
export function escapeLike(value: string): string {
	return value.replace(/[\\%_]/g, (char) => `\\${char}`);
}
