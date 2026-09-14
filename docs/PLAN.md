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
- [x] `AGENTS.md` 규칙 15개 + 커밋/브랜치 컨벤션, `CLAUDE.md`는 포인터만
- [x] PR 템플릿
- [x] PR 자동 리뷰 워크플로 (Claude, `AGENTS.md` 기준)
- [x] GitHub 레포 생성 (`junye0l/8around-sns`)
- [x] 첫 푸시
- [x] Vercel 연결 → https://8around-new-sns-beta.vercel.app
- [x] Supabase Auth URL Configuration (Site URL + Redirect URLs)
- [x] `npm run harness` — 규칙 중 기계가 볼 수 있는 것을 검사하고 `verify`가 부른다
- [ ] Claude Code 훅 — 행동 직전에 막아야 하는 규칙. `.env` 열람, `main` 직접 커밋, 히스토리 다시 쓰기, `npm run dev` 실행
- [ ] GitHub 브랜치 보호 — 훅은 에이전트만 막는다. 사람은 레포 설정이 막는다
- [ ] 과정 검증 - 새 세션에 "팔로우 기능 구현해줘" 한 줄만 주고 결과를 채점한다. 빠뜨린 단계가 스킬의 목차가 된다
- [ ] `/new-feature` 스킬 — 맥락 수집, 브랜치, 계획 승인까지. 구현 뒤는 `/pr`이 받는다. 위 검증 뒤에 만든다

## 2. 기반

- [x] Supabase 프로젝트 생성, `.env.local` 채우기
- [x] `lib/supabase/` 클라이언트 (server / client / middleware)
- [x] 마이그레이션으로 4테이블 생성
  - `profiles` — id(auth.users FK), display_name, bio
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
- [x] 대댓글 — `parent_id`로 **1뎁스까지만** 편다. 게시글 화면에서 부모 아래 세로선으로 보이고, 다는 것은 `/comment/[id]`에서 한다 ([결정 0008](decisions/0008-reply-tree-on-post.md))
- [x] 댓글 트리 변환은 `lib/utils/`의 순수 함수로 + 테스트 1개 — `comment-tree.ts`. 0007에서 한 번 지웠다가 게시글 화면이 답글까지 펴면서 되살렸다 ([결정 0008](decisions/0008-reply-tree-on-post.md))
- [x] 좋아요 — 게시글에만 단다. 수는 계산 컬럼 `like_count`가, 내가 눌렀는지는 계산 컬럼 `liked_by_viewer`가 요청의 JWT에서 본다. 누가 눌렀는지는 본인만 읽는다 ([결정 0020](decisions/0020-post-likes.md), [0031](decisions/0031-post-likes-private.md)). 사용자가 요청해서 범위에 들어왔다

## 5. 소셜

- [x] 프로필 화면 — `/u/[id]`. 글 · 댓글의 이름을 누르면 간다 ([결정 0011](decisions/0011-profile-routes.md), [0032](decisions/0032-nickname-as-handle.md))
- [x] 팔로우 / 언팔로우 토글 — 프로필 화면 한 곳에서 한다. 의도를 버튼이 보내고 중복은 무시한다 (결정 0011)
- [x] 팔로워 · 팔로잉 수와 목록 — 수를 누르면 `/u/[id]/followers` · `/following`으로 간다
- [x] 팔로잉 기준 피드 필터 — `/following`. 팔로우 목록을 먼저 읽고 `in`으로 거른다 (`lib/queries/post.ts`의 `listFollowingFeed`)
- [x] 프로필 화면에 그 사람이 쓴 글 — 헤더 아래에 최신순으로 편다 (`lib/queries/post.ts`의 `listPostsByAuthor`). 사용자가 요청해서 범위에 들어왔다
- [x] 좋아요한 글 피드 — `/likes`. 누른 시각의 역순이고 `post_likes`에서 출발해 글을 임베드한다 (`lib/queries/post.ts`의 `listLikedFeed`, [결정 0029](decisions/0029-liked-feed-from-post-likes.md)). 사용자가 요청해서 범위에 들어왔다
- [x] 프로필 편집 — 내 프로필의 팔로우 버튼 자리에 "프로필 편집" 버튼, 모달에서 별명과 프로필 이미지를 바꾼다.
  별명은 겹치지 않는다(대소문자 무시). 이미지는 Storage `avatars` 버킷에 두고 프로필에는 경로만 저장한다
  (`supabase/migrations/0007_profile_avatars.sql`, [결정 0030](decisions/0030-profile-avatar-upload.md)). 사용자가 요청해서 범위에 들어왔다.
  나중에 편집할 칸이 늘면 모달에서 화면으로 옮길 수 있다. `bio`는 아직 채울 길이 없다
