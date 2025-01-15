-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create tables
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::TEXT, NOW()) NOT NULL
);

CREATE TABLE IF NOT EXISTS players (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name TEXT NOT NULL,
  nickname TEXT,
  phone TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::TEXT, NOW()) NOT NULL
);

CREATE TABLE IF NOT EXISTS communities (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  location TEXT,
  whatsapp_group_id TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::TEXT, NOW()) NOT NULL
);

CREATE TABLE IF NOT EXISTS community_members (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  community_id UUID NOT NULL REFERENCES communities(id) ON DELETE CASCADE,
  player_id UUID NOT NULL REFERENCES players(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('admin', 'member')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::TEXT, NOW()) NOT NULL,
  UNIQUE(community_id, player_id)
);

CREATE TABLE IF NOT EXISTS competitions (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  start_date TIMESTAMP WITH TIME ZONE NOT NULL,
  end_date TIMESTAMP WITH TIME ZONE,
  status TEXT NOT NULL CHECK (status IN ('draft', 'in_progress', 'finished')) DEFAULT 'draft',
  community_id UUID NOT NULL REFERENCES communities(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::TEXT, NOW()) NOT NULL
);

CREATE TABLE IF NOT EXISTS games (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  competition_id UUID NOT NULL REFERENCES competitions(id) ON DELETE CASCADE,
  player1_id UUID NOT NULL REFERENCES players(id) ON DELETE CASCADE,
  player2_id UUID NOT NULL REFERENCES players(id) ON DELETE CASCADE,
  player1_score INTEGER,
  player2_score INTEGER,
  status TEXT NOT NULL CHECK (status IN ('scheduled', 'in_progress', 'finished')) DEFAULT 'scheduled',
  winner_id UUID REFERENCES players(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::TEXT, NOW()) NOT NULL,
  CONSTRAINT different_players CHECK (player1_id != player2_id)
);

CREATE TABLE IF NOT EXISTS matches (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  game_id UUID NOT NULL REFERENCES games(id) ON DELETE CASCADE,
  player1_score INTEGER NOT NULL,
  player2_score INTEGER NOT NULL,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::TEXT, NOW()) NOT NULL
);

-- Enable RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE players ENABLE ROW LEVEL SECURITY;
ALTER TABLE communities ENABLE ROW LEVEL SECURITY;
ALTER TABLE community_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE competitions ENABLE ROW LEVEL SECURITY;
ALTER TABLE games ENABLE ROW LEVEL SECURITY;
ALTER TABLE matches ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Enable read for authenticated users only" ON profiles;
DROP POLICY IF EXISTS "Enable update for users based on id" ON profiles;
DROP POLICY IF EXISTS "Enable all for authenticated users" ON players;
DROP POLICY IF EXISTS "Enable all for authenticated users" ON communities;
DROP POLICY IF EXISTS "Enable all for authenticated users" ON community_members;
DROP POLICY IF EXISTS "Enable all for authenticated users" ON competitions;
DROP POLICY IF EXISTS "Enable all for authenticated users" ON games;
DROP POLICY IF EXISTS "Enable all for authenticated users" ON matches;

-- Create policies
-- Profiles
CREATE POLICY "Enable read for authenticated users only"
  ON profiles FOR SELECT
  USING (auth.role() = 'authenticated');

CREATE POLICY "Enable update for users based on id"
  ON profiles FOR UPDATE
  USING (auth.uid() = id);

-- All other tables
-- Players
CREATE POLICY "Enable all for authenticated users"
  ON players FOR ALL
  USING (auth.role() = 'authenticated');

-- Communities
CREATE POLICY "Enable all for authenticated users"
  ON communities FOR ALL
  USING (auth.role() = 'authenticated');

-- Community members
CREATE POLICY "Enable all for authenticated users"
  ON community_members FOR ALL
  USING (auth.role() = 'authenticated');

-- Competitions
CREATE POLICY "Enable all for authenticated users"
  ON competitions FOR ALL
  USING (auth.role() = 'authenticated');

-- Games
CREATE POLICY "Enable all for authenticated users"
  ON games FOR ALL
  USING (auth.role() = 'authenticated');

-- Matches
CREATE POLICY "Enable all for authenticated users"
  ON matches FOR ALL
  USING (auth.role() = 'authenticated');
