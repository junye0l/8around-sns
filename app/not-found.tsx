import { Compass } from "lucide-react";
import { BrandMark } from "@/components/ui/BrandMark";
import { Button } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/EmptyState";

/**
 * 어느 라우트에도 걸리지 않는 주소가 여기로 온다. 무엇을 찾던 중인지 알 수 없으므로 전체로 보낸다.
 * 뼈대 밖이라 메뉴가 없어 카드 위에 로고 마크를 둔다.
 * @see docs/DESIGN.md 없는 페이지, 에러
 */
export default function NotFound() {
	return (
		<main className="mx-auto flex w-full max-w-150 flex-1 flex-col justify-center gap-6 px-3 py-10">
			<BrandMark />
			<EmptyState
				action={
					<Button href="/" size="sm">
						전체로 돌아가기
					</Button>
				}
				description="주소가 바뀌었거나 지워졌을 수 있어요."
				heading
				icon={Compass}
				title="없는 주소예요"
			/>
		</main>
	);
}
