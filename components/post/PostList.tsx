import { LikeButton } from "@/components/post/LikeButton";
import { PostMenu } from "@/components/post/PostMenu";
import { CommentCount } from "@/components/ui/CommentCount";
import { ContentCard } from "@/components/ui/ContentCard";
import type { FeedPost } from "@/lib/queries/post";

/**
 * 글 목록. 추천, 팔로잉, 프로필 세 화면이 같은 모양이라 하나를 같이 쓴다 (규칙 2).
 *
 * 빈 상태는 받지 않는다. 문구가 화면마다 다르고 팔로잉은 둘로 갈리므로 부르는 쪽이 정한다.
 *
 * 더보기 메뉴는 내가 쓴 글에만 붙는다. 별명은 유일하므로(`supabase/migrations/0001_init.sql:14`) 그것으로 가른다 —
 * 이걸 위해 질의에 작성자 id를 더하지 않는다.
 */
export function PostList({
	posts,
	viewerUsername,
}: {
	posts: FeedPost[];
	/** 지금 보는 사람의 별명. 없으면 어느 글에도 메뉴가 붙지 않는다 */
	viewerUsername?: string;
}) {
	return posts.map((post) => (
		<ContentCard
			author={post.author}
			content={post.content}
			createdAt={post.created_at}
			footer={
				<>
					<LikeButton
						count={post.like_count}
						liked={post.liked}
						postId={post.id}
					/>
					<CommentCount
						count={post.comment_count}
						href={`/post/${post.id}`}
						label="댓글"
					/>
				</>
			}
			key={post.id}
			menu={
				post.author.username === viewerUsername ? (
					<PostMenu
						authorName={post.author.display_name}
						content={post.content}
						postId={post.id}
					/>
				) : undefined
			}
		/>
	));
}
