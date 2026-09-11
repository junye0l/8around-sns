# 8around SNS — 계획

해야 할 일을 모아두는 곳. 끝난 항목은 체크한다.
**범위(요구 기능 6개 / 범위 밖)는 `AGENTS.md`에 있다.** 여기에 다시 적지 않는다.

---

## 스택

| 영역 | 선택 | 이유 |
|------|------|------|
| 프레임워크 | Next.js 16 (App Router) + TypeScript strict | 서버 컴포넌트로 데이터 페칭 레이어를 따로 안 만듦 |
| DB / 인증 | Supabase (Postgres + Auth + RLS) | 요구 기능 6개 중 회원가입·로그인이 설정으로 끝남 |
| 스타일 | Tailwind v4 + `docs/DESIGN.md` 토큰 | 토큰을 `@theme`로 노출하고 공통 컴포넌트에 가둔다 |
| 배포 | Vercel | push = 프리뷰 URL |
| 린트/포맷 | Biome | ESLint + Prettier + 플러그인들을 의존성 하나로 대체 |
| 테스트 | Vitest | 순수 함수 방어용 최소 테스트 |

---

## 1. 하네스

- [x] Next.js + TypeScript `strict`
- [x] Biome (lint + format 통합), `npm run verify` 한 줄로 수렴
- [x] GitHub Actions CI 1개 — lint → typecheck → test → build
- [x] `AGENTS.md` 규칙 13개 + 커밋/브랜치 컨벤션, `CLAUDE.md`는 포인터만
- [x] PR 템플릿
- [x] PR 자동 리뷰 워크플로 (Claude, `AGENTS.md` 기준)
- [x] GitHub 레포 생성 (`junye0l/8around-sns`)
- [x] 첫 푸시
- [x] Vercel 연결 → https://8around-new-sns-beta.vercel.app
- [ ] Supabase Auth URL Configuration (Site URL + Redirect URLs)

## 2. 기반

- [x] Supabase 프로젝트 생성, `.env.local` 채우기
- [x] `lib/supabase/` 클라이언트 (server / client / middleware)
- [x] 마이그레이션으로 4테이블 생성
  - `profiles` — id(auth.users FK), username, display_name, bio
  - `posts` — id, author_id, content, created_at
  - `comments` — id, post_id, author_id, **parent_id (self FK, nullable)**, content
  - `follows` — follower_id, following_id (복합 PK)
- [x] RLS 정책 — 읽기는 공개, 쓰기/삭제는 본인만
- [x] DB 타입 생성 (`types/`) + 생성 명령을 `package.json`에 등록

## 3. 인증

- [x] 회원가입 → 프로필 생성 (`on_auth_user_created` 트리거가 만든다)
- [x] 로그인 / 로그아웃, 세션 유지 — 이메일 + 비밀번호 ([결정 0001](decisions/0001-login-identifier.md)). 로그아웃은 `SideNav` 맨 아래에 있다
- [x] 비로그인 상태에서 보호 라우트 접근 차단 — 허용 목록(`lib/utils/auth-route.ts`)에 없는 경로는 전부 `/login`으로 보낸다 ([결정 0006](decisions/0006-feed-requires-login.md))
  - [x] 반대 방향은 됐다 — 로그인한 사용자는 `/login` · `/signup`에 못 들어간다

## 4. 콘텐츠

- [x] 게시글 작성
- [x] 피드 노출 (최신순)
- [x] 댓글 작성 — 게시글 상세(`/post/[id]`)에서 단다
- [ ] 대댓글 — `parent_id`로 **1뎁스까지만** 편다. 댓글 상세(`/comment/[id]`)에서 단다
- [x] ~~댓글 트리 변환은 `lib/utils/`의 순수 함수로 + 테스트 1개~~ — 화면을 나눠서 펼 트리가 없어졌다 ([결정 0007](decisions/0007-comment-routes.md))

## 5. 소셜

- [ ] 팔로우 / 언팔로우 토글
- [ ] 팔로워 · 팔로잉 목록
- [ ] 팔로잉 기준 피드 필터

## 6. 공통 컴포넌트

