/**
 * 카드 안의 작은 제목줄. 게시글 화면은 "댓글", 답글 화면은 "답글", 프로필은 "게시글"이라 적는다.
 * 어디까지가 위 칸이고 어디부터가 목록인지 눈으로 끊어 준다.
 */
export function SectionHeading({ label }: { label: string }) {
	return (
		<h2 className="border-hairline border-b px-4 py-3 md:px-6 text-body-sm font-semibold text-fg">
			{label}
		</h2>
	);
}
