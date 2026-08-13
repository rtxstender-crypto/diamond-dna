create extension if not exists pgcrypto;
create type public.contributor_role as enum ('ADMIN','EDITOR','CONTRIBUTOR');
create type public.article_status as enum ('draft','published');

create table public.contributor_profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text not null check (char_length(display_name) between 1 and 100),
  role public.contributor_role not null default 'CONTRIBUTOR',
  created_at timestamptz not null default now()
);
create table public.articles (
  id uuid primary key default gen_random_uuid(), title text not null, slug text not null unique,
  excerpt text not null, content text not null, cover_image_url text, image_alt text,
  author_name text not null, author_id uuid not null references public.contributor_profiles(id),
  created_at timestamptz not null default now(), published_at timestamptz, updated_at timestamptz not null default now(),
  status public.article_status not null default 'draft', category text not null, tags text[] not null default '{}',
  related_player_id bigint, related_team_id bigint, seo_title text, seo_description text,
  constraint published_requires_date check (status='draft' or published_at is not null),
  constraint article_lengths check (char_length(title) between 1 and 140 and char_length(excerpt) between 1 and 320 and char_length(content) between 1 and 40000)
);
create index articles_public_order on public.articles(status,published_at desc);
create index articles_author_order on public.articles(author_id,updated_at desc);
create function public.touch_updated_at() returns trigger language plpgsql set search_path='' as $$ begin new.updated_at=now(); return new; end $$;
create trigger articles_touch before update on public.articles for each row execute function public.touch_updated_at();

alter table public.contributor_profiles enable row level security;
alter table public.articles enable row level security;
create policy "profile self read" on public.contributor_profiles for select to authenticated using (id=auth.uid());
create policy "published public read" on public.articles for select using (status='published');
create policy "contributors read own" on public.articles for select to authenticated using (author_id=auth.uid() or exists(select 1 from public.contributor_profiles p where p.id=auth.uid() and p.role in ('ADMIN','EDITOR')));
create policy "contributors insert own" on public.articles for insert to authenticated with check (author_id=auth.uid() and (status='draft' or exists(select 1 from public.contributor_profiles p where p.id=auth.uid() and p.role in ('ADMIN','EDITOR'))));
create policy "contributors update allowed" on public.articles for update to authenticated using (author_id=auth.uid() or exists(select 1 from public.contributor_profiles p where p.id=auth.uid() and p.role in ('ADMIN','EDITOR'))) with check (status='draft' or exists(select 1 from public.contributor_profiles p where p.id=auth.uid() and p.role in ('ADMIN','EDITOR')));

insert into storage.buckets(id,name,public,file_size_limit,allowed_mime_types) values('article-images','article-images',true,5242880,array['image/jpeg','image/png','image/webp','image/avif']) on conflict(id) do update set file_size_limit=excluded.file_size_limit,allowed_mime_types=excluded.allowed_mime_types;
create policy "article images public read" on storage.objects for select using (bucket_id='article-images');
create policy "contributors upload own images" on storage.objects for insert to authenticated with check (bucket_id='article-images' and (storage.foldername(name))[1]=auth.uid()::text and exists(select 1 from public.contributor_profiles p where p.id=auth.uid()));

-- Create users through Supabase Auth, then approve them explicitly:
-- insert into public.contributor_profiles(id,display_name,role) values('<auth-user-uuid>','Name','CONTRIBUTOR');
