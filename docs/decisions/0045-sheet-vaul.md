# 0045. 바텀 시트 끌어내리기는 vaul로 하고, 닫힘을 거절하면 끌린 자리를 되돌린다

- 상태: 확정
- 날짜: 2026-09-14

## 맥락

결정 0044가 글쓰기 시트를 닫는 모든 길에 닫기 확인을 걸었다. 그중 하나가 모바일 시트 끌어내리기다.
리뉴얼 1단계의 `Dialog variant="sheet"`는 radix Dialog를 아래에 붙인 모양뿐이라 끌 수 없었다.
AGENTS.md 스타일 절은 시트를 직접 만들지 말고 shadcn 소스를 가져오라고 한다. shadcn의 시트(Drawer)는 vaul이다.

## 선택지

- A. vaul 설치. shadcn Drawer와 같다. 안에서 radix Dialog를 쓰므로 트리거와 제목을 그대로 섞어 쓴다. 의존성이 하나 는다
- B. radix Dialog에 pointer 이벤트로 끌기만 직접 더한다. 패키지는 늘지 않지만 닫힘 기준 거리, 속도, 스크롤과 겹치는 경우를 직접 정하고 다뤄야 한다
- C. 끌기를 빼고 취소, 바깥 누르기, Esc에만 확인을 건다. 결정 0044의 "시트 끌어내리기"를 대체해야 한다

## 결정

**A.** 사용자가 골랐다.

- `components/ui/Dialog.tsx`의 `Sheet`가 768px 미만이면 vaul `Drawer.Root`, 이상이면 radix `Dialog.Root`를 그린다. 폭은 `hooks/useMediaQuery.ts`로 읽는다
- 닫는 길은 모두 `onOpenChange(false)` 하나로 온다. vaul은 닫힘이 거절돼도 끌던 자리를 인라인 style로 남기므로, 다음 프레임에도 열려 있으면 그 style을 걷는다
- vaul이 넣는 0.5초 duration과 자체 이징은 `app/globals.css`에서 `--motion-*`, `--ease-*`로 덮는다. 새 duration과 이징을 만들지 않는다는 규칙 때문이다
- 입력칸은 `data-vaul-no-drag`로 끌기에서 뺀다. 글자를 고르려고 끈 것이 시트를 내리지 않게 한다
- vaul의 닫힘 기준(시트 높이의 25%)과 속도 기준은 기본값을 쓴다

## 비용

- 의존성 `vaul`이 는다
- 거절한 닫힘을 되돌리는 코드가 vaul이 인라인 style을 쓴다는 구현에 기댄다. vaul을 올릴 때 끌기 뒤 닫기 확인을 다시 확인해야 한다
- 폭에 따라 다른 루트를 그리므로, 시트가 열린 채 768px 경계를 넘으면 열린 창이 다시 마운트된다

## 남은 칸

없음.
