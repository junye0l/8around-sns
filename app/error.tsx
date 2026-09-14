"use client";

import { TriangleAlert } from "lucide-react";
import { BrandMark } from "@/components/ui/BrandMark";
import { Button } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/EmptyState";

/**
 * 화면을 못 그렸을 때 모든 라우트가 여기로 온다. 라우트마다 따로 만들지 않는다.
 * 뼈대 밖이라 메뉴가 없어 카드 위에 로고 마크를 둔다. 아이콘 바탕만 `danger-soft`다.
 * @see docs/DESIGN.md 없는 페이지, 에러
 */
export default function FeedError({ reset }: { reset: () => void }) {
	return (
		<main className="mx-auto flex w-full max-w-150 flex-1 flex-col justify-center gap-6 px-3 py-10">
			<BrandMark />
			<EmptyState
				action={
					<Button onClick={reset} size="sm">
						다시 시도
					</Button>
				}
				danger
				description="잠시 뒤에 다시 시도해 주세요."
				heading
				icon={TriangleAlert}
				title="글을 불러오지 못했어요"
			/>
		</main>
	);
}
