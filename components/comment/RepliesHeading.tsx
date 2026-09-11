/**
 * 입력칸과 목록 사이의 작은 제목줄. 게시글 화면은 "댓글", 답글 화면은 "답글"이라 적는다.
 * 어디까지가 본문이고 어디부터가 달린 것인지 눈으로 끊어 준다.
 */
export function RepliesHeading({ label }: { label: string }) {
	return (
		<h2 className="border-hairline border-b px-6 py-3 text-body-sm font-semibold text-fg">
			{label}
		</h2>
	);
}
