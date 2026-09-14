# 8around 디자인: 소프트 서피스

옅은 바탕 위에 둥근 면을 띄우고, 보라 하나로 동작과 현재 위치를 표시한다.
글과 사람이 주인공이고 장식은 물러난다.

이 문서가 색, 글자, 간격, 컴포넌트 모양, 화면 구성의 유일한 출처다 (AGENTS.md 규칙 3).
`app/globals.css`는 여기 값을 그대로 옮겨 적는다. 여기 없는 값이 필요하면 멈추고 묻는다.

- 왜 이 방향인지, 무엇을 버렸는지: [결정 0043](decisions/0043-soft-surface.md)
- 시안(라이트, 다크 전 화면): https://claude.ai/code/artifact/af397131-0ba4-4c67-9c8c-78917291c11c
  시안과 이 문서가 다르면 이 문서가 맞다

## 1. 원칙

1. **관심사가 사람을 먼저 소개한다.** 이름 옆에 관심사 칩을 붙인다
2. **글이 주인공이다.** 글 하나가 카드 하나다. 카드 안에 카드를 넣지 않는다
3. **보라는 동작과 현재 위치에만 칠한다.** 장식으로 쓰지 않는다
4. **누를 수 있는 것은 누를 수 있어 보인다.** 알약, 채움 버튼, primary 글자 셋 중 하나다
5. **비어 있는 화면은 다음에 할 일을 말한다.** 문구만 두지 않고 버튼을 둔다
6. **입력이 없으면 보내는 버튼이 꺼져 있다.** 모양과 `aria-disabled`가 같이 꺼진다

하지 않는 것

- 카드 안에 카드, 그라데이션, 유리 효과, 장식용 blur
- 색만으로 상태를 구분하기. 현재 탭은 색과 굵기, 눌린 좋아요는 색과 채움이 같이 말한다
- 다크 모드에서 그림자. 다크는 면 색 차이로 나눈다
- 새 색, 새 이징, 새 duration을 화면 코드에서 만들기

## 2. Foundations

### 색

모든 색은 `light-dark(라이트, 다크)` 한 줄로 적는다 ([결정 0040](decisions/0040-theme-switch.md)).
대비는 WCAG 공식으로 계산했다. 글자로 쓰는 색은 4.5:1 이상이다.

| 토큰 | 역할 | 라이트 | 다크 | 대비 |
|---|---|---|---|---|
| `background` | 페이지 바탕 | `#F2F3F7` | `#000000` | |
| `canvas` | 카드, 그룹 목록, 입력줄 바탕 | `#FFFFFF` | `#1C1C1E` | |
| `canvas-raised` | 시트, 모달, 드롭다운 | `#FFFFFF` | `#2C2C2E` | |
| `fill` | 알약, secondary 버튼, 한 줄 입력, 쉬는 입력칸 | `#F2F3F7` | `#2C2C2E` | fg-muted 4.9 / 5.2 |
| `fg` | 본문, 제목 | `#1C1C1E` | `#F2F2F7` | canvas 위 17.0 / 15.3 |
| `fg-muted` | 시각, 안내 문구, placeholder | `#6A6A70` | `#9D9DA4` | canvas 위 5.4 / 6.3, background 위 4.9 |
| `fg-disabled` | 비활성 글자 전용 | `#A5A5AB` | `#5C5C62` | WCAG 비활성 예외 |
| `hairline` | 행 구분선, 입력칸 테두리, 스켈레톤 | `#E8E8EE` | `#2C2C30` | |
| `primary` | 글자 동작, 아이콘, 현재 탭, 포커스 링 | `#5750E6` | `#8C86FF` | canvas 위 5.7 / 5.7 |
| `primary-fill` | 채움 버튼 바탕, 위에 흰 글자 | `#5750E6` | `#5E57EA` | 흰 글자 5.7 / 5.2 |
| `primary-soft` | 눌린 좋아요, 빈 화면 아이콘 바탕 | `#ECEBFD` | `#2A2850` | |
| `on-primary-soft` | primary-soft 위 글자 | `#5750E6` | `#B9B5FF` | 4.8 / 7.3 |
| `danger` | 에러 문구, 파괴적 동작 글자 | `#D92D20` | `#FF6B5E` | canvas 위 4.8 / 6.1 |
| `danger-soft` | 삭제, 로그아웃 버튼 바탕 | `#FDECEA` | `#3A1D1B` | |
| `scrim` | 모달 뒤 막 | `#141428` 40% | `#000000` 60% | |

