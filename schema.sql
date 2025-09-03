-- Utilisateurs
create table if not exists users (
  id uuid primary key default gen_random_uuid(),
  full_name text not null,
  email text unique not null,
  phone text,
  password_hash text not null,
  user_type text check (user_type in ('tenant','owner')) not null,
  avatar_url text,
  bio text,
  created_at timestamptz default now()
);

-- Propriétés
create table if not exists properties (
  id bigserial primary key,
  owner_id uuid not null references users(id) on delete cascade,
  title text not null,
  price integer not null,
  type text not null,            -- apartment, studio, house...
  status text not null,          -- available, rented
  surface integer,
  rooms integer,
  bedrooms integer,
  bathrooms integer,
  address text,
  city text,
  whatsapp text,
  description text,
  views integer default 0,
  date_added timestamptz default now()
);

-- Images de propriété
create table if not exists property_images (
  id bigserial primary key,
  property_id bigint not null references properties(id) on delete cascade,
  url text not null
);

-- Équipements (amenities)
create table if not exists amenities (
  id bigserial primary key,
  code text unique not null
);

-- Lien propriétés-amenities
create table if not exists property_amenities (
  property_id bigint references properties(id) on delete cascade,
  amenity_id bigint references amenities(id) on delete cascade,
  primary key (property_id, amenity_id)
);

-- Favoris (locataires)
create table if not exists favorites (
  user_id uuid references users(id) on delete cascade,
  property_id bigint references properties(id) on delete cascade,
  primary key (user_id, property_id)
);

-- Conversations
create table if not exists conversations (
  id bigserial primary key,
  property_id bigint references properties(id) on delete cascade,
  user1_id uuid references users(id) on delete cascade,
  user2_id uuid references users(id) on delete cascade,
  last_updated timestamptz default now()
);

-- Messages
create table if not exists messages (
  id bigserial primary key,
  conversation_id bigint references conversations(id) on delete cascade,
  sender_id uuid references users(id) on delete cascade,
  content text not null,
  timestamp timestamptz default now()
);

-- Visites
create table if not exists visits (
  id bigserial primary key,
  property_id bigint references properties(id) on delete cascade,
  user_id uuid references users(id) on delete cascade,
  date date not null,
  time text not null,
  message text,
  status text default 'pending', -- pending/accepted/rejected
  owner_response text,
  created_at timestamptz default now(),
  responded_at timestamptz
);

-- Avis (reviews)
create table if not exists reviews (
  id bigserial primary key,
  property_id bigint references properties(id) on delete cascade,
  user_id uuid references users(id) on delete cascade,
  stars int check (stars between 1 and 5) not null,
  comment text not null,
  created_at timestamptz default now()
);

-- Seed quelques amenities
insert into amenities (code) values
('wifi'),('parking'),('climatisation')
on conflict do nothing;

