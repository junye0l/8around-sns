import { UserX } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/EmptyState";

/**
 * 없는 사람. `getProfile`이 null을 주면 페이지가 `notFound()`로 여기로 넘긴다.
 * @see docs/DESIGN.md 없는 페이지, 에러
 */
export default function ProfileNotFound() {
	return (
		<main className="flex w-full min-w-0 max-w-150 flex-1 flex-col justify-center px-3 py-10">
			<EmptyState
				action={
					<Button href="/" size="sm">
						전체로 돌아가기
					</Button>
				}
				description="탈퇴했거나 별명이 바뀌었을 수 있어요."
				heading
				icon={UserX}
				title="그런 사람이 없어요"
			/>
		</main>
	);
}
