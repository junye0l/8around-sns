import { CircleAlert } from "lucide-react";

/**
 * 칸 하나에 묶이지 않는 에러 한 줄. 버튼 바로 위에 선다. 모양은 `TextField`의 에러 문구와 같다.
 * 칸 테두리는 켜지 않는다. 로그인이 어느 칸이 틀렸는지 알리지 않기 때문이다 (`lib/services/auth.ts`).
 */
export function FormError({ message }: { message?: string }) {
	if (!message) return null;

	return (
		<p
			className="flex items-center gap-1 px-1 text-footnote text-danger"
			role="alert"
		>
			<CircleAlert aria-hidden className="size-4 shrink-0" />
			{message}
		</p>
	);
}