`docs/DESIGN.md` §4 Components & States를 구현 스펙으로 삼는다. 문서에 없는 값은 지어내지 않는다(§7 Unknowns).

- [x] 토큰을 `app/globals.css`에 옮기고 `@theme`로 노출
- [ ] `Button` — primary / secondary / ghost / danger, loading, disabled
- [x] `Avatar` — 이름 첫 글자. 이미지 업로드는 범위 밖이다
- [x] `Composer` — 게시글과 댓글이 같이 쓴다. 숨은 입력만 바깥에서 넣는다
- [x] `ContentCard` — 게시글과 댓글이 같은 모양이라 하나를 같이 쓴다. 그림자 없음, `border-hairline` 1px로만 분리
- [x] `PageShell` — 레일 · 가운데 컬럼 · 붙박이 제목줄. 화면마다 다시 적지 않는다
- [x] `SideNav` — 왼쪽 레일. 로고 · 추천 · **로그아웃**(§3이 여기 딸려 왔다). `TabBar`는 모바일 대응 때 §7에서 같이 본다
- [x] `Skeleton` — `bg-hairline` 블록, 최종 레이아웃과 같은 치수 (§4 States)
- [ ] `EmptyState`, `Spinner`

## 7. 인터랙션 · 상태

- [ ] 모든 화면에 로딩 / 빈 상태 / 에러 3종 (AGENTS.md 규칙 10)
- [ ] 낙관적 업데이트 — 팔로우 토글, 댓글 작성
- [ ] 전환은 `--motion-fast`(150ms) / `--motion-standard`(250ms), 이징은 `--ease-enter` / `--ease-exit` / `--ease-standard` 셋만
- [ ] `prefers-reduced-motion` 존중 — `app/globals.css`에 전역 처리됨
- [ ] **태블릿 · 모바일 대응** — 웹 폭을 먼저 다 세우고 뒤에 붙인다. 폭마다 분기를 미리 깔면 레이아웃이 바뀔 때마다 두 벌을 고친다. 레일은 `TabBar`로 접힌다

## 8. 애니메이션

**UI와 기능이 다 선 뒤에 얹는다.** 레이아웃이 흔들리는 중에 넣으면 두 번 작업이 된다.

- [ ] 목록 진입 / 댓글 추가 시 fade + y 이동 (12px 이내)
- [ ] 카드 탭 시 98% 스케일 압축 (`motion-fast` / `ease-standard`) — 스프링·오버슈트 금지
- [ ] 모달 · 시트 열고 닫힘
- [ ] CSS transition 우선. 라이브러리는 CSS로 안 될 때만

> 과하면 "AI 티"로 되돌아간다. 사용자의 행동에 **반응하는** 것만 넣고, 알아서 움직이는 장식은 넣지 않는다.

## 9. 마감

- [ ] 심사 시나리오 E2E 1개 — 가입 → 로그인 → 글 작성 → 댓글 → 대댓글 → 팔로우
- [ ] 위 시나리오를 **배포 URL에서 사람 손으로** 한 번 통과
- [ ] `docs/DESIGN.md` §1 Do/Don't + Principles를 화면마다 대조 — 주황 1개, 그림자 없음, 4px 그리드
- [ ] README — 배포 URL, 체험 경로, 테스트 계정, 로컬 실행 방법

---

## 순서 규칙

1. **2 → 3 → 4 → 5.** 기반 없이 화면부터 만들지 않는다.
2. **한 기능은 세로로 관통한다** — 쿼리 → UI → 배포 확인까지 끝내고 다음으로. 화면을 전부 만들고 나중에 데이터를 붙이지 않는다 (AGENTS.md 규칙 11).
3. **6은 4·5와 같이 간다.** 화면을 만들면서 필요한 컴포넌트를 그때 `components/ui/`에 만든다. 미리 다 만들어두지 않는다.
4. **8은 마지막.** 7까지 끝난 뒤에 얹는다.

## 결정 대기

없음. 새로 생기면 `AGENTS.md`의 "아직 정하지 않은 것"에 적고, 정해지기 전까지 해당 코드를 쓰지 않는다.
