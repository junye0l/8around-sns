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
 * 라벨, 입력칸, 안내 또는 에러 한 줄.
 *
 * `error`가 있으면 보더가 2px danger로 바뀌고 `aria-invalid`가 붙는다.
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
				// hint는 오른쪽, 에러는 왼쪽에서 읽는다
				<p
					className={`text-body-sm ${error ? "text-danger" : "text-right text-fg-muted"}`}
					id={describedById}
				>
					{description}
				</p>
			)}
		</div>
	);
}
