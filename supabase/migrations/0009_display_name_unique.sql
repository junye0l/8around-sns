-- 별명(display_name)을 사람을 가리키는 유일한 이름으로 삼는다. 아이디(username)는 곧 없앤다. 결정 0032.
--
-- 두 단계로 나눈다. 이 파일은 넓히기만 하고, 배포된 코드가 그대로 돌아가야 한다.
-- 새 코드가 배포된 뒤 다음 마이그레이션이 username 컬럼을 지운다.
--
-- 옛 코드: 가입 때 username을 보내고 트리거가 display_name에도 같은 값을 넣는다. 둘 다 계속 된다.
-- 새 코드: 가입 때 display_name만 보낸다. username은 null로 남는다.

alter table public.profiles alter column username drop not null;

-- 대소문자만 다른 별명도 같은 별명으로 본다. 앞뒤 공백은 서버가 저장 전에 지운다
create unique index profiles_display_name_lower_key
on public.profiles (lower(display_name));
