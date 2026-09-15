# 0051. 파비콘은 코드로 생성하고, 기본 글꼴과 옮겨 적은 색을 쓴다

- 상태: 확정
- 날짜: 2026-09-15

## 맥락

`app/favicon.ico`는 프로젝트 생성 커밋 `adb40fb`에서 들어온 뒤 바뀐 적이 없었다.
로고 마크는 `components/ui/BrandMark.tsx`에 이미 있다. `primary-fill` 사각형에 흰 굵은 "8"이다.
이것을 브라우저 탭 아이콘과 iOS 홈 화면 아이콘으로 옮기는 방법이 갈림길이었다.

## 선택지

### 만드는 방법

**A. `app/icon.tsx`, `app/apple-icon.tsx`에서 `next/og`의 `ImageResponse`로 PNG를 만든다**
- 로고 색과 비율이 코드 한 곳(`components/ui/BrandIconImage.tsx`)에 남는다
- 빌드 때 PNG가 되어 브라우저마다 같게 보인다

**B. 디자인 도구에서 PNG, ICO를 뽑아 `app/`에 둔다**
- 코드가 없다. 로고가 바뀌면 이미지를 다시 뽑아야 하고, 이미지와 `BrandMark`가 따로 논다

**C. `app/icon.svg`에 사각형과 글자를 적는다**
- 가볍지만 SVG 안의 글자는 방문자 기기의 글꼴로 그려진다. 글자를 도형으로 바꾸려면 SVG를 손으로 그려야 하는데 AGENTS.md 스타일 절이 막는다

### "8"의 글꼴

**D. `next/og`에 들어 있는 기본 글꼴을 쓴다**
- 추가 파일이 없다
- 들어 있는 글꼴이 `Geist-Regular.ttf` 하나라 굵기 800이 적용되지 않는다. 메뉴 로고보다 가늘고, 32px에서 약하게 보인다

**E. Pretendard ExtraBold ttf/otf를 넣어 `ImageResponse`에 넘긴다**
- 메뉴 로고와 같은 글자가 된다
- `app/fonts`의 Pretendard는 woff2라 `ImageResponse`가 읽지 못해 파일이 하나 늘어난다

## 결정

**A와 D.** 사용자가 골랐다.

## 일부러 어긴 규칙

- **색을 코드에 옮겨 적었다.** `components/ui/BrandIconImage.tsx`의 `#5750e6`과 `#ffffff`다.
  AGENTS.md 규칙 3은 색의 출처를 `docs/DESIGN.md` 토큰 한 곳에 두고 화면은 Tailwind 유틸리티로 쓰게 한다.
  `ImageResponse`는 CSS 변수를 읽지 못해 토큰을 참조할 수 없다. 값은 `docs/DESIGN.md`의 `primary-fill` 라이트 값과 `on-primary`다

## 비용

- `primary-fill`이나 `on-primary` 토큰이 바뀌면 `BrandIconImage.tsx`도 손으로 고쳐야 한다. 기계 검사는 이 어긋남을 잡지 않는다
- 파비콘의 "8"이 메뉴 로고보다 가늘다
