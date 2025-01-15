-- Primeiro, desabilite RLS em todas as tabelas
ALTER TABLE profiles DISABLE ROW LEVEL SECURITY;
ALTER TABLE players DISABLE ROW LEVEL SECURITY;
ALTER TABLE communities DISABLE ROW LEVEL SECURITY;
ALTER TABLE community_members DISABLE ROW LEVEL SECURITY;
ALTER TABLE competitions DISABLE ROW LEVEL SECURITY;
ALTER TABLE games DISABLE ROW LEVEL SECURITY;
ALTER TABLE matches DISABLE ROW LEVEL SECURITY;

-- Remova todas as políticas existentes
DROP POLICY IF EXISTS "Enable read for authenticated users only" ON profiles;
DROP POLICY IF EXISTS "Enable update for users based on id" ON profiles;
DROP POLICY IF EXISTS "Enable all for authenticated users" ON players;
DROP POLICY IF EXISTS "Enable all for authenticated users" ON communities;
DROP POLICY IF EXISTS "Enable all for authenticated users" ON community_members;
DROP POLICY IF EXISTS "Enable all for authenticated users" ON competitions;
DROP POLICY IF EXISTS "Enable all for authenticated users" ON games;
DROP POLICY IF EXISTS "Enable all for authenticated users" ON matches;

-- Habilite RLS novamente
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE players ENABLE ROW LEVEL SECURITY;
ALTER TABLE communities ENABLE ROW LEVEL SECURITY;
ALTER TABLE community_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE competitions ENABLE ROW LEVEL SECURITY;
ALTER TABLE games ENABLE ROW LEVEL SECURITY;
ALTER TABLE matches ENABLE ROW LEVEL SECURITY;

-- Crie políticas simples para cada tabela
CREATE POLICY "Enable read for users"
  ON profiles FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Enable update for users"
  ON profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Enable read for users"
  ON players FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Enable write for users"
  ON players FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Enable read for users"
  ON communities FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Enable write for users"
  ON communities FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Enable read for users"
  ON community_members FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Enable write for users"
  ON community_members FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Enable read for users"
  ON competitions FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Enable write for users"
  ON competitions FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Enable read for users"
  ON games FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Enable write for users"
  ON games FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Enable read for users"
  ON matches FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Enable write for users"
  ON matches FOR INSERT
  TO authenticated
  WITH CHECK (true);