`on-primary`(채움 버튼 위 글자)는 두 테마 모두 `#FFFFFF`다.

### 관심사 톤, 아바타 톤

관심사는 사용자가 적는 자유 글자라 고정 분류가 없다. 글자를 해시해 여섯 톤 중 하나를 고른다.
사진이 없는 아바타도 같은 방식으로 사용자 id에서 톤을 고른다.
고르는 함수는 `lib/utils/tone.ts`에 두고 옆에 테스트를 둔다 (AGENTS.md 규칙 1). 같은 입력은 늘 같은 톤이다.

| 톤 | 칩 라이트 (바탕 / 글자) | 칩 다크 (바탕 / 글자) | 아바타 바탕, 흰 글자 |
|---|---|---|---|
| violet | `#F1E8FB` / `#7A3FB8` 5.5 | `#3A2A52` / `#D7B8FF` 7.5 | `#7C5CD6` 4.8 |
| blue | `#E6EFFD` / `#2459B8` 5.7 | `#1E2F4F` / `#A9C8FF` 7.9 | `#3A6FD8` 4.7 |
| green | `#E2F5E9` / `#1D7A45` 4.7 | `#173A27` / `#9BE3B6` 8.4 | `#267A4C` 5.3 |
| orange | `#FFEEDE` / `#A8520F` 4.8 | `#48301A` / `#FFC38F` 7.9 | `#AD5415` 5.2 |
| pink | `#FDE8F1` / `#B42366` 5.3 | `#4A2034` / `#FFB0D2` 8.0 | `#C23B7A` 5.0 |
| teal | `#E0F4F4` / `#11706F` 5.2 | `#153B3B` / `#8FE0DE` 8.1 | `#197676` 5.4 |

아바타 톤은 두 테마 공통이다. 첫 글자는 장식이라 `aria-hidden`이고, 이름은 옆 글자가 말한다.

### 글자

시스템 글꼴을 쓴다. `-apple-system, BlinkMacSystemFont, "Apple SD Gothic Neo", system-ui, sans-serif`.
웹폰트를 넣을지는 [결정 0043](decisions/0043-soft-surface.md)의 남은 칸이다.

| 토큰 | 크기 / 줄높이 / 굵기 | 쓰는 곳 |
|---|---|---|
| `large-title` | 30px / 1.2 / 800, 768px 미만 28px, 자간 -0.02em | 화면 큰 제목 |
| `title` | 20px / 1.4 / 600 | 게시글 상세의 원글 |
| `headline` | 17px / 1.4 / 700 | 시트 제목, 빈 화면 제목 |
| `body` | 16px / 1.55 / 400 | 피드 글, 입력값, 버튼(700) |
| `callout` | 15px / 1.5 / 400 | 댓글, 목록 행 이름(700) |
| `subhead` | 14px / 1.45 / 500 | 작성자 줄, 알약 숫자(600) |
| `footnote` | 13px / 1.4 / 500 | 시각, 안내 문구, 그룹 라벨 |
| `caption` | 11px / 1.2 / 500 | 하단 탭 라벨만 |

- 숫자가 바뀌는 자리(좋아요, 댓글, 팔로워 수)는 `tabular-nums`
- 한글 본문은 단어 단위로 줄바꿈한다. `break-keep`과 `wrap-anywhere`를 같이 둔다.
  `wrap-anywhere`는 공백 없는 긴 URL이 칸을 넘지 않게 한다
- 사용자가 넣은 줄바꿈은 `whitespace-pre-line`으로 살린다

### 모서리

