import { UserRound } from "lucide-react";
import Image from "next/image";
import { cn } from "@/lib/utils/cn";
import { type Tone, toneOf } from "@/lib/utils/tone";

// 첫 글자는 지름의 40% 안팎인 글자 토큰을 쓴다
const SIZES = {
	76: "size-19 text-large-title",
	40: "size-10 text-body",
	36: "size-9 text-callout",
	34: "size-8.5 text-subhead",
	32: "size-8 text-footnote",
	26: "size-6.5 text-caption",
} as const;

const TONE_BG: Record<Tone, string> = {
	violet: "bg-tone-violet",
	blue: "bg-tone-blue",
	green: "bg-tone-green",
	orange: "bg-tone-orange",
	pink: "bg-tone-pink",
	teal: "bg-tone-teal",
};

/**
 * 프로필 사진 원. 사진이 없으면 별명 첫 글자를 `seed`(사용자 id)로 고른 톤 위에 흰 글자로 둔다.
 * 크기는 `docs/DESIGN.md` Avatar의 여섯 가지다.

 *
 * `path`는 `profiles.avatar_path`, avatars 버킷 안의 경로다. 결정 0030.
 * `preview`는 올리기 전 고른 파일의 `blob:` 주소이고, 있으면 `path`보다 앞선다.
 * 이미지는 기본으로 늦게 불러온다. 첫 화면 위쪽에 크게 서는 자리는 `eager`를 준다.
 * @see supabase/migrations/0007_profile_avatars.sql
 */
export function Avatar({
	path,
	preview,
	name,
	seed,
	size = 36,
	eager = false,
}: {
	path?: string | null;
	preview?: string | null;
	/** 별명. 사진이 없을 때 첫 글자를 쓴다 */
	name?: string;
	/** 톤을 고르는 값. 사용자 id를 넣는다. 없으면 `name`으로 고른다 */
	seed?: string;
	size?: keyof typeof SIZES;
	eager?: boolean;
}) {
	const src =
		preview ??
		(path &&
			`${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/avatars/${path}`);
	// 서로게이트 쌍으로 된 글자도 한 글자로 자른다
	const initial = name ? Array.from(name.trim())[0] : undefined;

	return (
		<span
			// 바로 옆에 이름이 적혀 있어 읽어주면 같은 말을 두 번 한다
			aria-hidden
			className={cn(
				"flex shrink-0 select-none items-center justify-center overflow-hidden rounded-full font-bold leading-none",
				SIZES[size],
				src || !initial
					? "bg-hairline text-fg-muted"
					: [TONE_BG[toneOf(seed ?? name ?? "")], "text-on-primary"],
			)}
		>
			{src ? (
				// 최적화 서버를 거치지 않는다. 올릴 때 이미 256px로 줄였다. 결정 0030
				<Image
					alt=""
					className="size-full object-cover"
					height={256}
					loading={eager ? "eager" : "lazy"}
					src={src}
					unoptimized
					width={256}
				/>
			) : (
				(initial ?? <UserRound className="size-3/5" />)
			)}
		</span>
	);
}
