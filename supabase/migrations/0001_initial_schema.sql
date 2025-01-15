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
  start_date DATE NOT NULL,
  end_date DATE,
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

-- Create policies
CREATE POLICY "Users can view their own profile"
  ON profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "Users can view their own players and players in their communities"
  ON players FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM community_members cm
      WHERE cm.player_id = players.id
      AND EXISTS (
        SELECT 1 FROM community_members cm2
        WHERE cm2.community_id = cm.community_id
        AND cm2.player_id = players.id
      )
    )
  );

CREATE POLICY "Users can create players"
  ON players FOR INSERT
  WITH CHECK (TRUE);

CREATE POLICY "Users can update players"
  ON players FOR UPDATE
  USING (TRUE);

CREATE POLICY "Users can delete players"
  ON players FOR DELETE
  USING (TRUE);

-- Communities policies
CREATE POLICY "Users can view communities they are members of"
  ON communities FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM community_members cm
      WHERE cm.community_id = communities.id
      AND cm.player_id IN (
        SELECT id FROM players
      )
    )
  );

CREATE POLICY "Users can create communities"
  ON communities FOR INSERT
  WITH CHECK (TRUE);

CREATE POLICY "Users can update communities they are admins of"
  ON communities FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM community_members cm
      WHERE cm.community_id = communities.id
      AND cm.role = 'admin'
      AND cm.player_id IN (
        SELECT id FROM players
      )
    )
  );

CREATE POLICY "Users can delete communities they are admins of"
  ON communities FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM community_members cm
      WHERE cm.community_id = communities.id
      AND cm.role = 'admin'
      AND cm.player_id IN (
        SELECT id FROM players
      )
    )
  );

-- Community members policies
CREATE POLICY "Users can view community members"
  ON community_members FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM community_members cm
      WHERE cm.community_id = community_members.community_id
    )
  );

CREATE POLICY "Users can add community members if they are admins"
  ON community_members FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM community_members cm
      WHERE cm.community_id = community_members.community_id
      AND cm.role = 'admin'
      AND cm.player_id IN (
        SELECT id FROM players
      )
    )
  );

CREATE POLICY "Users can update community members if they are admins"
  ON community_members FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM community_members cm
      WHERE cm.community_id = community_members.community_id
      AND cm.role = 'admin'
      AND cm.player_id IN (
        SELECT id FROM players
      )
    )
  );

CREATE POLICY "Users can delete community members if they are admins"
  ON community_members FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM community_members cm
      WHERE cm.community_id = community_members.community_id
      AND cm.role = 'admin'
      AND cm.player_id IN (
        SELECT id FROM players
      )
    )
  );

-- Competitions policies
CREATE POLICY "Users can view competitions in their communities"
  ON competitions FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM community_members cm
      WHERE cm.community_id = competitions.community_id
      AND cm.player_id IN (
        SELECT id FROM players
      )
    )
  );

CREATE POLICY "Users can create competitions if they are community admins"
  ON competitions FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM community_members cm
      WHERE cm.community_id = competitions.community_id
      AND cm.role = 'admin'
      AND cm.player_id IN (
        SELECT id FROM players
      )
    )
  );

CREATE POLICY "Users can update competitions if they are community admins"
  ON competitions FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM community_members cm
      WHERE cm.community_id = competitions.community_id
      AND cm.role = 'admin'
      AND cm.player_id IN (
        SELECT id FROM players
      )
    )
  );

CREATE POLICY "Users can delete competitions if they are community admins"
  ON competitions FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM community_members cm
      WHERE cm.community_id = competitions.community_id
      AND cm.role = 'admin'
      AND cm.player_id IN (
        SELECT id FROM players
      )
    )
  );

-- Games policies
CREATE POLICY "Users can view games in their competitions"
  ON games FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM competitions c
      JOIN community_members cm ON cm.community_id = c.community_id
      WHERE c.id = games.competition_id
      AND cm.player_id IN (
        SELECT id FROM players
      )
    )
  );

CREATE POLICY "Users can create games if they are community admins"
  ON games FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM competitions c
      JOIN community_members cm ON cm.community_id = c.community_id
      WHERE c.id = games.competition_id
      AND cm.role = 'admin'
      AND cm.player_id IN (
        SELECT id FROM players
      )
    )
  );

CREATE POLICY "Users can update games if they are community admins"
  ON games FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM competitions c
      JOIN community_members cm ON cm.community_id = c.community_id
      WHERE c.id = games.competition_id
      AND cm.role = 'admin'
      AND cm.player_id IN (
        SELECT id FROM players
      )
    )
  );

CREATE POLICY "Users can delete games if they are community admins"
  ON games FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM competitions c
      JOIN community_members cm ON cm.community_id = c.community_id
      WHERE c.id = games.competition_id
      AND cm.role = 'admin'
      AND cm.player_id IN (
        SELECT id FROM players
      )
    )
  );

-- Matches policies
CREATE POLICY "Users can view matches in their games"
  ON matches FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM games g
      JOIN competitions c ON c.id = g.competition_id
      JOIN community_members cm ON cm.community_id = c.community_id
      WHERE g.id = matches.game_id
      AND cm.player_id IN (
        SELECT id FROM players
      )
    )
  );

CREATE POLICY "Users can create matches if they are community admins"
  ON matches FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM games g
      JOIN competitions c ON c.id = g.competition_id
      JOIN community_members cm ON cm.community_id = c.community_id
      WHERE g.id = matches.game_id
      AND cm.role = 'admin'
      AND cm.player_id IN (
        SELECT id FROM players
      )
    )
  );

CREATE POLICY "Users can update matches if they are community admins"
  ON matches FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM games g
      JOIN competitions c ON c.id = g.competition_id
      JOIN community_members cm ON cm.community_id = c.community_id
      WHERE g.id = matches.game_id
      AND cm.role = 'admin'
      AND cm.player_id IN (
        SELECT id FROM players
      )
    )
  );

CREATE POLICY "Users can delete matches if they are community admins"
  ON matches FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM games g
      JOIN competitions c ON c.id = g.competition_id
      JOIN community_members cm ON cm.community_id = c.community_id
      WHERE g.id = matches.game_id
      AND cm.role = 'admin'
      AND cm.player_id IN (
        SELECT id FROM players
      )
    )
  );
