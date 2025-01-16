-- Adiciona a coluna created_by à tabela communities
ALTER TABLE public.communities
ADD COLUMN created_by uuid REFERENCES auth.users(id) ON DELETE CASCADE;

-- Atualiza as políticas para incluir o created_by
DROP POLICY IF EXISTS "Usuários autenticados podem ver todas as comunidades" ON public.communities;
CREATE POLICY "Usuários autenticados podem ver todas as comunidades"
ON public.communities
FOR SELECT
TO authenticated
USING (true);

DROP POLICY IF EXISTS "Usuários autenticados podem criar comunidades" ON public.communities;
CREATE POLICY "Usuários autenticados podem criar comunidades"
ON public.communities
FOR INSERT
TO authenticated
WITH CHECK (true);

DROP POLICY IF EXISTS "Usuários podem atualizar suas próprias comunidades" ON public.communities;
CREATE POLICY "Usuários podem atualizar suas próprias comunidades"
ON public.communities
FOR UPDATE
TO authenticated
USING (auth.uid() = created_by)
WITH CHECK (auth.uid() = created_by);

DROP POLICY IF EXISTS "Usuários podem deletar suas próprias comunidades" ON public.communities;
CREATE POLICY "Usuários podem deletar suas próprias comunidades"
ON public.communities
FOR DELETE
TO authenticated
USING (auth.uid() = created_by);
