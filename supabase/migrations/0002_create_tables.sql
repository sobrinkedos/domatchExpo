-- Tabela de perfis de usuário (extends auth.users)
CREATE TABLE profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    nickname TEXT,
    phone TEXT NOT NULL UNIQUE,
    roles user_role[] NOT NULL DEFAULT '{}'::user_role[],
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    CONSTRAINT phone_format CHECK (phone ~ '^\+?[1-9]\d{1,14}$') -- Formato E.164
);

-- Tabela de comunidades
CREATE TABLE communities (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    admin_id UUID NOT NULL REFERENCES profiles(id) ON DELETE RESTRICT,
    whatsapp_group_id TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Tabela de jogadores
CREATE TABLE players (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    nickname TEXT,
    phone TEXT NOT NULL UNIQUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    CONSTRAINT phone_format CHECK (phone ~ '^\+?[1-9]\d{1,14}$') -- Formato E.164
);

-- Tabela de relação entre jogadores e comunidades
CREATE TABLE community_players (
    community_id UUID REFERENCES communities(id) ON DELETE CASCADE,
    player_id UUID REFERENCES players(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    PRIMARY KEY (community_id, player_id)
);

-- Tabela de competições
CREATE TABLE competitions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    community_id UUID NOT NULL REFERENCES communities(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    status competition_status NOT NULL DEFAULT 'pending',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    finished_at TIMESTAMP WITH TIME ZONE
);

-- Tabela de jogos
CREATE TABLE games (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    competition_id UUID NOT NULL REFERENCES competitions(id) ON DELETE CASCADE,
    player_a1_id UUID NOT NULL REFERENCES players(id),
    player_a2_id UUID NOT NULL REFERENCES players(id),
    player_b1_id UUID NOT NULL REFERENCES players(id),
    player_b2_id UUID NOT NULL REFERENCES players(id),
    status game_status NOT NULL DEFAULT 'pending',
    score_a INTEGER NOT NULL DEFAULT 0,
    score_b INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    finished_at TIMESTAMP WITH TIME ZONE,
    CONSTRAINT different_players CHECK (
        player_a1_id != player_a2_id AND
        player_a1_id != player_b1_id AND
        player_a1_id != player_b2_id AND
        player_a2_id != player_b1_id AND
        player_a2_id != player_b2_id AND
        player_b1_id != player_b2_id
    )
);

-- Tabela de partidas
CREATE TABLE matches (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    game_id UUID NOT NULL REFERENCES games(id) ON DELETE CASCADE,
    winner_team CHAR(1) NOT NULL CHECK (winner_team IN ('a', 'b')),
    points INTEGER NOT NULL CHECK (points BETWEEN 1 AND 4),
    type match_type NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);