| 토큰 | 값 | 쓰는 곳 |
|---|---|---|
| `rounded-card` | 20px | 카드, 그룹 목록 |
| `rounded-sheet` | 28px | 바텀 시트(위 두 모서리), 데스크톱 모달 |
| `rounded-menu` | 18px, 항목은 12px | 드롭다운 |
| `rounded-field` | 16px | 큰 입력칸(인증, 프로필 편집) |
| `rounded-full` | 9999px | 버튼, 알약, 칩, 아바타, 한 줄 입력 |

### 간격

4px 격자다. Tailwind 숫자 스케일을 쓴다.

- 카드 안쪽 위아래 16px, 좌우 20px (`py-4 px-5`)
- 카드와 카드 사이 12px (`gap-3`)
- 768px 미만 화면 좌우 12px (`px-3`)
- 아바타와 글 사이 12px, 알약과 알약 사이 8px

### 그림자

라이트에서만 둘을 쓴다. 다크는 그림자 없이 `canvas`와 `canvas-raised` 면 색으로 나눈다.

| 토큰 | 값 | 쓰는 곳 |
|---|---|---|
| `shadow-card` | `0 1px 2px` `#141428` 5% | 카드, 그룹 목록, 현재 메뉴 항목 |
| `shadow-raised` | `0 12px 36px` `#141428` 16% | 시트, 모달, 드롭다운 |

### 움직임

길이와 이징은 지금 `app/globals.css`의 `--motion-*`, `--ease-*`를 그대로 쓴다. 새로 만들지 않는다.

- 누름: 버튼과 알약은 `scale(.97)`와 밝기 92%, `--motion-fast`. 오버슈트 없음
- 좋아요: 알약 바탕이 `primary-soft`로, 하트가 채움으로. `like-pop` 유지
- 시트: 아래에서 올라온다. `--motion-standard`와 `--ease-enter`, 막은 `--motion-fast` 페이드
- `prefers-reduced-motion`에서는 전부 0이다

### 반응형

| 폭 | 뼈대 |
|---|---|
| 768px 미만 | 하단 탭 5칸(추천, 팔로잉, 새 글, 좋아요, 프로필), 제목줄 오른쪽에 더 보기 |
| 768 ~ 1023px | 왼쪽 76px 레일. 아이콘 아래 `caption` 라벨이 늘 보인다 |
| 1024 ~ 1279px | 왼쪽 220px 메뉴(아이콘과 라벨), 가운데 600px |
| 1280px 이상 | 여기에 오른쪽 300px 칸(내 프로필 요약). 전체 최대 폭 1180px, 칸 사이 24px |

## 3. Components & States

컴포넌트마다 loading, disabled, pressed, keyboard focus 넷을 채운다 (AGENTS.md 스타일 절).
포커스 링은 `primary` 2px, 바깥 간격 2px이다 ([결정 0010](decisions/0010-focus-ring-primary.md)).

### Button `components/ui/Button.tsx`

| variant | 바탕 | 글자 | 쓰는 곳 |
|---|---|---|---|
| `primary` | `primary-fill` | `on-primary` | 화면의 주 동작 하나(게시, 로그인, 팔로우, 저장) |
| `secondary` | `fill` | `fg` | 보조 동작(프로필 편집, 팔로잉 중) |
| `ghost` | 없음 | `primary` | 글자 동작(사진 바꾸기, 취소) |
| `danger` | `danger-soft` | `danger` | 삭제, 로그아웃 |

| size | 높이 | 좌우 | 글자 |
|---|---|---|---|
| `lg` | 52px, 전체 폭 | 20px | 16px / 700 |
| `md` | 44px | 20px | 15px / 700 |
| `sm` | 32px | 14px | 14px / 700 |

- 모양은 전부 `rounded-full`
- disabled: 바탕 `hairline`, 글자 `fg-disabled`. `aria-disabled`를 쓰고 클릭을 막는다 ([결정 0012](decisions/0012-a11y-pass.md))
- loading: 폭을 유지한 채 글자 대신 스피너, `aria-busy`
- pressed: `scale(.97)`, 밝기 92%
- 원형 보내기 버튼: 38px 원, 켜지면 `primary-fill`에 위 화살표, 꺼지면 `hairline`에 `fg-disabled`

