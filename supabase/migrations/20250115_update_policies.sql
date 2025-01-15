-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view their own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON profiles;
DROP POLICY IF EXISTS "Users can view players" ON players;
DROP POLICY IF EXISTS "Users can create players" ON players;
DROP POLICY IF EXISTS "Users can update players" ON players;
DROP POLICY IF EXISTS "Users can delete players" ON players;
DROP POLICY IF EXISTS "Users can view communities" ON communities;
DROP POLICY IF EXISTS "Users can create communities" ON communities;
DROP POLICY IF EXISTS "Community admins can update communities" ON communities;
DROP POLICY IF EXISTS "Community admins can delete communities" ON communities;
DROP POLICY IF EXISTS "Users can view community members" ON community_members;
DROP POLICY IF EXISTS "Community admins can manage members" ON community_members;
DROP POLICY IF EXISTS "Users can view competitions" ON competitions;
DROP POLICY IF EXISTS "Community admins can manage competitions" ON competitions;
DROP POLICY IF EXISTS "Users can view games" ON games;
DROP POLICY IF EXISTS "Community admins can manage games" ON games;
DROP POLICY IF EXISTS "Users can view matches" ON matches;
DROP POLICY IF EXISTS "Community admins can manage matches" ON matches;

-- Create basic policies for all tables
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
