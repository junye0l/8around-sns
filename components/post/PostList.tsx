import { CommentCount } from "@/components/ui/CommentCount";
import { ContentCard } from "@/components/ui/ContentCard";
import type { FeedPost } from "@/lib/queries/post";

/**
 * 글 목록. 추천, 팔로잉, 프로필 세 화면이 같은 모양이라 하나를 같이 쓴다 (규칙 2).
 *
 * 빈 상태는 받지 않는다. 문구가 화면마다 다르고 팔로잉은 둘로 갈리므로 부르는 쪽이 정한다.
 */
export function PostList({ posts }: { posts: FeedPost[] }) {
	return posts.map((post) => (
		<ContentCard
			author={post.author}
			content={post.content}
			createdAt={post.created_at}
			footer={
				<CommentCount
					count={post.comment_count}
					href={`/post/${post.id}`}
					label="댓글"
				/>
			}
			key={post.id}
		/>
	));
}
