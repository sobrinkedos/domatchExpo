-- Primeiro, remover TODAS as políticas possíveis
DROP POLICY IF EXISTS "Enable read for authenticated users" ON communities;
DROP POLICY IF EXISTS "Enable read for users" ON communities;
DROP POLICY IF EXISTS "Enable insert for authenticated users" ON communities;
DROP POLICY IF EXISTS "Enable write for users" ON communities;
DROP POLICY IF EXISTS "Enable update for owners" ON communities;
DROP POLICY IF EXISTS "Enable update for users" ON communities;
DROP POLICY IF EXISTS "Enable delete for owners" ON communities;
DROP POLICY IF EXISTS "Enable delete for users" ON communities;
DROP POLICY IF EXISTS "Usuários autenticados podem ver todas as comunidades" ON communities;
DROP POLICY IF EXISTS "Usuários autenticados podem criar comunidades" ON communities;
DROP POLICY IF EXISTS "Usuários podem atualizar suas próprias comunidades" ON communities;
DROP POLICY IF EXISTS "Usuários podem deletar suas próprias comunidades" ON communities;

-- Verificar e corrigir a coluna created_by
DO $$ 
BEGIN
    -- Remover a coluna created_by se existir (para recriar corretamente)
    IF EXISTS (SELECT 1 
        FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'communities' 
        AND column_name = 'created_by') 
    THEN
        ALTER TABLE public.communities DROP COLUMN created_by CASCADE;
    END IF;

    -- Adicionar a coluna created_by novamente com a configuração correta
    ALTER TABLE public.communities
    ADD COLUMN created_by uuid REFERENCES auth.users(id) ON DELETE CASCADE;
END $$;

-- Habilitar RLS
ALTER TABLE communities ENABLE ROW LEVEL SECURITY;

-- Criar novas políticas com nomes únicos
CREATE POLICY "communities_select_policy"
ON communities FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "communities_insert_policy"
ON communities FOR INSERT
TO authenticated
WITH CHECK (auth.uid()::text = created_by::text);

CREATE POLICY "communities_update_policy"
ON communities FOR UPDATE
TO authenticated
USING (auth.uid()::text = created_by::text)
WITH CHECK (auth.uid()::text = created_by::text);

CREATE POLICY "communities_delete_policy"
ON communities FOR DELETE
TO authenticated
USING (auth.uid()::text = created_by::text);