### TextField `components/ui/TextField.tsx`

- 큰 칸: 높이 58px, `rounded-field`, `canvas` 바탕, 테두리 1.5px `hairline`. 떠 있는 라벨 유지 ([결정 0026](decisions/0026-auth-floating-label.md))
- 라벨 13px `fg-muted`, 값 16px `fg`
- focus: 테두리 `primary`, 바깥 3px `primary-soft`
- error: 테두리와 아래 문구만 `danger`. 라벨 색은 바꾸지 않는다. 문구 앞에 경고 아이콘
- disabled: 바탕 `fill`, 테두리 없음, 값 `fg-disabled`
- 안내 문구와 에러 문구는 같은 자리에 선다. 문구가 바뀌어도 아래가 밀리지 않는다
- 시트 안의 쉬는 칸은 `fill` 바탕에 테두리 없음, 포커스되면 `canvas`와 `primary` 테두리

### Avatar `components/ui/Avatar.tsx`

- 크기 76(프로필 헤더), 40(글 카드), 36(목록 행), 34(댓글), 32(원글 머리), 26(답글)
- 사진이 있으면 사진, 없으면 별명 첫 글자와 아바타 톤

### 관심사 칩 `components/profile/InterestChip.tsx`

- 기본: 12px / 600, 좌우 8px, 줄높이 18px, `rounded-full`, 관심사 톤
- 큰 칩(프로필, 편집): 14px / 600, 좌우 12px, 위아래 4px
- 편집 중 칩은 오른쪽에 지우기 아이콘

### 알약 `components/post/LikeButton.tsx` · `components/ui/CommentCount.tsx`

- 높이 32px, 좌우 12px, `fill` 바탕, `subhead` 600 `fg-muted`, 아이콘 16px
- 좋아요 눌림: 바탕 `primary-soft`, 글자와 채운 하트 `on-primary-soft`
- 팔로워, 팔로잉 수도 알약이다. 숫자를 굵게 앞에 둔다. 글자는 `fg`

### 글 카드 `components/ui/ContentCard.tsx`

- `canvas`, `rounded-card`, `shadow-card`, 안쪽 `py-4 px-5`
- 왼쪽 아바타 40, 오른쪽에 작성자 줄(이름 700, 칩 최대 3, 시각 `fg-muted`, 내 글이면 더 보기), 본문 `body`, 알약 줄
- 카드 전체가 상세로 가는 링크다. 이름, 알약, 더 보기는 각자 누를 수 있다
- hover: 모양이 바뀌지 않는다. 누를 때만 `scale(.97)`
- 본문은 자르지 않는다

### 글쓰기 줄 `components/ui/ComposeRow.tsx`

- 글 카드와 같은 면. 내 아바타, `fg-muted` 안내, 꺼진 원형 보내기
- 줄 전체가 버튼 하나이고 누르면 글쓰기 시트나 모달이 열린다 ([결정 0018](decisions/0018-feed-compose-modal.md), [0019](decisions/0019-comment-compose-modal.md))
- 게시글, 댓글 상세의 화면 아래 입력줄도 같은 컴포넌트다. 모양은 `canvas` 띠 위 `fill` 알약 입력

### 글쓰기 시트 `components/ui/ComposeDialog.tsx` · `components/ui/Composer.tsx`

- 768px 미만은 바텀 시트, 이상은 가운데 모달(폭 560px). 바탕 `canvas-raised`, `rounded-sheet`, `shadow-raised`
- 머리: 왼쪽 ghost "취소", 가운데 `headline` 제목, 오른쪽 primary sm 보내기 버튼
- 입력칸은 3줄 높이 고정, 카운터 없음 ([결정 0014](decisions/0014-composer-layout.md))
- 공백만 있거나 처음 값과 같으면 보내기 disabled ([결정 0042](decisions/0042-submit-guard.md)). 보내는 중에는 loading과 입력 읽기 전용, 취소 비활성
- 실패하면 입력칸 아래 `danger` 한 줄. 시트는 닫지 않는다

