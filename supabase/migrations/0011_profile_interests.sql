-- 프로필 관심사. 최대 3개, 한 개에 1~2글자. 결정 0036.
--
-- 넓히기만 한다. 기본값이 있어 가입 트리거(0010_drop_username.sql)와 배포된 코드가 그대로 돌아간다.
-- 수정 권한은 "본인 프로필만 수정한다"(0001_init.sql)가 새 컬럼도 덮는다.

-- CHECK는 서브쿼리를 못 쓰므로 원소 검사를 immutable 함수로 감싼다
create function public.profile_interests_valid(items text[])
returns boolean
language sql
immutable
set search_path = ''
as $$
	select coalesce(
		bool_and(item is not null and item = btrim(item) and char_length(item) between 1 and 2),
		true
	)
	and count(*) = count(distinct item)
	from unnest(items) as item;
$$;

alter table public.profiles
	add column interests text[] not null default '{}',
	add constraint profiles_interests_count check (cardinality(interests) <= 3),
	add constraint profiles_interests_items check (public.profile_interests_valid(interests));
