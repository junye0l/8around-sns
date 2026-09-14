"use client";

import { CircleAlert, Eye, EyeOff } from "lucide-react";
import type { ComponentProps } from "react";
import { useId, useState } from "react";
import { cn } from "@/lib/utils/cn";

const BOX = [
	"peer w-full rounded-field bg-canvas px-4 text-body text-fg outline-none transition duration-(--motion-fast) ease-(--ease-standard) placeholder:text-transparent focus:placeholder:text-fg-muted",
	// 허용: 테두리 1.5px은 docs/DESIGN.md TextField 값이다. Tailwind 테두리 폭은 정수 px만 준다
	"border-[1.5px] border-hairline focus:border-primary focus:ring-3 focus:ring-primary-soft",
	"disabled:border-transparent disabled:bg-fill disabled:text-fg-disabled",
].join(" ");

const INVALID = "border-danger focus:border-danger";

// 시트 안의 쉬는 칸. 테두리 없는 fill 면이다가 포커스되면 canvas 면에 primary 테두리가 선다
const SHEET =
	"border-transparent bg-fill focus:bg-canvas focus:ring-0 disabled:bg-fill";
const SHEET_LABEL = "bg-fill peer-focus:bg-canvas";

type TextFieldProps = Omit<ComponentProps<"input">, "id"> & {
	label: string;
	/** 인라인 에러 문구. 있으면 테두리와 아래 문구가 danger로 바뀐다 */
	error?: string;
	/** 평상시 아래에 깔리는 안내 문구 */
	hint?: string;
	/** 여러 줄로 받는다. 칸이 textarea가 되고 96px에서 시작해 내용만큼 늘지 않는다 */
	multiline?: boolean;
	/** 시트 안에 선다. 쉬는 칸이 `fill` 면이다 (docs/DESIGN.md TextField) */
	sheet?: boolean;
};

/**
 * 입력칸 하나와 안내 또는 에러 한 줄. 라벨이 칸 안에 있다가, 칸을 누르거나 값이 차면
 * 테두리 위로 올라가 작아진다. 라벨 뒤를 칸 바탕색으로 칠해 테두리를 끊는다. 결정 0026.
 *
 * 칠하는 면은 글자 높이(`leading-none`, 13px)와 좌우 4px뿐이다. 올라간 라벨은 칸 위로 7px 튀어나오므로
 * 여러 칸을 쌓을 때 사이를 7px보다 넓게 둔다. 좁으면 칠한 면이 윗칸 아래 테두리를 덮는다.
 *
 * 안내와 에러는 같은 자리에 선다. 문구가 없어도 한 줄을 비워 두어 문구가 생겨도 아래가 밀리지 않는다.
 *
 * `placeholder`는 라벨이 올라간 뒤에만 보인다. 올라가기 전에는 라벨과 겹치므로 투명하게 둔다.
 * 라벨이 뜨는지는 `:placeholder-shown`으로 가르므로 예시 문구가 없어도 빈 칸 하나를 넣는다.
 *
 * `error`가 있으면 테두리가 danger로 바뀌고 `aria-invalid`가 붙는다. 라벨 색은 바꾸지 않는다.
 * `aria-invalid`만 넘기면 테두리만 켠다.
 *
 * `type="password"`면 오른쪽에 보기 토글이 붙는다. 누르면 `type`만 바꾸고 값은 그대로다.
 *
 * `multiline`이면 같은 상자와 라벨로 textarea를 그린다. 비어 있을 때 라벨은 첫 줄 자리에 내려온다.
 * @see docs/DESIGN.md TextField
 */
export function TextField({
	label,
	error,
	hint,
	multiline = false,
	sheet = false,
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
				{multiline ? (
					<textarea
						id={id}
						aria-describedby={description ? describedById : undefined}
						aria-invalid={invalid || undefined}
						// py-4에 한 줄 24.8px이면 첫 줄 가운데가 약 28px이다. 비었을 때 라벨이 top-7로 내려와 그 줄에 앉는다
						className={cn(
							BOX,
							"block min-h-24 resize-none py-4",
							sheet && SHEET,
							invalid && INVALID,
						)}
						placeholder={placeholder ?? " "}
						// 입력칸 전용 이벤트 타입을 쓰는 호출부가 없어 속성만 그대로 넘긴다
						{...(props as ComponentProps<"textarea">)}
					/>
				) : (
					<input
						id={id}
						aria-describedby={description ? describedById : undefined}
						aria-invalid={invalid || undefined}
						className={cn(
							BOX,
							"h-14.5",
							sheet && SHEET,
							invalid && INVALID,
							password && "pr-12",
						)}
						placeholder={placeholder ?? " "}
						type={password && revealed ? "text" : type}
						{...props}
					/>
				)}
				{/* 기본은 올라간 자리다. 비어 있을 때만 칸 가운데로 내려오고, 포커스가 그것을 다시 이긴다.
				    Tailwind가 placeholder-shown 변형을 focus보다 앞에 내보내서 이 순서가 선다 */}
				<label
					className={cn(
						"pointer-events-none absolute top-0 left-3 -translate-y-1/2 bg-canvas px-1 text-footnote leading-none text-fg-muted transition-all duration-(--motion-fast) ease-(--ease-standard) peer-disabled:bg-fill",
						multiline
							? "peer-placeholder-shown:top-7"
							: "peer-placeholder-shown:top-1/2",
						"peer-placeholder-shown:text-body",
						"peer-focus:top-0 peer-focus:text-footnote",
						sheet && SHEET_LABEL,
					)}
					htmlFor={id}
				>
					{label}
				</label>
				{password && (
					<button
						aria-label={revealed ? "비밀번호 숨기기" : "비밀번호 보기"}
						aria-pressed={revealed}
						className="absolute top-1/2 right-2 -translate-y-1/2 rounded-full p-2 text-fg-muted transition-colors duration-(--motion-fast) ease-(--ease-standard) hover:bg-fill hover:text-fg focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary disabled:cursor-not-allowed"
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
			<p
				className={cn(
					"flex min-h-lh items-center gap-1 px-1 text-footnote",
					error ? "text-danger" : "text-fg-muted",
				)}
				id={describedById}
				// 에러만 말한다. hint에 붙이면 화면에 뜰 때마다 읽어서 시끄럽다
				role={error ? "alert" : undefined}
			>
				{error && <CircleAlert aria-hidden className="size-4 shrink-0" />}
				{description}
			</p>
		</div>
	);
}
