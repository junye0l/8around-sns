-- 프로필 이미지. 파일은 Storage의 avatars 버킷에, 프로필에는 버킷 안 경로만 둔다. 결정 0030.
--
-- URL이 아니라 경로를 저장하는 이유: "본인 프로필만 수정한다"(0001_init.sql:121-124)가
-- 본인 행의 어느 컬럼이든 바꾸게 둔다. URL 컬럼이면 PostgREST로 직접 남의 서버 주소를 넣을 수 있고,
-- 그 주소를 모든 방문자의 브라우저가 불러간다. 경로면 호스트가 우리 Storage로 고정되고,
-- 아래 제약이 자기 폴더 밖을 가리키지 못하게 막는다.
--
-- 파일 이름은 올릴 때마다 새로 짓는다(`<uid>/<uuid>.<ext>`). 주소가 바뀌므로 캐시를 따로 깨지 않는다.

alter table public.profiles
add column avatar_path text,
add constraint profiles_avatar_path_format check (
	avatar_path is null
	or avatar_path ~ ('^' || id::text || '/[0-9a-f-]{36}\.(webp|png|jpg)$')
);

-- 공개 버킷이라 읽기는 정책 없이 공개 주소로 된다.
-- 크기와 형식은 서버 진입점(lib/services/profile.ts)이 먼저 보고, 버킷이 한 번 더 막는다.
-- 500KB는 Server Action 본문 상한 1MB 안쪽이다. 화면이 256px로 줄여 올리므로 보통 수십 KB다
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
	'avatars',
	'avatars',
	true,
	500 * 1024,
	array['image/jpeg', 'image/png', 'image/webp']
);

-- 쓰기는 자기 폴더(`<uid>/...`)에만. 첫 폴더 이름이 곧 소유자다.
-- select 정책은 지우기 때문에 둔다. delete 의 where 절이 행을 읽으려면 select 정책도 통과해야 한다
create policy "본인 폴더의 프로필 이미지만 본다"
on storage.objects for select
to authenticated
using (
	bucket_id = 'avatars'
	and (storage.foldername(name))[1] = (select auth.uid())::text
);

create policy "본인 폴더에만 프로필 이미지를 올린다"
on storage.objects for insert
to authenticated
with check (
	bucket_id = 'avatars'
	and (storage.foldername(name))[1] = (select auth.uid())::text
);

create policy "본인 폴더의 프로필 이미지만 바꾼다"
on storage.objects for update
to authenticated
using (
	bucket_id = 'avatars'
	and (storage.foldername(name))[1] = (select auth.uid())::text
)
with check (
	bucket_id = 'avatars'
	and (storage.foldername(name))[1] = (select auth.uid())::text
);

create policy "본인 폴더의 프로필 이미지만 지운다"
on storage.objects for delete
to authenticated
using (
	bucket_id = 'avatars'
	and (storage.foldername(name))[1] = (select auth.uid())::text
);
