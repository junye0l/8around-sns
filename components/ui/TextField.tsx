"use client";

import { Eye, EyeOff } from "lucide-react";
import type { ComponentProps } from "react";
import { useId, useState } from "react";
import { cn } from "@/lib/utils/cn";

type TextFieldProps = Omit<ComponentProps<"input">, "id"> & {
	label: string;
	/** 인라인 에러 문구. 있으면 보더, 라벨, helper text가 danger로 바뀐다 */
	error?: string;
	/** 평상시 아래에 깔리는 안내 문구 */
	hint?: string;
};

/**
 * 입력칸 하나와 안내 또는 에러 한 줄. 라벨이 칸 안에 있다가, 칸을 누르거나 값이 차면
 * 테두리 위로 올라가 작아진다. 라벨 뒤를 `canvas`로 칠해 테두리를 끊는다. 결정 0026.
 *
 * `placeholder`는 라벨이 올라간 뒤에만 보인다. 올라가기 전에는 라벨과 겹치므로 투명하게 둔다.
 * 라벨이 뜨는지는 `:placeholder-shown`으로 가르므로 예시 문구가 없어도 빈 칸 하나를 넣는다.
 *
 * `error`가 있으면 보더가 danger로 바뀌고 `aria-invalid`가 붙는다. 문구를 다른 자리에 띄우는
 * 폼은 `aria-invalid`만 넘겨서 보더만 켠다. 로그인이 그렇다.
 *
 * `type="password"`면 오른쪽에 보기 토글이 붙는다. 누르면 `type`만 바꾸고 값은 그대로다.
 *
 * 상자는 흰 채움에 `fg-muted` 테두리다. 흰 바탕에서 3.04:1로 결정 0012의 기준을 넘는다.
 * 그래서 이 입력칸은 흰 바탕 위에 서야 한다.
 */
export function TextField({
	label,
	error,
	hint,
	placeholder,
	type,
	"aria-invalid": ariaInvalid,
	...props
}: TextFieldProps) {
	const id = useId();
	const describedById = `${id}-desc`;
	const description = error ?? hint;
	const invalid = Boolean(error) || ariaInvalid === true;
	const password = type === "password";
	const [revealed, setRevealed] = useState(false);

	return (
		<div className="flex flex-col gap-1">
			<div className="relative">
				<input
					id={id}
					aria-describedby={description ? describedById : undefined}
					aria-invalid={invalid || undefined}
					className={cn(
						"peer h-14 w-full rounded-lg border bg-canvas px-4 text-body text-fg outline-none transition-colors duration-[var(--motion-fast)] ease-(--ease-standard) placeholder:text-transparent focus:placeholder:text-fg-muted",
						invalid ? "border-danger" : "border-fg-muted focus:border-fg",
						password && "pr-12",
					)}
					placeholder={placeholder ?? " "}
					type={password && revealed ? "text" : type}
					{...props}
				/>
				{/* 기본은 올라간 자리다. 비어 있을 때만 칸 가운데로 내려오고, 포커스가 그것을 다시 이긴다.
				    Tailwind가 placeholder-shown 변형을 focus보다 앞에 내보내서 이 순서가 선다 */}
				<label
					className={cn(
						"pointer-events-none absolute top-0 left-3 -translate-y-1/2 bg-canvas px-1 text-body-sm transition-all duration-[var(--motion-fast)] ease-(--ease-standard)",
						"peer-placeholder-shown:top-1/2 peer-placeholder-shown:text-body",
						"peer-focus:top-0 peer-focus:text-body-sm",
						invalid ? "text-danger" : "text-fg-muted peer-focus:text-fg",
					)}
					htmlFor={id}
				>
					{label}
				</label>
				{password && (
					<button
						aria-label={revealed ? "비밀번호 숨기기" : "비밀번호 보기"}
						aria-pressed={revealed}
						className="absolute top-1/2 right-2 -translate-y-1/2 rounded-md p-2 text-fg-muted transition-colors duration-[var(--motion-fast)] ease-(--ease-standard) hover:bg-background hover:text-fg focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary disabled:cursor-not-allowed"
						disabled={props.disabled}
						onClick={() => setRevealed((v) => !v)}
						type="button"
					>
						{revealed ? (
							<EyeOff aria-hidden className="size-5" />
						) : (
							<Eye aria-hidden className="size-5" />
						)}
					</button>
				)}
			</div>
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
