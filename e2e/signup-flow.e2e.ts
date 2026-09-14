import { type Browser, expect, type Page, test } from "@playwright/test";

/**
 * 심사 시나리오. 가입, 로그인, 글 작성, 댓글, 대댓글, 팔로우를 한 줄로 지난다.
 * 원격 DB에 대고 돌므로 끝나면 글과 팔로우를 지운다. 계정 둘은 남는다. 결정 0048
 */

const run = Date.now().toString(36);
const PASSWORD = "e2e-pass-1234";

type Account = { email: string; name: string };

const writer: Account = {
	email: `e2e-a-${run}@example.com`,
	name: `e2e-a-${run}`,
};
const follower: Account = {
	email: `e2e-b-${run}@example.com`,
	name: `e2e-b-${run}`,
};

const POST = `E2E 글 ${run}`;
const COMMENT = `E2E 댓글 ${run}`;
const REPLY = `E2E 답글 ${run}`;

async function signUp(page: Page, account: Account) {
	await page.goto("/signup");
	await page.getByLabel("이메일", { exact: true }).fill(account.email);
	await page.getByLabel("별명", { exact: true }).fill(account.name);
	await page.getByLabel("비밀번호", { exact: true }).fill(PASSWORD);
	await page.getByRole("button", { name: "회원가입하기" }).click();
	await expect(page).toHaveURL("/");
}

async function newPage(browser: Browser) {
	const context = await browser.newContext();
	return context.newPage();
}

test("가입부터 팔로우까지", async ({ browser }) => {
	const a = await newPage(browser);
	const b = await newPage(browser);
	let postUrl: string | undefined;
	let writerUrl: string | undefined;
	let followed = false;

	try {
		await test.step("1. A가 가입한다", async () => {
			await signUp(a, writer);
		});

		await test.step("2. A가 로그아웃하고 다시 로그인한다", async () => {
			await a.getByRole("button", { name: "더 보기" }).click();
			await a.getByRole("menuitem", { name: "로그아웃" }).click();
			await expect(a).toHaveURL("/login");

			await a.getByLabel("이메일", { exact: true }).fill(writer.email);
			await a.getByLabel("비밀번호", { exact: true }).fill(PASSWORD);
			await a.getByRole("button", { name: "로그인" }).click();
			await expect(a).toHaveURL("/");
		});

		await test.step("3. A가 글을 쓴다", async () => {
			await a.getByRole("button", { name: "무슨 생각을 하고 있나요?" }).click();
			const sheet = a.getByRole("dialog");
			await sheet.getByRole("textbox").fill(POST);
			await sheet.getByRole("button", { name: "게시", exact: true }).click();
			await expect(a.getByText(POST)).toBeVisible();
			// 다음 단계가 실패해도 정리할 수 있게 글 주소를 먼저 잡는다
			const postLink = a.getByRole("link", {
				name: `${writer.name}님의 글 보기`,
			});
			postUrl = (await postLink.getAttribute("href")) ?? undefined;
		});

		await test.step("4. A가 글에 댓글을 단다", async () => {
			await a.getByRole("link", { name: `${writer.name}님의 글 보기` }).click();
			await expect(a).toHaveURL(/\/post\//);
			writerUrl = await a
				.getByRole("article")
				.getByRole("link", { name: writer.name })
				.getAttribute("href")
				.then((href) => href ?? undefined);

			await a.getByRole("button", { name: "댓글 남기기" }).click();
			const sheet = a.getByRole("dialog");
			await sheet.getByRole("textbox").fill(COMMENT);
			await sheet.getByRole("button", { name: "댓글", exact: true }).click();
			await expect(a.getByText(COMMENT)).toBeVisible();
		});

		await test.step("5. A가 댓글에 답글을 단다", async () => {
			await a.getByRole("link", { name: "답글 달기" }).click();
			await expect(a).toHaveURL(/\/comment\//);

			await a.getByRole("button", { name: "답글 남기기" }).click();
			const sheet = a.getByRole("dialog");
			await sheet.getByRole("textbox").fill(REPLY);
			await sheet.getByRole("button", { name: "답글", exact: true }).click();
			await expect(a.getByText(REPLY)).toBeVisible();

			await a.getByRole("link", { name: "게시글", exact: true }).click();
			await expect(
				a.getByRole("link", { name: "답글 1개 보기" }),
			).toBeVisible();
		});

		await test.step("6. B가 가입한다", async () => {
			await signUp(b, follower);
		});

		await test.step("7. B가 A를 팔로우한다", async () => {
			if (!writerUrl) throw new Error("A의 프로필 주소를 읽지 못했다");
			await b.goto(writerUrl);
			await b.getByRole("button", { name: "팔로우", exact: true }).click();
			await expect(
				b.getByRole("button", { name: "팔로잉", exact: true }),
			).toBeVisible();
			followed = true;

			await b.goto("/following");
			await expect(b.getByText(POST)).toBeVisible();
		});
	} finally {
		// 실패해도 원격 DB에 남기지 않는다. 글을 지우면 댓글과 답글은 cascade로 같이 지워진다
		if (followed && writerUrl) {
			await b.goto(writerUrl);
			await b.getByRole("button", { name: "팔로잉", exact: true }).click();
			await expect(
				b.getByRole("button", { name: "팔로우", exact: true }),
			).toBeVisible();
		}
		if (postUrl) {
			await a.goto(postUrl);
			await a.getByRole("button", { name: "이 글 더 보기" }).click();
			await a.getByRole("menuitem", { name: "삭제" }).click();
			await a
				.getByRole("dialog")
				.getByRole("button", { name: "삭제", exact: true })
				.click();
			await expect(a.getByText(POST)).toHaveCount(0);
		}
	}
});
