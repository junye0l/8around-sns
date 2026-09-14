# 0030. 프로필 이미지는 Storage에 두고, 브라우저가 줄여서 Server Action으로 올린다

- 상태: 확정
- 날짜: 2026-09-14

## 맥락

사용자가 프로필 편집을 요청했다. 내 프로필에서 팔로우 버튼 자리에 "프로필 편집" 버튼을 두고 모달에서
표시 이름(`display_name`)과 프로필 이미지를 바꾼다. 아이디(`username`)는 주소라 고정이다.
이미지가 없으면 이름 첫 글자 대신 사람 아이콘을 보인다.

`AGENTS.md`의 범위 밖 목록에 이미지 업로드가 있지만 "사용자 요청이 없으면"이 붙어 있고, 이번에 요청이 왔다.

갈림길이 셋이었다. 어느 쪽을 골라도 동작은 했다.

## 선택지

### 1. 프로필에 무엇을 저장하나

**A. 공개 URL 전체(`avatar_url`)**

- 화면이 그대로 `src`에 넣는다
- "본인 프로필만 수정한다"(`supabase/migrations/0001_init.sql:121-124`)는 본인 행의 어느 컬럼이든 바꾸게 둔다.
  anon 키로 PostgREST를 직접 부르면 아무 서버 주소나 넣을 수 있고, 그 주소를 글을 보는 모든 사람의 브라우저가 불러간다
- 프로젝트 호스트가 행마다 박힌다

**B. 버킷 안 경로(`avatar_path`)**

- 호스트는 `NEXT_PUBLIC_SUPABASE_URL`에서 온다. `components/ui/Avatar.tsx` 한 곳에서 붙인다
- CHECK 제약 `profiles_avatar_path_format`이 `<자기 id>/<uuid>.<webp|png|jpg>`만 받는다. 남의 폴더도 바깥 주소도 가리킬 수 없다

### 2. 어디서 줄이나

**A. 원본을 올리고 서버나 이미지 변환이 줄인다**

- Server Action 본문은 기본 1MB다(`node_modules/next/dist/docs/01-app/02-guides/server-actions.md:83`). 휴대폰 사진은 넘는다.
  상한을 올리면 모든 액션의 상한이 같이 오른다
- `next/image` 최적화나 Supabase 이미지 변환을 쓰면 그 사용량이 든다

**B. 브라우저가 캔버스로 가운데를 잘라 256px WebP로 줄여서 올린다**

- 올리는 양이 수 KB에서 수십 KB다. 1200x900 테스트 PNG(105KB)가 요청 본문 2,890바이트로 갔다. 단색 위주 그림이라 작게 나온 값이다
- 256px는 프로필 헤더 84px의 3배 밀도까지 덮는다
- 줄인 파일을 그대로 쓰므로 `next/image`는 `unoptimized`로 둔다
- 브라우저가 WebP 인코딩을 못 하면 `toBlob`이 PNG를 준다. 서버가 PNG도 받는다

### 3. 누가 Storage에 쓰나

**A. 브라우저가 anon 키로 Storage에 직접 올리고, 액션은 경로만 받는다**

- 액션 본문 상한과 무관하다
- 쓰기 진입점이 둘이 된다. `AGENTS.md`의 "쓰기는 Server Action으로만"과 어긋나고, 검증이 버킷 설정에만 남는다

**B. 폼에 줄인 파일을 실어 Server Action이 올린다**

- 진입점이 하나고, 형식과 크기 검증이 `lib/services/profile.ts`의 zod에 있다 (규칙 9)
- 2번 B로 본문이 작아서 상한에 닿지 않는다

## 결정

**1B, 2B, 3B.**

같이 정한 값:

- **버킷 `avatars`는 공개 읽기다.** 프로필 이미지는 프로필처럼 누구나 본다. 쓰기, 바꾸기, 지우기는 첫 폴더가
  `auth.uid()`인 객체만 된다(`supabase/migrations/0007_profile_avatars.sql`). 지우려면 select도 통과해야 해서 자기 폴더 select 정책을 둔다
- **크기 상한 500KB, 형식 JPEG, PNG, WebP.** 서비스와 버킷 `file_size_limit`, `allowed_mime_types`가 같은 값을 본다.
  앱 쪽 값은 `lib/utils/content-limits.ts`에 있다
- **파일 이름은 올릴 때마다 새 uuid다.** 주소가 바뀌므로 캐시를 깨는 쿼리를 붙이지 않는다. 새 파일을 올리고
  프로필을 바꾼 뒤 옛 파일을 지운다. 프로필 저장이 실패하면 방금 올린 파일을 지운다
- **이미지를 기본 이미지로 되돌리는 길은 아직 없다.** 요청 범위가 "바꾸기"였다
- **기본 이미지는 lucide `UserRound`를 `hairline` 원 위에 `fg-muted`로 그린다.** 파일을 두지 않는다

## 비용

- 옛 파일 지우기가 실패하면 고아 파일이 남는다. 저장은 성공으로 친다
- 공개 주소는 Supabase CDN이 캐시한다. 지운 직후에도 같은 주소가 한동안 200을 줄 수 있다.
  확인했을 때 쿼리 문자열을 붙인 요청은 400이었다
- 파일 내용이 정말 이미지인지는 서버가 보지 않는다. 형식은 브라우저가 붙인 `type`이다. Storage가 그 형식으로 내려주므로
  페이지로 실행되지는 않지만, 이미지가 아닌 바이트가 저장될 수는 있다
- `next/image`의 `unoptimized`라 반응형 `srcset`이 없다. 모든 자리가 256px 한 장을 받는다
