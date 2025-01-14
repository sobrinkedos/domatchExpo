-- Habilita a extensão uuid-ossp para gerar UUIDs
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Enum para status de competição
CREATE TYPE competition_status AS ENUM ('pending', 'active', 'finished');

-- Enum para status de jogo
CREATE TYPE game_status AS ENUM ('pending', 'in_progress', 'finished');

-- Enum para tipo de partida
CREATE TYPE match_type AS ENUM ('simple', 'carroca', 'la_e_lo', 'cruzada', 'points');

-- Enum para papéis de usuário
CREATE TYPE user_role AS ENUM ('admin', 'organizer');
