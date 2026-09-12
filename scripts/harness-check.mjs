/**
 * AGENTS.md의 규칙 중 기계가 볼 수 있는 것만 검사한다.
 *
 * 판단이 필요한 규칙(1, 2, 4, 6, 14)은 여기서 보지 않는다. 사람과 PR 리뷰가 본다.
 * 실행은 `npm run verify`가 한다.
 */
import { readdirSync, readFileSync, statSync } from "node:fs";
import { dirname, join, relative, resolve } from "node:path";

const ROOT = resolve(import.meta.dirname, "..");
const SKIP = new Set(["node_modules", ".next", ".git", "exports", "public"]);

/** 레포 안의 파일 경로를 전부 모은다. 루트 기준 상대 경로로 돌려준다. */
function walk(dir = ROOT, out = []) {
	for (const name of readdirSync(dir)) {
		if (SKIP.has(name)) continue;
		const full = join(dir, name);
		if (statSync(full).isDirectory()) walk(full, out);
		else out.push(relative(ROOT, full));
	}
	return out;
}

const files = walk();
const read = (p) => readFileSync(join(ROOT, p), "utf8");
const code = files.filter((f) => /\.tsx?$/.test(f) && !f.startsWith("types/"));
const fails = [];
const fail = (rule, file, line, message) =>
	fails.push({ rule, file, line, message });

/** 규칙 3. services와 utils는 프레임워크를 모른다. */
for (const f of code.filter((f) => /^lib\/(services|utils)\//.test(f))) {
	read(f)
		.split("\n")
		.forEach((text, i) => {
			if (/from\s+["']next[/"]|["']use (server|client)["']/.test(text))
				fail("구조", f, i + 1, "services와 utils는 Next를 import하지 않는다");
		});
}

/** 스타일. 임의의 값을 쓰지 않는다. 토큰 참조와 `허용:` 주석은 통과시킨다. */
for (const f of code) {
	const lines = read(f).split("\n");
	lines.forEach((text, i) => {
		for (const [hit] of text.matchAll(/[a-z][\w-]*-\[[^\]]+\]/g)) {
			if (hit.includes("var(--")) continue;
			if (/허용:/.test(lines[i - 1] ?? "")) continue;
			fail(
				"스타일",
				f,
				i + 1,
				`임의의 값 ${hit}. 토큰을 쓰거나 윗줄에 "허용: 이유"`,
			);
		}
	});
}

/** 규칙 3. `@theme`에 선언해 놓고 아무도 안 쓰는 색 토큰은 남기지 않는다. */
{
	const css = read("app/globals.css");
	const used = code.map(read).join("\n");
	for (const [, name] of css.matchAll(/--color-([\w-]+):/g)) {
		const utility = new RegExp(`[\\w-]+-${name}\\b`);
		if (!utility.test(used) && !used.includes(`--color-${name}`))
			fail(
				"토큰",
				"app/globals.css",
				0,
				`--color-${name}을 아무도 쓰지 않는다`,
			);
	}
}

/** 규칙 10. 화면의 네 자리 중 파일로 드러나는 것만 본다. */
{
	const has = (p) => files.includes(p);
	const covered = (dir, name) => {
		for (let d = dir; d.startsWith("app"); d = dirname(d))
			if (has(join(d, name))) return true;
		return false;
	};
	for (const page of files.filter((f) => /^app\/.*page\.tsx$/.test(f))) {
		const dir = dirname(page);
		// 데이터를 기다리지 않는 화면은 멈춰 있을 시간이 없어 loading.tsx가 뜰 일이 없다.
		// AGENTS.md 규칙 10이 그런 폼은 버튼 비활성으로 대신한다고 적는다 (로그인, 가입)
		const waits = /export default async function/.test(read(page));
		if (waits && !covered(dir, "loading.tsx"))
			fail("규칙 10", page, 0, "이 라우트를 덮는 loading.tsx가 없다");
		if (/notFound\(\)/.test(read(page)) && !covered(dir, "not-found.tsx"))
			fail("규칙 10", page, 0, "notFound()를 부르는데 not-found.tsx가 없다");
	}
	if (!has("app/not-found.tsx"))
		fail("규칙 10", "app/", 0, "없는 주소를 받을 not-found.tsx가 없다");
	if (!has("app/error.tsx")) fail("규칙 10", "app/", 0, "error.tsx가 없다");
}

/** 규칙 3. 문서의 절 번호를 코드가 인용하면 문서가 바뀔 때 조용히 거짓이 된다. */
for (const f of code) {
	read(f)
		.split("\n")
		.forEach((text, i) => {
			if (/§/.test(text))
				fail(
					"규칙 3",
					f,
					i + 1,
					"문서 절 번호 대신 파일 경로나 결정 번호로 가리킨다",
				);
		});
}

/** 규칙 3. 문서끼리 가리키는 링크가 실제 파일이어야 한다. */
for (const f of files.filter((f) => f.endsWith(".md") && !f.startsWith("."))) {
	const lines = read(f).split("\n");
	lines.forEach((text, i) => {
		for (const [, target] of text.matchAll(/]\(([^)]+)\)/g)) {
			if (/^(https?:|#|mailto:)/.test(target)) continue;
			const path = relative(
				ROOT,
				resolve(dirname(join(ROOT, f)), target.split("#")[0]),
			);
			if (!files.includes(path))
				fail("문서", f, i + 1, `${target} 가 없는 파일이다`);
		}
	});
}

/** 규칙 3. cn()이 아는 타입 스케일 이름과 `@theme`의 `--text-*`가 같아야 한다. */
{
	const declared = [...read("app/globals.css").matchAll(/--text-([\w-]+):/g)]
		.map(([, name]) => name)
		.filter((name) => !name.includes("--"));
	const known =
		read("lib/utils/cn.ts").match(/FONT_SIZES = \[([^\]]*)\]/)?.[1] ?? "";
	for (const name of declared)
		if (!known.includes(`"${name}"`))
			fail(
				"규칙 3",
				"lib/utils/cn.ts",
				0,
				`--text-${name}이 FONT_SIZES에 없다`,
			);
}

/** 규칙 14. 결정 기록과 목차가 서로 맞아야 한다. */
{
	const index = read("docs/decisions/README.md");
	for (const f of files.filter((f) => /^docs\/decisions\/\d{4}-/.test(f)))
		if (!index.includes(f.replace("docs/decisions/", "")))
			fail("규칙 14", "docs/decisions/README.md", 0, `${f} 가 목차에 없다`);
}

if (fails.length === 0) {
	console.log("harness-check: 통과");
	process.exit(0);
}
const width = Math.max(...fails.map((f) => f.rule.length));
for (const { rule, file, line, message } of fails)
	console.error(
		`${rule.padEnd(width)}  ${file}${line ? `:${line}` : ""}  ${message}`,
	);
console.error(`\nharness-check: ${fails.length}건`);
process.exit(1);
