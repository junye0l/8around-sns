# 0010. 키보드 포커스 링은 primary를 쓴다

- 상태: 확정
- 날짜: 2026-09-11

## 맥락

[결정 0009](0009-toss-tds-tokens.md)의 "남은 칸"이 `--ring`을 미정으로 두고 있었다.
`docs/DESIGN.md`의 Components & States가 버튼에 keyboard focus 상태를 요구하는데,
정작 링 색을 주는 자리가 문서에 없다.

```
$ grep -n -i "ring" docs/DESIGN.md
(결과 없음)
```

`components/ui/Button.tsx`에 그 상태를 채우면서 값이 필요해졌다.

## 선택지

**A. `--color-primary`(`#3182f6`)**
- 문서가 primary를 "TDS interaction blue and primary action reference"로 규정한다
- primary 버튼 위에서는 파랑 위에 파랑이 된다. 오프셋으로 떼어놔야 보인다

**B. `--color-fg`(`#191f28`)**
- 어느 배경에서나 대비가 확보된다
- 포커스가 "여기서 뭔가 할 수 있다"를 말하는 신호인데 중립색은 그 말을 덜 한다

**C. 링을 두지 않고 브라우저 기본에 맡긴다**
- 코드가 줄어든다
- 배경마다 대비가 들쭉날쭉하다. 규칙 10이 요구하는 keyboard focus 상태가 비어버린다

## 결정

**A.** `focus-visible:outline-2 outline-offset-2 outline-primary`를 쓴다.

## 이유

포커스는 상호작용 신호이고 문서가 그 자리에 쓰라고 지정한 색이 primary다.
새 값을 지어내는 것이 아니라 이미 있는 토큰을 쓰는 것이라 규칙 4에 걸리지 않는다.

오프셋 2px이 파랑 위 파랑 문제를 푼다. 링과 버튼 사이로 배경이 드러나 경계가 생긴다.
실제로 Tab 키를 눌러 확인했다.

## 비용

파랑 배경이 넓은 면 위에 버튼이 놓이면 오프셋이 드러낼 배경이 없어서 링이 묻힌다.
지금은 그런 화면이 없다. 생기면 그때 다시 본다.

`--ring`이라는 별도 토큰은 만들지 않는다. 토큰을 하나 더 만들면 primary와 같은 값이
두 곳에 적히고, 그것이 규칙 3 위반이다.