- [x] 아이디(`username`) 컬럼 지우기 — 별명이 사람을 가리키는 이름이고 주소는 id다([결정 0032](decisions/0032-nickname-as-handle.md)).
  0009로 넓히고 코드를 배포한 뒤 0010이 컬럼과 트리거의 username을 지웠다

## 6. 공통 컴포넌트

`docs/DESIGN.md`의 Components & States를 구현 스펙으로 삼는다. 문서에 없는 값은 지어내지 않는다.

shadcn 도입은 여기 딸린다. 가져오는 기준은 [결정 0009](decisions/0009-toss-tds-tokens.md)가 정한 방향을 따른다.

- [x] CLI를 쓰지 않는다. 레포 구조를 CLI가 바꾸게 두지 않고 소스만 옮긴다. `cva`, `clsx`, `tailwind-merge` 셋을 깔았다
- [x] `Button`을 shadcn 구조로 다시 썼다. pressed와 keyboard focus를 채웠다
- [x] 기본 버튼 높이 40px ([결정 0015](decisions/0015-threads-shell.md)). 작은 버튼(60x36)은 결정 0014에서 따로 정해졌다
- [x] `Dialog`와 `DropdownMenu`를 radix로 가져왔다 ([결정 0013](decisions/0013-sidebar-overlays.md)). Sheet, Tabs는 아직 쓸 화면이 없다
- [ ] `Avatar`, `Card`, `Skeleton`, `Input`은 가져오지 않는다. 지금 것이 같거나 더 맞다
- [ ] 새 의존성은 설치 전에 묻는다

- [x] 토큰을 `app/globals.css`에 옮기고 `@theme`로 노출
- [x] `Button` — primary(검정), outline, loading, disabled, pressed, keyboard focus, `href`(링크형). 높이 40px
- [x] `Avatar` — 프로필 이미지, 없으면 사람 아이콘 (결정 0030)
- [x] `Composer` — 게시글 · 댓글 · 답글이 같이 쓴다. 숨은 입력(`post_id` · `parent_id`)만 바깥에서 넣는다. 카운터 없음, 높이 고정 ([결정 0014](decisions/0014-composer-layout.md))
- [x] `ContentCard` — 게시글 · 댓글 · 답글이 같은 모양이라 하나를 같이 쓴다. 그림자 없음, `border-hairline` 1px로만 분리. `connected`면 아바타 밑으로 스레드 세로선이 흐른다
- [x] `PageShell` — 가운데 카드 컬럼 · 붙박이 제목줄. 카드 상자도 여기서 그린다 ([결정 0015](decisions/0015-threads-shell.md)). 레일은 `app/(main)/layout.tsx`가 그린다 ([결정 0028](decisions/0028-sidenav-in-layout.md))
- [x] `SideNav` — 왼쪽 아이콘 레일. 로고 · 추천 · 새로운 게시글 · 팔로잉 · 좋아요 · 프로필, 하단에 더 보기(로그아웃). `TabBar`는 모바일 대응 때 §7에서 같이 본다
- [x] `Skeleton` — `bg-hairline` 블록, 최종 레이아웃과 같은 치수 (§4 States)
- [x] `EmptyState` — 한 줄 문구. 버튼은 받지 않는다(세 화면 모두 위에 입력칸이 있다). 같은 마크업이 세 번째로 나타나 올렸다 (규칙 2)
- [ ] `Spinner` — 아직 쓸 화면이 없다. `loading.tsx` 스켈레톤이 첫 페인트를 받는다

## 7. 인터랙션 · 상태