### 그룹 목록

- 여러 행을 `canvas` 면 한 장에 담는다. `rounded-card`, `shadow-card`
- 맨 위 라벨 `footnote` 600 `fg-muted`, 좌우 18px
- 행 좌우 18px, 위아래 12px, 행 사이 `hairline` 1px
- 댓글 목록, 팔로워 목록, 더 보기의 디자인 칸이 쓴다

### EmptyState `components/ui/EmptyState.tsx`

- 받는 것: `icon`, `title`, `description`, 선택 `action`
- 카드 가운데 정렬. 아이콘 56px 원(`primary-soft` 바탕, `primary` 아이콘), 제목 `headline`, 설명 `subhead` 400 `fg-muted` 28자 폭, 버튼 primary sm
- 그룹 안에 들어갈 때는 아이콘 없이 제목과 설명만

### Skeleton `components/ui/Skeleton.tsx`

- `hairline` 블록, `rounded-lg`. 최종 레이아웃과 같은 치수의 카드 모양을 그대로 따른다

### 탭과 메뉴 `components/layout/SideNav.tsx` · `components/layout/PageShell.tsx`

- 하단 탭: 높이 64px, `canvas` 94% 불투명, 위 `hairline`. 아이콘 22px과 `caption` 라벨. 현재 탭은 `primary`와 700
- 데스크톱 메뉴 항목: 좌우 14px, 위아래 12px, `body` 500, `rounded-2xl`. 현재 항목은 `canvas` 면, `shadow-card`, 700, 아이콘 `primary`
- 메뉴 맨 위 로고 마크(30px `primary-fill` 사각, 흰 "8"), 네 목적지 아래 primary lg "새 글 쓰기", 맨 아래 더 보기
- 세그먼트: `hairline` 바탕 12px 모서리, 켜진 칸 `canvas`와 `shadow-card`

### 드롭다운, 모달, 시트 `components/ui/DropdownMenu.tsx` · `components/ui/Dialog.tsx`

- radix 기반을 유지한다 ([결정 0013](decisions/0013-sidebar-overlays.md))
- 드롭다운: `canvas-raised`, `rounded-menu`, `shadow-raised`, 1px `hairline`, 안쪽 6px. 항목 좌우 12px 위아래 10px, hover `fill`
- 파괴적 항목만 `danger` 글자
- `Dialog`에 `variant="sheet"`를 두고 768px 미만에서 쓴다. 손잡이 36×5px `hairline`

## 4. Screens

모든 화면은 로딩, 빈 상태, 없음, 에러 네 자리를 채운다 (AGENTS.md 규칙 10).
긴 소개 예시와 모든 화면의 모양은 시안에 있다.

### 로그인 `/login` · 회원가입 `/signup`

- 위에서부터 로고 마크 44px, `large-title`, `fg-muted` 소개 한 줄 "생각을 짧게 나누는 곳이에요"
- 입력칸 사이 12px, 버튼은 primary lg
- 모든 칸이 채워지기 전까지 버튼 disabled. 보내는 중 버튼 loading, 칸 disabled
- 에러 문구는 칸 바로 아래 한 자리. 빈 칸은 "~을 입력해 주세요", 형식이 틀리면 "~ 형식을 확인해 주세요"
- 제출 뒤 첫 에러 칸으로 포커스
- 건너가는 줄: 768px 미만은 화면 바닥 가운데([결정 0034](decisions/0034-auth-responsive.md)), 이상은 폼 아래
- 768px 이상은 `background` 위 가운데 400px `canvas` 카드, `rounded-sheet`, 안쪽 32px

### 추천 `/` · 팔로잉 `/following` · 좋아요 `/likes`

- 제목줄 `large-title`, 768px 미만은 오른쪽에 더 보기
- 추천만 맨 위에 글쓰기 줄
- 글 카드 목록, 카드 사이 12px
- 로딩: 카드 모양 스켈레톤 3장
- 빈 상태

