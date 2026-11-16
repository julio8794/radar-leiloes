-- Radar de Leilões · Garagem compartilhada
-- Rode este arquivo inteiro uma vez no SQL Editor do Supabase.
-- Acesso: cada garagem tem uma chave secreta (vai no link). Quem não tem a chave não lê nem grava nada.

create table if not exists public.garagem_spaces (
  space text primary key check (length(space) >= 24),
  criado timestamptz not null default now()
);
create table if not exists public.garagem (
  space text not null references public.garagem_spaces(space) on delete cascade,
  id text not null,
  data jsonb not null,
  upd bigint not null default 0,
  primary key (space, id)
);
create table if not exists public.ia_uso (
  space text not null references public.garagem_spaces(space) on delete cascade,
  dia date not null default current_date,
  n int not null default 0,
  primary key (space, dia)
);

-- chave enviada pelo site no cabeçalho x-garage-key
create or replace function public.garage_key() returns text language sql stable as $$
  select coalesce(current_setting('request.headers', true)::json->>'x-garage-key', '')
$$;
create or replace function public.space_exists(k text) returns boolean language sql stable security definer set search_path = public as $$
  select exists(select 1 from public.garagem_spaces where space = k)
$$;
-- cria uma garagem nova (o site gera a chave aleatória no aparelho)
create or replace function public.criar_garagem(k text) returns boolean language plpgsql security definer set search_path = public as $$
begin
  if length(k) < 24 then raise exception 'chave curta'; end if;
  insert into public.garagem_spaces(space) values (k) on conflict do nothing;
  return true;
end $$;

alter table public.garagem_spaces enable row level security;
alter table public.garagem enable row level security;
alter table public.ia_uso enable row level security;

drop policy if exists "garagem por chave" on public.garagem;
create policy "garagem por chave" on public.garagem for all to anon, authenticated
  using (space = public.garage_key()) with check (space = public.garage_key());
-- garagem_spaces e ia_uso: sem políticas = ninguém acessa direto (só as funções acima e a função de IA)

grant execute on function public.criar_garagem(text) to anon, authenticated;
grant execute on function public.space_exists(text) to anon, authenticated;
grant select, insert, update, delete on public.garagem to anon, authenticated;

-- fotos: leitura pública por endereço impossível de adivinhar; gravação só dentro da pasta de uma garagem que existe
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('fotos', 'fotos', true, 5242880, array['image/jpeg','image/png','image/webp'])
on conflict (id) do nothing;
drop policy if exists "fotos: envio na pasta da garagem" on storage.objects;
create policy "fotos: envio na pasta da garagem" on storage.objects for insert to anon, authenticated
  with check (bucket_id = 'fotos' and public.space_exists((storage.foldername(name))[1]));
drop policy if exists "fotos: apagar na pasta da garagem" on storage.objects;
create policy "fotos: apagar na pasta da garagem" on storage.objects for delete to anon, authenticated
  using (bucket_id = 'fotos' and (storage.foldername(name))[1] = public.garage_key());
