import { z } from "zod";

/**
 * 별명 형식. 값의 출처는 `supabase/migrations/0001_init.sql:20`의
 * `profiles_username_format` 제약이고, 여기는 같은 값을 옮겨 적은 것이다.
 *
 * 두 곳에 같은 사실이 적히지만(규칙 3) 진짜 방어는 DB 제약이고 이쪽은 문구용이다.
 * 제약을 지우면 실제로 구멍이 생기므로, 어긋나면 이 파일을 SQL에 맞춘다.
 */
export const USERNAME_PATTERN = /^[a-z0-9_]{3,20}$/;

export const usernameSchema = z
	.string()
	.regex(USERNAME_PATTERN, "별명은 영문 소문자, 숫자, 밑줄로 3~20자예요");
