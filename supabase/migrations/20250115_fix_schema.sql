-- Primeiro, remova todas as políticas existentes
DO $$ 
DECLARE 
  r RECORD;
BEGIN
  FOR r IN (
    SELECT schemaname, tablename, policyname
    FROM pg_policies 
    WHERE schemaname = 'public'
  ) LOOP
    EXECUTE format('DROP POLICY IF EXISTS %I ON %I.%I', 
      r.policyname, r.schemaname, r.tablename);
  END LOOP;
END $$;

-- Desabilite RLS em todas as tabelas
ALTER TABLE IF EXISTS profiles DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS players DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS communities DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS community_members DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS competitions DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS games DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS matches DISABLE ROW LEVEL SECURITY;

-- Recrie as tabelas com os campos corretos
DROP TABLE IF EXISTS matches;
DROP TABLE IF EXISTS games;
DROP TABLE IF EXISTS competitions;
DROP TABLE IF EXISTS community_members;
DROP TABLE IF EXISTS communities;
DROP TABLE IF EXISTS players;
DROP TABLE IF EXISTS profiles;

-- Crie as tabelas novamente
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::TEXT, NOW()) NOT NULL
);

CREATE TABLE players (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name TEXT NOT NULL,
  nickname TEXT,
  phone TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::TEXT, NOW()) NOT NULL
);

CREATE TABLE communities (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  location TEXT,
  whatsapp_group_id TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::TEXT, NOW()) NOT NULL
);

CREATE TABLE community_members (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  community_id UUID NOT NULL REFERENCES communities(id) ON DELETE CASCADE,
  player_id UUID NOT NULL REFERENCES players(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('admin', 'member')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::TEXT, NOW()) NOT NULL,
  UNIQUE(community_id, player_id)
);

CREATE TABLE competitions (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name TEXT NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('draft', 'in_progress', 'finished')) DEFAULT 'draft',
  community_id UUID NOT NULL REFERENCES communities(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::TEXT, NOW()) NOT NULL
);

CREATE TABLE games (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  competition_id UUID NOT NULL REFERENCES competitions(id) ON DELETE CASCADE,
  player1_id UUID NOT NULL REFERENCES players(id) ON DELETE CASCADE,
  player2_id UUID NOT NULL REFERENCES players(id) ON DELETE CASCADE,
  player1_score INTEGER,
  player2_score INTEGER,
  status TEXT NOT NULL CHECK (status IN ('scheduled', 'in_progress', 'finished')) DEFAULT 'scheduled',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::TEXT, NOW()) NOT NULL,
  CONSTRAINT different_players CHECK (player1_id != player2_id)
);

CREATE TABLE matches (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  game_id UUID NOT NULL REFERENCES games(id) ON DELETE CASCADE,
  player1_score INTEGER NOT NULL,
  player2_score INTEGER NOT NULL,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::TEXT, NOW()) NOT NULL
);

-- Habilite RLS apenas para profiles
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Crie políticas apenas para profiles
CREATE POLICY "Enable read for authenticated users"
  ON profiles FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Enable update for users"
  ON profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id);