- [x] 모든 화면에 로딩, 빈 상태, 없음, 에러 네 가지 (AGENTS.md 규칙 10) — 6개 라우트 대조 완료 ([결정 0012](decisions/0012-a11y-pass.md))
- [ ] 낙관적 업데이트 — 팔로우 토글, 댓글 작성. 좋아요는 먼저 넣었다 ([결정 0021](decisions/0021-like-optimistic.md))
- [ ] 전환은 `--motion-fast`(150ms) / `--motion-standard`(250ms), 이징은 `--ease-enter` / `--ease-exit` / `--ease-standard` 셋만
- [x] `prefers-reduced-motion` 존중 — `app/globals.css:100-106`이 `motion-*`를 전부 0ms로 내린다 (`docs/DESIGN.md` 움직임)
- [x] **태블릿 · 모바일 대응** — 로그인 뒤 화면은 768px 미만에서 레일이 아래 탭바로 내려간다 ([결정 0033](decisions/0033-responsive-shell.md)). 로그인, 회원가입 화면은 모바일에서 로고가 가운데, 건너가는 줄이 바닥에 선다 ([결정 0034](decisions/0034-auth-responsive.md))

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
- [ ] `docs/DESIGN.md` 원칙을 화면마다 대조 — 보라는 동작에만, 그림자는 라이트에서 둘만, 4px 그리드
- [ ] README — 배포 URL, 체험 경로, 테스트 계정, 로컬 실행 방법

## 10. 디자인 리뉴얼 (소프트 서피스)

값과 화면 구성은 `docs/DESIGN.md`, 이유는 [결정 0041](decisions/0041-soft-surface.md). 한 단계가 PR 하나다.
단계마다 390px과 1280px 폭, 라이트와 다크를 Playwright로 열어 DESIGN.md와 대조하고 스크린샷으로 보고한다 (AGENTS.md 규칙 16).

- [ ] 1. 토큰과 공통 컴포넌트 — `app/globals.css` 토큰 교체, `lib/utils/tone.ts`와 테스트, `Button`, `TextField`, `Avatar`,
  `EmptyState`(icon, title, description, action), `Skeleton`, `Dialog`(sheet), `DropdownMenu`. 여러 기능에 걸쳐 한 PR로 묶는다 (규칙 11 예외).
  Toss 문서를 인용하던 코드 주석(`app/globals.css`, `components/ui/Button.tsx`)도 여기서 고친다. 쓰지 않게 되는 토큰(`--blur-rail` 등)을 지운다
- [ ] 2. 뼈대 — `app/(main)/layout.tsx`, `PageShell`, `SideNav`(768, 1024, 1280px), 하단 탭, `MoreMenu`(시트, 디자인 세그먼트)
- [ ] 3. 인증 — `/login`, `/signup`. 버튼 비활성 조건, 에러 문구 분기, 첫 에러 칸 포커스
- [ ] 4. 피드 — 추천, 팔로잉, 좋아요, `ContentCard`, `ComposeRow`, `ComposeDialog`, `LikeButton`, `CommentCount`, 빈 상태 문구와 버튼
- [ ] 5. 글과 댓글 — `/post/[id]`, `/comment/[id]`, `CommentThread`, 입력줄, 삭제 확인
- [ ] 6. 프로필 — `/u/[id]`, `ProfileHeader`, `ProfileEditDialog`, `InterestsField`, 팔로워·팔로잉 목록(행 팔로우 버튼), 내 프로필 요약 칸, 404와 에러

1과 2가 먼저 머지된다. 3~6은 서로 파일이 겹치지 않아 병렬로 진행할 수 있다.
각 단계가 끝나면 `/impeccable polish <라우트>`로 DESIGN.md와 어긋난 곳을 한 번 훑는다.

---

## 순서 규칙

1. **2 → 3 → 4 → 5.** 기반 없이 화면부터 만들지 않는다.
2. **한 기능은 세로로 관통한다** — 쿼리 → UI → 배포 확인까지 끝내고 다음으로. 화면을 전부 만들고 나중에 데이터를 붙이지 않는다 (AGENTS.md 규칙 11).
3. **6은 4·5와 같이 간다.** 화면을 만들면서 필요한 컴포넌트를 그때 `components/ui/`에 만든다. 미리 다 만들어두지 않는다.
4. **8은 마지막.** 7까지 끝난 뒤에 얹는다.

## 결정 대기

정하지 못한 값은 결정 기록의 `## 남은 칸`에 있다 (`docs/decisions/README.md`).
정해지기 전까지 그 값을 쓰는 코드를 쓰지 않는다 (AGENTS.md 규칙 6).
