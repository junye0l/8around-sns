---
name: pr-review
description: PR에 달린 리뷰 지적을 레포에서 검증하고, 맞으면 고치고 틀리면 근거와 함께 반박한다. 리액션과 Resolve까지. 사용자가 "리뷰 확인해줘", "리뷰 반영해줘", "PR 코멘트 봐줘", "/pr-review" 라고 할 때 쓴다.
---

# PR 리뷰 대응

`AGENTS.md`가 규칙의 출처다. 이 문서는 그 규칙을 리뷰 대응 절차로 옮긴 것이다.
PR을 **만드는** 절차는 `/pr`에 있다.

## 0. 리뷰를 긁는다

```bash
gh pr view <N> --comments                              # 총평
gh api repos/<owner>/<repo>/pulls/<N>/comments \
  --jq '.[] | "\(.id) \(.path):\(.line)\n\(.body)"'     # 인라인 지적
```

자동 리뷰는 **푸시마다 돌지 않는다.** 다시 받고 싶으면 PR에 `@claude` 를 멘션한다
(그 문자열이 없는 댓글은 워크플로 조건에서 걸러진다).

## 1. 지적마다 레포에서 검증한다 — 먼저 판단하지 않는다

**리뷰를 무비판적으로 받아들이지 않는다.** 맞다고 가정하고 고치는 것이 가장 흔한 사고다.
근거는 이 레포 안에서 찾는다 (규칙 4).

- 근거의 형태: **`파일:줄`** 또는 **실행한 명령과 그 출력**
- 빌드 산출물이 근거가 되기도 한다 — 예: Tailwind 클래스 우선순위는
  `className` 문자열 순서가 아니라 생성된 CSS의 출력 순서로 갈린다.
  `npm run build` 후 `.next/static/**.css`에서 두 규칙의 바이트 위치를 비교해야 알 수 있다
- 리뷰어가 "확인하지 못했다"고 적은 지적일수록 직접 확인한다
- **확인 못 했으면 못 했다고 쓴다.** 모른다고 말하는 것이 지어내는 것보다 싸다

## 2. 리액션 — 검증이 끝난 뒤에 한 번만 단다

| 판단 | 리액션 |
|---|---|
| 적절하다 | 👍 `+1` |
| 적절하지 않다 | 👎 `-1` |

```bash
gh api repos/<owner>/<repo>/pulls/comments/<comment_id>/reactions -f content=+1
```

**GitHub 리액션은 8개뿐이다.** ✅는 없다.

```
["+1", "-1", "laugh", "confused", "heart", "hooray", "rocket", "eyes"]
```

읽자마자 달지 않는다. 자주 바꾸지도 않는다. **검증 후 한 번, 푸시 후 한 번.** 그게 전부다.

## 3-A. 적절한 지적 — 고친다

**증상이 아니라 근본 원인을 고친다.** 지적이 가리킨 한 곳만 막으면 같은 함수를 부르는
다른 경로가 그대로 남는다. 공통 지점 한 곳에서 고치는 것이 더 짧은 diff이기도 하다.

1. 고친다
2. `npm run verify` + 필요하면 `npm run build`로 **실제로 고쳐졌는지 확인한다**
3. **사용자에게 보고한다** — 무엇이 문제였고 어떻게 고쳤는지, 근거와 함께
4. 커밋 (`fix:` 또는 성격에 맞는 타입) → **푸시는 사용자 확인 대상이다** (규칙 7)
5. 푸시 후 리액션을 👍 → 🚀 로 **바꾼다** (지우고 새로 단다)
6. 스레드에 답글 — 근거와 커밋 해시
7. 스레드를 Resolve한다

```bash
# 리액션 교체
RID=$(gh api repos/<owner>/<repo>/pulls/comments/<cid>/reactions \
  --jq '.[] | select(.content=="+1") | .id')
gh api -X DELETE repos/<owner>/<repo>/pulls/comments/<cid>/reactions/$RID
gh api repos/<owner>/<repo>/pulls/comments/<cid>/reactions -f content=rocket

# 답글
gh api repos/<owner>/<repo>/pulls/<N>/comments/<cid>/replies -f body="..."

# Resolve — 스레드 id는 GraphQL로만 얻는다
gh api graphql -f query='
{ repository(owner:"<owner>", name:"<repo>") {
    pullRequest(number:<N>) {
      reviewThreads(first:20) { nodes { id isResolved comments(first:1){nodes{id path}} } }
} } }'
gh api graphql -f query='
mutation { resolveReviewThread(input:{threadId:"<thread_id>"}) {
  thread { isResolved } } }'
```

## 3-B. 적절하지 않은 지적 — 반박만 한다

1. 👎 를 단다
2. 스레드에 답글로 **왜 무시하는지 근거와 함께** 적는다 (`파일:줄` 또는 명령 출력)
3. **Resolve하지 않는다.** 열어둔 채로 둔다

내가 반박하고 내가 닫으면 그 판단이 틀렸을 때 그대로 묻힌다.
닫는 것은 사람이 한다. 👎와 답글로 "동의하지 않음"은 이미 보인다.

## 4. 보고

- 지적 건수와 각각의 판정 (적절 / 부적절)
- 고친 것: 무엇이 문제였고 어떻게 고쳤는지, **근거와 커밋 해시**
- 반박한 것: 왜 무시했는지, 스레드가 열려 있다는 사실
- CI 상태
- 남은 절차 (프리뷰 확인, 머지)

## 하지 않는 것

- **머지하지 않는다.** 머지는 사용자가 한다
- 검증 없이 고치지 않는다. 리뷰어도 틀린다
- "아마 고쳐졌을 것"이라고 쓰지 않는다. 실행해서 확인한 것만 고쳐졌다고 말한다 (규칙 5)
- 반박한 스레드를 스스로 닫지 않는다
- 리액션을 여러 번 갈아 끼우지 않는다
