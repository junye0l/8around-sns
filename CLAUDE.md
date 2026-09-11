@AGENTS.md

# 8around SNS

생각을 짧게 나누는 SNS. 3일 안에 배포까지 간다. 계획은 `docs/PLAN.md`, 디자인 토큰은 `docs/DESIGN.md`.

## 명령어

| 명령 | 용도 |
|------|------|
| `npm run dev` | 개발 서버 |
| `npm run verify` | lint + typecheck + test. **커밋 전에 이것만 돌리면 된다** |
| `npm run format` | Biome로 포맷 + 자동 수정 |

CI는 위 3개에 `npm run build`를 더해 그대로 돌린다. 로컬에서 `verify`가 통과하면 CI도 통과한다.

## 구조

```
app/            라우트. 서버 컴포넌트가 기본, "use client"는 필요한 잎사귀에만
lib/supabase/   Supabase 클라이언트 (server / client / middleware)
lib/            도메인 로직 (순수 함수는 여기, 옆에 *.test.ts)
supabase/migrations/  스키마. SQL 파일만이 스키마의 출처
docs/           PLAN.md, DESIGN.md
```

## 규칙

1. **DB 접근은 서버에서만.** 컴포넌트에서 직접 쿼리하되, 클라이언트 컴포넌트에서는 하지 않는다. 쓰기는 Server Action.
2. **권한은 RLS 한 곳에서.** 앱 코드에 소유권 체크를 중복으로 두지 않는다. RLS를 못 믿겠으면 정책을 고친다.
3. **스키마 변경은 마이그레이션 파일로.** Supabase 대시보드에서 손으로 고치지 않는다 — 재현이 안 된다.
4. **스타일 값은 토큰으로.** 색·간격·폰트 크기를 컴포넌트에 하드코딩하지 않는다. 새 값이 필요하면 `docs/DESIGN.md`에 먼저 추가한다.
5. **분기·루프·파서 같은 로직에는 테스트 하나.** 프레임워크 없이 `*.test.ts` 한 개면 된다. 한 줄짜리에는 테스트를 붙이지 않는다.
6. **범위 밖 기능을 만들지 않는다.** 요구 기능은 가입·로그인·팔로우·게시글·댓글·대댓글 6개다. 나머지는 `docs/PLAN.md`의 "범위 밖"을 본다.

## 커밋 / PR

- 커밋 메시지: `타입: 한 줄 요약` (feat / fix / chore / docs / style)
- PR은 CI 초록일 때만 머지. Vercel 프리뷰 URL에서 직접 눌러보고 머지한다.

## 환경변수

`.env.local` (커밋 금지, `.env.example` 참고)

| 키 | 용도 |
|----|------|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase 프로젝트 URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | 익명 키. RLS가 막아주므로 공개돼도 된다 |
