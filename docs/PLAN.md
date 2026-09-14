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
- [x] `AGENTS.md` 규칙 + 커밋/브랜치 컨벤션, `CLAUDE.md`는 포인터만
- [x] PR 템플릿
- [x] PR 자동 리뷰 워크플로 (Claude, `AGENTS.md` 기준)
- [x] GitHub 레포 생성 (`junye0l/8around-sns`)
- [x] 첫 푸시
- [x] Vercel 연결 → https://8around-new-sns-beta.vercel.app
- [x] Supabase Auth URL Configuration (Site URL + Redirect URLs)
- [x] `npm run harness` — 규칙 중 기계가 볼 수 있는 것을 검사하고 `verify`가 부른다

## 2. 기반

- [x] Supabase 프로젝트 생성, `.env.local` 채우기
- [x] `lib/supabase/` 클라이언트 (server / client / middleware)
- [x] 마이그레이션으로 4테이블 생성
- [x] RLS 정책 — 읽기는 공개, 쓰기/삭제는 본인만
- [x] DB 타입 생성 (`types/`) + 생성 명령을 `package.json`에 등록

## 3. 인증

- [x] 회원가입 → 프로필 생성 (`on_auth_user_created` 트리거가 만든다)
- [x] 로그인 / 로그아웃, 세션 유지 — 이메일 + 비밀번호 ([결정 0001](decisions/0001-login-identifier.md)). 로그아웃은 "더 보기" 메뉴(`components/layout/MoreMenu.tsx`)에 있다
- [x] 비로그인 상태에서 보호 라우트 접근 차단 — 허용 목록(`lib/utils/auth-route.ts`)에 없는 경로는 전부 `/login`으로 보낸다 ([결정 0006](decisions/0006-feed-requires-login.md))
  - [x] 반대 방향은 됐다 — 로그인한 사용자는 `/login` · `/signup`에 못 들어간다

## 4. 콘텐츠

- [x] 게시글 작성
- [x] 피드 노출 (최신순)
- [x] 댓글 작성 — 게시글 상세(`/post/[id]`)에서 단다
- [x] 대댓글 — `parent_id`로 **1뎁스까지만** 편다. 게시글 화면에는 "답글 N개 보기" 한 줄만 두고, 보고 다는 것은 `/comment/[id]`에서 한다 ([결정 0008](decisions/0008-reply-tree-on-post.md))
- [x] 댓글 트리 변환은 `lib/utils/`의 순수 함수로 + 테스트 1개 — `comment-tree.ts`. 0007에서 한 번 지웠다가 게시글 화면이 답글까지 펴면서 되살렸다 ([결정 0008](decisions/0008-reply-tree-on-post.md))
- [x] 좋아요 — 게시글에만 단다. 수는 계산 컬럼 `like_count`가, 내가 눌렀는지는 계산 컬럼 `liked_by_viewer`가 요청의 JWT에서 본다. 누가 눌렀는지는 본인만 읽는다 ([결정 0020](decisions/0020-post-likes.md), [0031](decisions/0031-post-likes-private.md)). 사용자가 요청해서 범위에 들어왔다

## 5. 소셜

- [x] 프로필 화면 — `/u/[id]`. 글 · 댓글의 이름을 누르면 간다 ([결정 0011](decisions/0011-profile-routes.md), [0032](decisions/0032-nickname-as-handle.md))
- [x] 팔로우 / 언팔로우 토글 — 프로필 화면 한 곳에서 한다. 의도를 버튼이 보내고 중복은 무시한다 (결정 0011)
- [x] 팔로워 · 팔로잉 수와 목록 — 수를 누르면 `/u/[id]/followers` · `/following`으로 간다
- [x] 팔로잉 기준 피드 필터 — `/following`. DB 함수 `following_posts()` 하나가 거른다 ([결정 0025](decisions/0025-following-feed-in-db.md))
- [x] 프로필 화면에 그 사람이 쓴 글 — 헤더 아래에 최신순으로 편다 (`lib/queries/post.ts`의 `listPostsByAuthor`). 사용자가 요청해서 범위에 들어왔다
- [x] 좋아요한 글 피드 — `/likes`. 누른 시각의 역순이고 `post_likes`에서 출발해 글을 임베드한다 (`lib/queries/post.ts`의 `listLikedFeed`, [결정 0029](decisions/0029-liked-feed-from-post-likes.md)). 사용자가 요청해서 범위에 들어왔다
- [x] 프로필 편집 — 내 프로필의 "프로필 편집" 버튼, 모달에서 별명, 소개, 관심사, 프로필 이미지를 바꾼다.
  별명은 겹치지 않는다(대소문자 무시). 이미지는 Storage `avatars` 버킷에 두고 프로필에는 경로만 저장한다
  ([결정 0030](decisions/0030-profile-avatar-upload.md), 관심사는 [0036](decisions/0036-profile-interests.md)). 사용자가 요청해서 범위에 들어왔다
- [x] 아이디(`username`) 컬럼 지우기 — 별명이 사람을 가리키는 이름이고 주소는 id다([결정 0032](decisions/0032-nickname-as-handle.md)).
  0009로 넓히고 코드를 배포한 뒤 0010이 컬럼과 트리거의 username을 지웠다

## 7. 인터랙션 · 상태

- [x] 모든 화면에 로딩, 빈 상태, 없음, 에러 네 가지 (AGENTS.md 규칙 10) — 6개 라우트 대조 완료 ([결정 0012](decisions/0012-a11y-pass.md))
- [ ] 팔로우 버튼과 댓글 작성도 좋아요처럼 서버 응답 전에 화면에 반영한다. 지금은 응답을 기다린다 (좋아요는 [결정 0021](decisions/0021-like-optimistic.md))
- [x] `prefers-reduced-motion` 존중 — `app/globals.css:100-106`이 `motion-*`를 전부 0ms로 내린다 (`docs/DESIGN.md` 움직임)
- [x] **태블릿 · 모바일 대응** ([결정 0033](decisions/0033-responsive-shell.md), [0034](decisions/0034-auth-responsive.md))

## 9. 마감

- [x] 심사 시나리오 E2E 1개 — 가입 → 로그인 → 글 작성 → 댓글 → 대댓글 → 팔로우
- [ ] 위 시나리오를 **배포 URL에서 사람 손으로** 한 번 통과
- [ ] README — 배포 URL, 체험 경로, 테스트 계정, 로컬 실행 방법

## 10. 디자인 리뉴얼 (소프트 서피스)

값과 화면 구성은 `docs/DESIGN.md`, 이유는 [결정 0043](decisions/0043-soft-surface.md). 한 단계가 PR 하나다.
단계마다 390px과 1280px 폭, 라이트와 다크를 Playwright로 열어 DESIGN.md와 대조하고 스크린샷으로 보고한다 (AGENTS.md 규칙 16).

- [x] 1. 토큰과 공통 컴포넌트 (#94)
- [x] 2. 뼈대 (#95)
- [x] 3. 인증 (#96)
- [x] 4. 피드 (#97)
- [x] 5. 글과 댓글 (#98)
- [x] 6. 프로필 (#99)

1과 2가 먼저 머지된다. 3~6은 서로 파일이 겹치지 않아 병렬로 진행할 수 있다.
각 단계가 끝나면 `/impeccable polish <라우트>`로 DESIGN.md와 어긋난 곳을 한 번 훑는다.

---

## 결정 대기

정하지 못한 값은 결정 기록의 `## 남은 칸`에 있다 (`docs/decisions/README.md`).
정해지기 전까지 그 값을 쓰는 코드를 쓰지 않는다 (AGENTS.md 규칙 6).
