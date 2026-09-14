import { UserRound } from "lucide-react";
import Image from "next/image";
import { cn } from "@/lib/utils/cn";

/**
 * 프로필 이미지를 담은 36px 원. 이미지가 없으면 중립색 원에 사람 아이콘을 둔다.
 * 크기를 바꿀 때는 `className`으로 `size-*`만 준다. 아이콘은 원의 60%로 따라간다.
 *
 * `path`는 `profiles.avatar_path`, avatars 버킷 안의 경로다. 결정 0030.
 * `preview`는 올리기 전 고른 파일의 `blob:` 주소이고, 있으면 `path`보다 앞선다.
 * 이미지는 기본으로 늦게 불러온다. 첫 화면 위쪽에 크게 서는 자리는 `eager`를 준다.
 * @see supabase/migrations/0007_profile_avatars.sql
 */
export function Avatar({
	path,
	preview,
	eager = false,
	className,
}: {
	path?: string | null;
	preview?: string | null;
	eager?: boolean;
	className?: string;
}) {
	const src =
		preview ??
		(path &&
			`${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/avatars/${path}`);

	return (
		<span
			// 바로 옆에 이름이 적혀 있어 읽어주면 같은 말을 두 번 한다
			aria-hidden
			className={cn(
				"flex size-9 shrink-0 items-center justify-center overflow-hidden rounded-full bg-hairline text-fg-muted",
				className,
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
				<UserRound className="size-3/5" />
			)}
		</span>
	);
}
