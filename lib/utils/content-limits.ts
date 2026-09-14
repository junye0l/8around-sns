/**
 * 본문 길이 상한. 값의 출처는 마이그레이션의 CHECK 제약이고 여기는 옮겨 적은 것이다 —
 * 게시글 1~2000(`supabase/migrations/0001_init.sql:64`), 댓글 1~1000(같은 파일 83-85).
 *
 * 두 곳에 적힌다(규칙 3) — 진짜 방어는 DB 제약이고
 * 이쪽은 문구와 입력 상한용이다. 어긋나면 이 파일을 SQL에 맞춘다.
 *
 * 이 파일은 zod를 import 하지 않는다. `components/post/post-compose.ts`를 거쳐 클라이언트
 * 컴포넌트까지 가는 값이라, 스키마(`lib/utils/content.ts`)와 같은 파일에 두면 zod가
 * 브라우저 번들에 딸려 간다.
 */
export const POST_CONTENT_MAX = 2000;
export const COMMENT_CONTENT_MAX = 1000;

/** 별명 1~30자(`supabase/migrations/0001_init.sql`의 `profiles_display_name_length`) */
export const DISPLAY_NAME_MAX = 30;

/** 프로필 이미지 상한. 버킷의 `file_size_limit`과 같다(`supabase/migrations/0007_profile_avatars.sql`) */
export const AVATAR_MAX_BYTES = 500 * 1024;

/** 프로필 이미지 형식과 확장자. 버킷의 `allowed_mime_types`, 경로 제약 `profiles_avatar_path_format`과 같다 */
export const AVATAR_TYPES = {
	"image/jpeg": "jpg",
	"image/png": "png",
	"image/webp": "webp",
} as const;
