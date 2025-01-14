-- Habilitar RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE communities ENABLE ROW LEVEL SECURITY;
ALTER TABLE players ENABLE ROW LEVEL SECURITY;
ALTER TABLE community_players ENABLE ROW LEVEL SECURITY;
ALTER TABLE competitions ENABLE ROW LEVEL SECURITY;
ALTER TABLE games ENABLE ROW LEVEL SECURITY;
ALTER TABLE matches ENABLE ROW LEVEL SECURITY;

-- Políticas para profiles
CREATE POLICY "Profiles são visíveis para todos os usuários autenticados"
    ON profiles FOR SELECT
    TO authenticated
    USING (true);

CREATE POLICY "Usuários podem atualizar seus próprios perfis"
    ON profiles FOR UPDATE
    TO authenticated
    USING (auth.uid() = id)
    WITH CHECK (auth.uid() = id);

-- Políticas para communities
CREATE POLICY "Communities são visíveis para todos os usuários autenticados"
    ON communities FOR SELECT
    TO authenticated
    USING (true);

CREATE POLICY "Apenas admins podem criar communities"
    ON communities FOR INSERT
    TO authenticated
    WITH CHECK (EXISTS (
        SELECT 1 FROM profiles
        WHERE id = auth.uid()
        AND 'admin' = ANY(roles)
    ));

CREATE POLICY "Apenas o admin da community pode atualizá-la"
    ON communities FOR UPDATE
    TO authenticated
    USING (admin_id = auth.uid())
    WITH CHECK (admin_id = auth.uid());

-- Políticas para players
CREATE POLICY "Players são visíveis para todos os usuários autenticados"
    ON players FOR SELECT
    TO authenticated
    USING (true);

CREATE POLICY "Admins e organizers podem criar players"
    ON players FOR INSERT
    TO authenticated
    WITH CHECK (EXISTS (
        SELECT 1 FROM profiles
        WHERE id = auth.uid()
        AND (roles && ARRAY['admin', 'organizer']::user_role[])
    ));

-- Políticas para community_players
CREATE POLICY "Community players são visíveis para todos os usuários autenticados"
    ON community_players FOR SELECT
    TO authenticated
    USING (true);

CREATE POLICY "Admins e organizers podem adicionar players à community"
    ON community_players FOR INSERT
    TO authenticated
    WITH CHECK (EXISTS (
        SELECT 1 FROM communities c
        JOIN profiles p ON p.id = auth.uid()
        WHERE c.id = community_id
        AND (c.admin_id = auth.uid() OR roles && ARRAY['organizer']::user_role[])
    ));

-- Políticas para competitions
CREATE POLICY "Competitions são visíveis para todos os usuários autenticados"
    ON competitions FOR SELECT
    TO authenticated
    USING (true);

CREATE POLICY "Admins e organizers podem criar e atualizar competitions"
    ON competitions FOR ALL
    TO authenticated
    USING (EXISTS (
        SELECT 1 FROM communities c
        JOIN profiles p ON p.id = auth.uid()
        WHERE c.id = community_id
        AND (c.admin_id = auth.uid() OR roles && ARRAY['organizer']::user_role[])
    ))
    WITH CHECK (EXISTS (
        SELECT 1 FROM communities c
        JOIN profiles p ON p.id = auth.uid()
        WHERE c.id = community_id
        AND (c.admin_id = auth.uid() OR roles && ARRAY['organizer']::user_role[])
    ));

-- Políticas para games e matches
CREATE POLICY "Games e matches são visíveis para todos os usuários autenticados"
    ON games FOR SELECT
    TO authenticated
    USING (true);

CREATE POLICY "Matches são visíveis para todos os usuários autenticados"
    ON matches FOR SELECT
    TO authenticated
    USING (true);

CREATE POLICY "Admins e organizers podem criar e atualizar games"
    ON games FOR ALL
    TO authenticated
    USING (EXISTS (
        SELECT 1 FROM competitions comp
        JOIN communities c ON c.id = comp.community_id
        JOIN profiles p ON p.id = auth.uid()
        WHERE comp.id = competition_id
        AND (c.admin_id = auth.uid() OR roles && ARRAY['organizer']::user_role[])
    ))
    WITH CHECK (EXISTS (
        SELECT 1 FROM competitions comp
        JOIN communities c ON c.id = comp.community_id
        JOIN profiles p ON p.id = auth.uid()
        WHERE comp.id = competition_id
        AND (c.admin_id = auth.uid() OR roles && ARRAY['organizer']::user_role[])
    ));

CREATE POLICY "Admins e organizers podem criar matches"
    ON matches FOR INSERT
    TO authenticated
    WITH CHECK (EXISTS (
        SELECT 1 FROM games g
        JOIN competitions comp ON comp.id = g.competition_id
        JOIN communities c ON c.id = comp.community_id
        JOIN profiles p ON p.id = auth.uid()
        WHERE g.id = game_id
        AND (c.admin_id = auth.uid() OR roles && ARRAY['organizer']::user_role[])
    ));
