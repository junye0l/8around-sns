import type { ComponentProps } from "react";
import { useId } from "react";

type TextFieldProps = Omit<ComponentProps<"input">, "id"> & {
	label: string;
	/** 인라인 에러 문구. 있으면 보더와 helper text가 danger로 바뀐다 */
	error?: string;
	/** 평상시 아래에 깔리는 안내 문구 */
	hint?: string;
};

/**
 * Text Field — label + input + helper/error (DESIGN.md §4 SEED Product Components).
 * 에러 표현은 §4 States "Error (inline field)" — 보더 red-700 2px, 아래 13px 한 문장.
 */
export function TextField({ label, error, hint, ...props }: TextFieldProps) {
	const id = useId();
	const describedById = `${id}-desc`;
	const description = error ?? hint;

	return (
		<div className="flex flex-col gap-1">
			<label className="text-body-sm font-medium text-fg" htmlFor={id}>
				{label}
			</label>
			<input
				id={id}
				aria-describedby={description ? describedById : undefined}
				aria-invalid={error ? true : undefined}
				className={`rounded-md border bg-canvas px-4 py-3 text-body text-fg outline-none placeholder:text-fg-muted focus:border-primary ${
					error ? "border-2 border-danger" : "border-hairline"
				}`}
				{...props}
			/>
			{description && (
				// 13px은 타입 스케일(14/16px) 밖이지만 DESIGN.md §4 States가 helper text를
				// 13px로 못박아 둬서 그대로 쓴다 (AGENTS.md 스타일 규칙의 "이유를 주석으로")
				<p
					// 제한사항(hint)은 오른쪽, 에러는 필드 바로 아래 왼쪽에서 읽는다
					className={`text-[13px] ${error ? "text-danger" : "text-right text-fg-muted"}`}
					id={describedById}
				>
					{description}
				</p>
			)}
		</div>
	);
}
