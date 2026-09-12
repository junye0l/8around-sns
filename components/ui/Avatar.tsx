import { cn } from "@/lib/utils/cn";

/**
 * 이름 첫 글자를 담은 36px 원. 중립색만 쓴다.
 * 크기를 바꿀 때는 `className`으로 `size-*`와 글자 크기를 같이 준다. 프로필이 그렇게 쓴다.
 *
 * 이미지는 다루지 않는다. 업로드가 범위 밖이다.
 * @see components/ui/ContentCard.tsx 글과 댓글이 같이 쓴다
 */
export function Avatar({
	name,
	className,
}: {
	name: string;
	className?: string;
}) {
	return (
		<span
			// 바로 옆에 이름이 적혀 있어 읽어주면 같은 말을 두 번 한다
			aria-hidden
			className={cn(
				"flex size-9 shrink-0 items-center justify-center rounded-full bg-hairline text-body-sm font-semibold text-fg-muted",
				className,
			)}
		>
			{/* 코드 유닛으로 자르면 이모지와 한글 조합이 반으로 잘린다 */}
			{[...name][0] ?? "?"}
		</span>
	);
}
