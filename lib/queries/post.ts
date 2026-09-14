import type { SupabaseClient } from "@supabase/supabase-js";
import { z } from "zod";
import type { Database } from "@/types/database";

export type FeedPost = {
	id: string;
	content: string;
	created_at: string;
	comment_count: number;
	like_count: number;
	/** 지금 보는 사람이 이 글에 좋아요를 눌렀는가 */
	liked: boolean;
	author: {
		username: string;
		display_name: string;
		avatar_path: string | null;
	};
};

/** 한 번에 읽어올 개수. 무한 스크롤은 범위 밖이라 첫 장만 본다 */
const FEED_LIMIT = 50;

/**
 * 네 질의가 같은 모양을 쓴다. 한 곳만 고치면 네 화면이 같이 바뀐다 (규칙 2).
 *
 * `comments(count)`와 `post_likes(count)`는 글마다 수를 DB에서 세어 온다. 글을 읽고
 * 나서 수를 따로 물으면 N+1이 된다. 댓글은 `comments_post_id_idx`(0001_init.sql:88),
 * 좋아요는 기본키 앞부분(`0003_post_likes.sql:15`)이 받는다.
 *
 * `liked_by_viewer`는 컬럼이 아니라 계산 컬럼이다. 보는 사람 id를 화면에서 넘기지
 * 않고 DB가 요청의 JWT에서 꺼낸다 (`supabase/migrations/0004_post_liked_by_viewer.sql`).
 * 생성된 타입에서는 Functions에 있어 select 문자열의 타입 추론이 닿지 않는다.
 * 그래서 행 모양을 `PostRow`로 직접 적는다.
 *
 * `profiles` 임베드에 FK 이름을 붙이는 이유: `post_likes`가 생기면서 `posts`와
 * `profiles` 사이 관계가 둘이 됐다(작성자, 좋아요를 거친 다대다). 이름을 안 주면
 * PostgREST가 PGRST201로 거절한다.
 */
const POST_SELECT =
	"id, content, created_at, author:profiles!posts_author_id_fkey(username, display_name, avatar_path), comments(count), post_likes(count), liked_by_viewer";

type PostRow = Omit<FeedPost, "comment_count" | "like_count" | "liked"> & {
	comments: { count: number }[];
	post_likes: { count: number }[];
	liked_by_viewer: boolean;
};

// PostgREST는 집계를 배열 한 칸으로 돌려준다. 화면까지 그 모양을 들고 가지 않는다
function toFeedPost({
	comments,
	post_likes,
	liked_by_viewer,
	...post
}: PostRow): FeedPost {
	return {
		...post,
		comment_count: comments[0]?.count ?? 0,
		like_count: post_likes[0]?.count ?? 0,
		liked: liked_by_viewer,
	};
}

/**
 * 피드. 최신순 단일 정렬이고 `posts_created_at_idx`가 그대로 받는다
 * (`supabase/migrations/0001_init.sql:68`).
 *
 * 작성자는 조인해서 같이 읽는다. 글마다 프로필을 따로 부르면 N+1이 된다.
 * 읽기 권한은 RLS가 본다 — "게시글은 누구나 본다"(같은 파일 126-128).
 *
 * 실패하면 던진다. 화면의 에러 상태는 `app/error.tsx`가 받는다 (규칙 10).
 */
export async function listFeed(
	supabase: SupabaseClient<Database>,
): Promise<FeedPost[]> {
	const { data, error } = await supabase
		.from("posts")
		.select(POST_SELECT)
		.order("created_at", { ascending: false })
		.limit(FEED_LIMIT)
		.returns<PostRow[]>();

	if (error) throw new Error(`피드를 읽지 못했다: ${error.message}`);

	return data.map(toFeedPost);
}

/**
 * 게시글 하나. 없으면 null이고, 화면은 그걸 404로 바꾼다.
 *
 * id를 먼저 검사하는 이유: uuid가 아닌 주소로 들어오면 Postgres가 캐스팅에서
 * 터지고(22P02) 그건 에러 화면으로 샌다. 없는 글과 이상한 주소는 같은 결과여야 한다.
 */
export async function getPost(
	supabase: SupabaseClient<Database>,
	id: string,
): Promise<FeedPost | null> {
	if (!z.uuid().safeParse(id).success) return null;

	const { data, error } = await supabase
		.from("posts")
		.select(POST_SELECT)
		.eq("id", id)
		.maybeSingle()
		.returns<PostRow>();

	if (error) throw new Error(`글을 읽지 못했다: ${error.message}`);

	return data && toFeedPost(data);
}

/**
 * 내가 팔로우하는 사람들의 글만. 정렬과 개수는 추천 피드와 같다.
 *
 * 누구를 팔로우하는지는 DB 함수 `following_posts`가 요청의 JWT로 거른다
 * (`supabase/migrations/0005_following_posts.sql`). 그래서 보는 사람 id를 받지 않고,
 * 프로필 조회와 나란히 던질 수 있다 — 전에는 내 id → 팔로우 목록 → 글, 세 번을
 * 차례로 갔다. 결정 0025.
 *
 * 함수가 `setof posts`를 돌려주므로 select 문자열과 정렬, 개수는 추천 피드와 같은 것을 쓴다.
 *
 * 비어 있을 때 "팔로우한 사람이 없다"와 "팔로우했는데 글이 없다"를 가르는 것은 부르는 쪽이
 * 한다 — 그 구분은 빈 경우에만 필요해서 여기서 매번 묻지 않는다.
 *
 * 실패하면 던진다. 화면의 에러 상태는 `app/error.tsx`가 받는다 (규칙 10).
 */
export async function listFollowingFeed(
	supabase: SupabaseClient<Database>,
): Promise<FeedPost[]> {
	const { data, error } = await supabase
		.rpc("following_posts")
		.select(POST_SELECT)
		.order("created_at", { ascending: false })
		.limit(FEED_LIMIT)
		.returns<PostRow[]>();

	if (error) throw new Error(`팔로잉 피드를 읽지 못했다: ${error.message}`);

	return data.map(toFeedPost);
}

/**
 * 한 사람이 쓴 글. 정렬과 개수는 추천 피드와 같다. 프로필 화면이 헤더 아래에 편다.
 *
 * `posts_author_id_idx`(`supabase/migrations/0001_init.sql:69`)가 필터를 받는다.
 *
 * 실패하면 던진다. 화면의 에러 상태는 `app/error.tsx`가 받는다 (규칙 10).
 */
export async function listPostsByAuthor(
	supabase: SupabaseClient<Database>,
	authorId: string,
): Promise<FeedPost[]> {
	const { data, error } = await supabase
		.from("posts")
		.select(POST_SELECT)
		.eq("author_id", authorId)
		.order("created_at", { ascending: false })
		.limit(FEED_LIMIT)
		.returns<PostRow[]>();

	if (error) throw new Error(`쓴 글을 읽지 못했다: ${error.message}`);

	return data.map(toFeedPost);
}
