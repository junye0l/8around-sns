-- 아이디(username)를 지운다. 0009에서 넓히고, 이 컬럼을 읽지 않는 코드(PR #71)가 배포된 뒤에 줄인다. 결정 0032.
--
-- 컬럼을 지우면 그 컬럼에만 걸린 제약(`profiles_username_format`, unique)도 같이 사라진다.
-- 트리거 함수는 컬럼 이름을 문자열로 들고 있어 저절로 바뀌지 않으므로 다시 만든다.

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
	insert into public.profiles (id, display_name)
	values (new.id, new.raw_user_meta_data ->> 'display_name');
	return new;
end;
$$;

alter table public.profiles drop column username;
