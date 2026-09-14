import { LikeButton } from "@/components/post/LikeButton";
import { POST_MENU } from "@/components/post/post-compose";
import { CommentCount } from "@/components/ui/CommentCount";
import { ContentCard } from "@/components/ui/ContentCard";
import { ContentMenu } from "@/components/ui/ContentMenu";
import type { FeedPost } from "@/lib/queries/post";
import { postHref } from "@/lib/utils/back-target";

/**
 * 글 목록. 전체, 팔로잉, 좋아요, 프로필 네 화면이 같은 모양이라 하나를 같이 쓴다 (규칙 2).
 * 글마다 카드 한 장이고 카드 사이가 12px이다.
 *
 * 빈 상태는 받지 않는다. 문구가 화면마다 다르고 팔로잉은 둘로 갈리므로 부르는 쪽이 정한다.
 *
 * 더보기 메뉴는 내가 쓴 글에만 붙는다. 작성자 id와 보는 사람의 id로 가른다.
 */
export function PostList({
	posts,
	viewerId,
	from,
}: {
	posts: FeedPost[];
	/** 지금 보는 사람의 id. 없으면 어느 글에도 메뉴가 붙지 않는다 */
	viewerId?: string;
	/** 지금 화면의 경로. 글 상세의 뒤로 가기가 이 화면으로 돌아온다 (`lib/utils/back-target.ts`) */
	from?: string;
}) {
	const items = posts.map((post) => (
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
						href={postHref(post.id, from)}
						label="댓글"
					/>
				</>
			}
			href={postHref(post.id, from)}
			key={post.id}
			menu={
				post.author.id === viewerId ? (
					<ContentMenu
						authorAvatar={post.author.avatar_path}
						authorId={post.author.id}
						authorName={post.author.display_name}
						config={POST_MENU}
						content={post.content}
						id={post.id}
					/>
				) : undefined
			}
		/>
	));

	return <div className="flex flex-col gap-3">{items}</div>;
}
