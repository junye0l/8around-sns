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
 * 입력칸 하나와 안내 또는 에러 한 줄. 라벨은 화면에서 감추고 `placeholder`가 그 말을 대신한다,
 * 없으면 라벨 문구를 그대로 placeholder로 쓴다. Threads의 채운 상자 모양이다. 결정 0016.
 *
 * `error`가 있으면 보더가 danger로 바뀌고 `aria-invalid`가 붙는다.
 *
 * 상자는 `background`로 채우고 `fg-muted` 테두리를 두른다. 채움만으로는 흰 바탕과
 * 1.1:1이라 경계가 안 보이고, `hairline` 테두리는 1.23:1이다. `fg-muted`가 흰 바탕에서
 * 3.04:1로 결정 0012의 기준을 넘는다. 그래서 이 입력칸은 흰 바탕 위에 서야 한다.
 */
export function TextField({
	label,
	error,
	hint,
	placeholder,
	...props
}: TextFieldProps) {
	const id = useId();
	const describedById = `${id}-desc`;
	const description = error ?? hint;

	return (
		<div className="flex flex-col gap-1">
			<label className="sr-only" htmlFor={id}>
				{label}
			</label>
			<input
				id={id}
				aria-describedby={description ? describedById : undefined}
				aria-invalid={error ? true : undefined}
				className={`h-14 rounded-lg border bg-background px-4 text-body text-fg outline-none placeholder:text-fg-muted focus:border-fg ${
					error ? "border-danger" : "border-fg-muted"
				}`}
				placeholder={placeholder ?? label}
				{...props}
			/>
			{description && (
				<p
					className={`px-1 text-body-sm ${error ? "text-danger" : "text-fg-muted"}`}
					id={describedById}
					// 에러만 말한다. hint에 붙이면 화면에 뜰 때마다 읽어서 시끄럽다
					role={error ? "alert" : undefined}
				>
					{description}
				</p>
			)}
		</div>
	);
}
