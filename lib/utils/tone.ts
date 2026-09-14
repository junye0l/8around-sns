/** 관심사 칩과 사진 없는 아바타가 쓰는 여섯 톤. 색 값은 `app/globals.css`의 `--color-tone-*` */
export const TONES = [
	"violet",
	"blue",
	"green",
	"orange",
	"pink",
	"teal",
] as const;

export type Tone = (typeof TONES)[number];

/**
 * 글자를 해시해 톤 하나를 고른다. 같은 입력은 늘 같은 톤이다.
 * 관심사는 그 글자를, 아바타는 사용자 id를 넣는다. 결정 0043.
 */
export function toneOf(seed: string): Tone {
	let hash = 0;
	for (const char of seed) {
		hash = (hash * 31 + (char.codePointAt(0) ?? 0)) >>> 0;
	}
	return TONES[hash % TONES.length];
}
