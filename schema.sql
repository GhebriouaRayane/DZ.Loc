-- Utilisateurs
create table if not exists users (
  id SERIAL primary key,
  full_name text not null,
  email text unique not null,
  phone text,
  password_hash text not null,
  user_type text check (user_type in ('tenant','owner')) not null,
  avatar_url text,
  bio text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Propriétés
create table if not exists properties (
  id SERIAL primary key,
  owner_id INTEGER not null references users(id) on delete cascade,
  title text not null,
  price integer not null check (price > 0),
  type text not null check (type in ('apartment', 'house', 'studio', 'villa')),
  status text not null default 'available' check (status in ('available', 'rented')),
  surface integer check (surface > 0),
  rooms integer check (rooms >= 0),
  bedrooms integer check (bedrooms >= 0),
  bathrooms integer check (bathrooms >= 0),
  address text not null,
  city text not null,
  whatsapp text,
  description text,
  views integer default 0 check (views >= 0),
  date_added timestamptz default now(),
  updated_at timestamptz default now()
);

-- Images de propriété
create table if not exists property_images (
  id SERIAL primary key,
  property_id INTEGER not null references properties(id) on delete cascade,
  url text not null,
  created_at timestamptz default now()
);

-- Équipements (amenities)
create table if not exists amenities (
  id SERIAL primary key,
  code text unique not null,
  name text not null
);

-- Lien propriétés-amenities
create table if not exists property_amenities (
  property_id INTEGER references properties(id) on delete cascade,
  amenity_id INTEGER references amenities(id) on delete cascade,
  primary key (property_id, amenity_id)
);

-- Favoris (locataires)
create table if not exists favorites (
  user_id INTEGER references users(id) on delete cascade,
  property_id INTEGER references properties(id) on delete cascade,
  created_at timestamptz default now(),
  primary key (user_id, property_id)
);

-- Conversations
create table if not exists conversations (
  id SERIAL primary key,
  property_id INTEGER references properties(id) on delete cascade,
  user1_id INTEGER references users(id) on delete cascade,
  user2_id INTEGER references users(id) on delete cascade,
  created_at timestamptz default now(),
  last_updated timestamptz default now(),
  unique(property_id, user1_id, user2_id)
);

-- Messages
create table if not exists messages (
  id SERIAL primary key,
  conversation_id INTEGER references conversations(id) on delete cascade,
  sender_id INTEGER references users(id) on delete cascade,
  content text not null,
  timestamp timestamptz default now(),
  is_read boolean default false
);

-- Visites
create table if not exists visits (
  id SERIAL primary key,
  property_id INTEGER references properties(id) on delete cascade,
  user_id INTEGER references users(id) on delete cascade,
  date date not null,
  time text not null,
  message text,
  status text default 'pending' check (status in ('pending', 'accepted', 'rejected', 'completed')),
  owner_response text,
  created_at timestamptz default now(),
  responded_at timestamptz
);

-- Avis (reviews)
create table if not exists reviews (
  id SERIAL primary key,
  property_id INTEGER references properties(id) on delete cascade,
  user_id INTEGER references users(id) on delete cascade,
  stars int not null check (stars between 1 and 5),
  comment text not null,
  created_at timestamptz default now(),
  unique(property_id, user_id) -- Un utilisateur ne peut review qu'une fois
);

-- ==================== INDEX POUR LES PERFORMANCES ====================

-- Index pour les users
create index if not exists idx_users_email on users(email);
create index if not exists idx_users_user_type on users(user_type);

-- Index pour les properties
create index if not exists idx_properties_owner_id on properties(owner_id);
create index if not exists idx_properties_city on properties(city);
create index if not exists idx_properties_type on properties(type);
create index if not exists idx_properties_price on properties(price);
create index if not exists idx_properties_status on properties(status);

-- Index pour les recherches
create index if not exists idx_properties_search on properties(city, type, price, status);

-- Index pour les property_images
create index if not exists idx_property_images_property_id on property_images(property_id);

-- Index pour les favorites
create index if not exists idx_favorites_user_id on favorites(user_id);
create index if not exists idx_favorites_property_id on favorites(property_id);

-- Index pour les conversations
create index if not exists idx_conversations_property_id on conversations(property_id);
create index if not exists idx_conversations_user1_id on conversations(user1_id);
create index if not exists idx_conversations_user2_id on conversations(user2_id);
create index if not exists idx_conversations_last_updated on conversations(last_updated);

-- Index pour les messages
create index if not exists idx_messages_conversation_id on messages(conversation_id);
create index if not exists idx_messages_sender_id on messages(sender_id);
create index if not exists idx_messages_timestamp on messages(timestamp);

-- Index pour les visits
create index if not exists idx_visits_property_id on visits(property_id);
create index if not exists idx_visits_user_id on visits(user_id);
create index if not exists idx_visits_status on visits(status);

-- Index pour les reviews
create index if not exists idx_reviews_property_id on reviews(property_id);
create index if not exists idx_reviews_user_id on reviews(user_id);

-- ==================== DONNÉES INITIALES ====================

-- Amenities de base
insert into amenities (code, name) values
('wifi', 'Wi-Fi'),
('parking', 'Parking'),
('climatisation', 'Climatisation'),
('chauffage', 'Chauffage'),
('ascenseur', 'Ascenseur'),
('balcon', 'Balcon'),
('jardin', 'Jardin'),
('piscine', 'Piscine'),
('meuble', 'Meublé'),
('cuisine_equipee', 'Cuisine équipée')
on conflict (code) do nothing;

-- ==================== COMMENTAIRES ====================

comment on table users is 'Table des utilisateurs de la plateforme';
comment on table properties is 'Table des propriétés à louer';
comment on table property_images is 'Images des propriétés';
comment on table amenities is 'Équipements disponibles pour les propriétés';
comment on table property_amenities is 'Lien entre propriétés et équipements';
comment on table favorites is 'Propriétés favorites des utilisateurs';
comment on table conversations is 'Conversations entre utilisateurs';
comment on table messages is 'Messages des conversations';
comment on table visits is 'Demandes de visites';
comment on table reviews is 'Avis sur les propriétés';