| 화면 | 제목 | 설명 | 버튼 |
|---|---|---|---|
| 추천 | 아직 올라온 글이 없어요 | 첫 글을 남겨보세요. | 첫 글 쓰기 (글쓰기 시트) |
| 팔로잉, 팔로우한 사람 없음 | 아직 팔로우한 사람이 없어요 | 추천에서 관심사가 맞는 사람을 찾아 팔로우해 보세요. | 추천 둘러보기 |
| 팔로잉, 글 없음 | 아직 새 글이 없어요 | 팔로우한 사람들이 아직 글을 안 썼어요. 그동안 추천에서 다른 글을 둘러보세요. | 추천 둘러보기 |
| 좋아요 | 아직 좋아요한 글이 없어요 | 마음에 드는 글에 하트를 눌러 보세요. | 추천 둘러보기 |

### 게시글 상세 `/post/[id]`

- 제목줄: `primary` 글자 뒤로 가기(이전 화면 이름) 아래 `large-title` "게시글"
- 원글 카드: 머리 아바타 32, 본문 `title`, 알약 둘
- 댓글 그룹: 라벨 "댓글 N", 행마다 아바타 34, 이름, 시각, 본문 `callout`, 내 댓글이면 더 보기
- 답글이 있으면 행 아래 `primary` 글자 "답글 N개 보기" 한 줄만 둔다. 말풍선 숫자 링크를 따로 두지 않는다
- 화면 아래 입력줄. 내 글이면 "댓글 남기기", 남의 글이면 "별명님에게 댓글 남기기". 누르면 댓글 시트
- 768px 이상은 입력줄을 원글 카드 바로 아래 글쓰기 줄로 둔다
- 댓글 없음: 그룹 안 "아직 댓글이 없어요" / "먼저 남겨보세요."
- 없음: 아래 "없는 페이지"

### 댓글 상세 `/comment/[id]`

- 제목 `large-title` "댓글", 뒤로 가기는 "게시글"
- 맥락 카드: 위에 `fg-muted` 한 줄로 원글 작성자와 본문(말줄임, 누르면 게시글로), 아래 대상 댓글 본문 17px
- 답글 그룹: 라벨 "답글 N", 행은 게시글 상세의 댓글 행과 같다
- 입력줄 "별명님에게 답글 남기기"
- 삭제 확인: 시트 또는 모달에 danger 버튼. 최상위 댓글은 "달린 답글도 함께 삭제됩니다." ([결정 0037](decisions/0037-comment-edit-delete.md))
- 답글 없음: "아직 답글이 없어요" / "먼저 남겨보세요."

### 프로필 `/u/[id]`

- 제목줄: 내 프로필은 뒤로 가기 없이 `large-title` "프로필". 남의 프로필은 뒤로 가기만 둔다. 이름은 카드에만 쓴다
- 헤더 카드(안쪽 20px): 아바타 76과 이름 24px / 800, 이름 아래 큰 관심사 칩. 그 아래 소개, 수 알약 둘, 전체 폭 버튼
- 소개는 이름 줄 아래 카드 전체 폭에 `callout`으로 둔다. 자르지 않는다. 최대 폭 34em
- 버튼: 내 것 secondary "프로필 편집", 팔로우 전 primary "팔로우", 팔로잉 중 secondary 체크 아이콘과 "팔로잉"(`aria-pressed`)
- 팔로우를 누르면 버튼 loading 뒤 모양이 바뀌고 팔로워 수가 바뀐다. 포커스는 버튼에 머문다
- 관심사 없음: 내 것은 칩 자리에 ghost sm "관심사 추가"(편집 시트), 남의 것은 칩 줄이 없다
- 그 아래 그룹 라벨 "게시글 N"과 글 카드 목록
- 글 없음: "아직 쓴 글이 없어요" / "별명님이 글을 쓰면 여기에 보여요." (내 것은 "첫 글을 남겨보세요."와 첫 글 쓰기 버튼)
- 로딩: 헤더 카드 스켈레톤(원 76, 줄 셋)과 글 카드 둘

### 내 프로필 요약 (1280px 이상 오른쪽 칸)

