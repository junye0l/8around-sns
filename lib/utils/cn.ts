import { type ClassValue, clsx } from "clsx";
import { extendTailwindMerge } from "tailwind-merge";

/**
 * `@theme`의 타입 스케일 이름. `app/globals.css`의 `--text-*`와 같아야 한다.
 * 어긋나면 `npm run harness`가 잡는다.
 */
export const FONT_SIZES = [
	"large-title",
	"title",
	"headline",
	"body",
	"callout",
	"subhead",
	"footnote",
	"caption",
	"body-sm",
];

const merge = extendTailwindMerge({
	extend: { classGroups: { "font-size": [{ text: FONT_SIZES }] } },
});

/**
 * Tailwind 클래스를 합친다. 같은 속성이 겹치면 뒤에 온 것이 이긴다.
 *
 * 문자열을 그냥 이어 붙이면 CSS 출력 순서로 승부가 나서, 호출부가 넘긴 `w-auto`가
 * 컴포넌트 기본값 `w-full`에 지는 일이 생긴다.
 *
 * 기본 설정만으로는 `text-body`(크기)와 `text-canvas`(색)를 같은 부류로 보고
 * 하나를 지운다. 크기 쪽 이름을 알려줘야 둘 다 남는다.
 */
export function cn(...inputs: ClassValue[]) {
	return merge(clsx(inputs));
}
