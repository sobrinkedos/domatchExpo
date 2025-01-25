-- Primeiro, verificar e corrigir a coluna created_by
DO $$ 
BEGIN
    -- Remover a coluna created_by se existir (para recriar corretamente)
    IF EXISTS (SELECT 1 
        FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'communities' 
        AND column_name = 'created_by') 
    THEN
        ALTER TABLE public.communities DROP COLUMN created_by;
    END IF;

    -- Adicionar a coluna created_by novamente com a configuração correta
    ALTER TABLE public.communities
    ADD COLUMN created_by uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL;
END $$;

-- Remover políticas antigas
DROP POLICY IF EXISTS "Enable read for authenticated users" ON communities;
DROP POLICY IF EXISTS "Enable insert for authenticated users" ON communities;
DROP POLICY IF EXISTS "Enable update for owners" ON communities;
DROP POLICY IF EXISTS "Enable delete for owners" ON communities;

-- Habilitar RLS
ALTER TABLE communities ENABLE ROW LEVEL SECURITY;

-- Criar novas políticas
CREATE POLICY "Enable read for authenticated users"
ON communities FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Enable insert for authenticated users"
ON communities FOR INSERT
TO authenticated
WITH CHECK (auth.uid()::text = created_by::text);

CREATE POLICY "Enable update for owners"
ON communities FOR UPDATE
TO authenticated
USING (auth.uid()::text = created_by::text)
WITH CHECK (auth.uid()::text = created_by::text);

CREATE POLICY "Enable delete for owners"
ON communities FOR DELETE
TO authenticated
USING (auth.uid()::text = created_by::text);