- 카드 한 장: 아바타 40과 이름, 그 아래 소개, 수 알약 둘, 라벨 "내 관심사"와 큰 칩
- 소개는 이름 줄 아래 전체 폭에 `subhead` 400, `line-clamp-3`. 잘려도 "더 보기"를 두지 않고 카드 전체가 내 프로필 링크다

### 프로필 편집 `components/profile/ProfileEditDialog.tsx`

- 글쓰기 시트와 같은 틀. 머리 "취소" / "프로필 편집" / primary sm "저장"
- 아바타 76 아래 ghost sm "사진 바꾸기". 사진 위에 아이콘을 겹치지 않는다 ([결정 0030](decisions/0030-profile-avatar-upload.md) 업로드 흐름 유지)
- 별명(안내 "30자까지 가능해요"), 소개(안내 "160자까지 가능해요"), 관심사
- 관심사: 칩이 입력칸 안에 들어가고 지우기 아이콘으로 뺀다. Enter로 추가한다.
  안내 "한 개에 2글자까지, 최대 3개 가능해요". 3개면 입력을 막는다 (규칙 출처 `lib/utils/interests.ts`)
- 처음 값과 같으면 저장 disabled. 저장 중 loading, 칸 읽기 전용. 에러는 해당 칸 아래, 첫 에러 칸으로 포커스

### 팔로워 · 팔로잉 `/u/[id]/followers` · `/u/[id]/following`

- 뒤로 가기 "프로필", `large-title`로 그 사람 이름, 아래 세그먼트 "팔로워 N" / "팔로잉 N"(각 라우트 링크)
- 그룹 목록 한 장. 행: 아바타 36, 이름 700, 소개 `line-clamp-1`(없으면 이름만 세로 가운데), 오른쪽 sm 팔로우 버튼
- 내 행에는 버튼이 없다. 행 버튼만 loading이 되고 목록 순서는 그대로다
- `ul`과 `li` 구조 유지 ([결정 0012](decisions/0012-a11y-pass.md))
- 빈 상태: "아직 팔로워가 없어요" / "아직 팔로우한 사람이 없어요", 버튼 추천 둘러보기

### 더 보기 `components/layout/MoreMenu.tsx`

- 768px 미만 시트, 이상 드롭다운(폭 260px)
- 그룹 "디자인"에 세그먼트 라이트 / 다크 / 시스템. 누르는 즉시 바뀐다 ([결정 0040](decisions/0040-theme-switch.md))
- 그 아래 danger lg "로그아웃"

### 없는 페이지, 에러 `not-found.tsx` · `app/error.tsx`

- EmptyState 카드 하나를 화면 가운데에. 제목은 `h1`
- 뼈대 밖인 `app/not-found.tsx`, `app/error.tsx`는 카드 위에 로고 마크를 둔다
- 에러는 아이콘 바탕만 `danger-soft`와 `danger` 아이콘, 버튼 primary "다시 시도"
- 문구는 지금 것을 쓴다. 글 "글을 찾지 못했어요", 댓글 "댓글을 찾지 못했어요", 사람 "그런 사람이 없어요", 없는 주소 "없는 주소예요", 에러 "글을 불러오지 못했어요"

## 5. Voice & Tone

지금 화면들의 말투를 기준으로 삼는다.

- "~해요", "~해 보세요"로 쓴다. 명령형 "~하세요"와 딱딱한 "~합니다"를 섞지 않는다
- 버튼은 무엇이 일어나는지 동사로 쓴다. "게시", "팔로우", "추천 둘러보기"
- 진행 중 문구는 "~하는 중". "로그인하는 중", "회원가입하는 중"
- 안내는 허용 범위로 쓴다. "30자까지 가능해요", "6자 이상, 특수문자도 가능해요"
- 에러는 무엇이 문제인지와 어떻게 고치는지를 쓴다. 사과하지 않는다. "비밀번호는 6자 이상으로 만들어 주세요"
- 빈 화면은 지금 상태 한 줄과 다음 행동 한 줄
- 느낌표와 이모지를 쓰지 않는다
