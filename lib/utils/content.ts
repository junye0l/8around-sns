import { z } from "zod";

/** 게시글과 댓글은 상한만 다르고 판정이 같다. 두 벌로 적지 않는다 (규칙 2) */
export function contentSchema(max: number) {
	return (
		z
			// DB 제약은 저장되는 값을 보므로, 잘라낸 뒤의 길이로 판정해야 어긋나지 않는다
			.string()
			.trim()
			.min(1, "내용을 입력해 주세요")
			.max(max, `${max}자까지 쓸 수 있어요`)
	);
}
