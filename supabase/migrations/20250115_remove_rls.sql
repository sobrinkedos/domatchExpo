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
ALTER TABLE profiles DISABLE ROW LEVEL SECURITY;
ALTER TABLE players DISABLE ROW LEVEL SECURITY;
ALTER TABLE communities DISABLE ROW LEVEL SECURITY;
ALTER TABLE community_members DISABLE ROW LEVEL SECURITY;
ALTER TABLE competitions DISABLE ROW LEVEL SECURITY;
ALTER TABLE games DISABLE ROW LEVEL SECURITY;
ALTER TABLE matches DISABLE ROW LEVEL SECURITY;

-- Habilite RLS novamente apenas nas tabelas necessárias
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
