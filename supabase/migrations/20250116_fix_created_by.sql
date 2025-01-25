-- Primeiro, verificar se a coluna created_by existe
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 
        FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'communities' 
        AND column_name = 'created_by') 
    THEN
        -- Adicionar a coluna created_by se não existir
        ALTER TABLE public.communities
        ADD COLUMN created_by uuid REFERENCES auth.users(id) ON DELETE CASCADE;
    END IF;
END $$;

-- Remover políticas antigas
DROP POLICY IF EXISTS "Enable read for users" ON communities;
DROP POLICY IF EXISTS "Enable write for users" ON communities;
DROP POLICY IF EXISTS "Enable update for users" ON communities;
DROP POLICY IF EXISTS "Enable delete for users" ON communities;

-- Criar novas políticas
CREATE POLICY "Enable read for authenticated users"
ON communities FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Enable insert for authenticated users"
ON communities FOR INSERT
TO authenticated
WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Enable update for owners"
ON communities FOR UPDATE
TO authenticated
USING (auth.uid() = created_by)
WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Enable delete for owners"
ON communities FOR DELETE
TO authenticated
USING (auth.uid() = created_by);
