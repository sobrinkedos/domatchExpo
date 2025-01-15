# DoMatch App

Aplicativo para gerenciamento de jogos de dominó, incluindo jogadores, comunidades, competições e partidas.

## Funcionalidades

- Cadastro de jogadores
- Criação e gerenciamento de comunidades
- Organização de competições
- Registro de jogos e partidas
- Acompanhamento de estatísticas
- Sistema de ranking

## Pré-requisitos

1. Node.js 18 ou superior
2. Docker Desktop
3. Supabase CLI
4. Expo CLI

## Configuração do Ambiente

1. Instale o Docker Desktop:
   - Baixe em https://www.docker.com/products/docker-desktop
   - Instale e inicie o Docker Desktop

2. Clone o repositório:
   ```bash
   git clone [URL_DO_REPOSITORIO]
   cd DomatchApp
   ```

3. Instale as dependências:
   ```bash
   npm install
   ```

4. Configure o Supabase localmente:
   ```bash
   npx supabase init
   npx supabase start
   ```

5. Copie as variáveis de ambiente:
   ```bash
   cp .env.example .env
   ```
   Preencha as variáveis no arquivo `.env` com os valores fornecidos pelo Supabase.

6. Inicie o aplicativo:
   ```bash
   npx expo start
   ```

## Estrutura do Banco de Dados

### Tabelas

1. **players** - Jogadores
   - id (UUID)
   - name (TEXT)
   - nickname (TEXT)
   - phone (TEXT)
   - created_at (TIMESTAMP)
   - created_by (UUID)

2. **communities** - Comunidades
   - id (UUID)
   - name (TEXT)
   - description (TEXT)
   - location (TEXT)
   - created_at (TIMESTAMP)
   - created_by (UUID)

3. **community_members** - Membros das comunidades
   - id (UUID)
   - community_id (UUID)
   - player_id (UUID)
   - role (TEXT) - 'admin' ou 'member'
   - created_at (TIMESTAMP)

4. **competitions** - Competições
   - id (UUID)
   - name (TEXT)
   - description (TEXT)
   - start_date (DATE)
   - end_date (DATE)
   - status (TEXT) - 'draft', 'in_progress' ou 'finished'
   - community_id (UUID)
   - created_at (TIMESTAMP)
   - created_by (UUID)

5. **games** - Jogos
   - id (UUID)
   - competition_id (UUID)
   - player1_id (UUID)
   - player2_id (UUID)
   - player1_score (INTEGER)
   - player2_score (INTEGER)
   - status (TEXT) - 'scheduled', 'in_progress' ou 'finished'
   - winner_id (UUID)
   - created_at (TIMESTAMP)

6. **matches** - Partidas dentro de um jogo
   - id (UUID)
   - game_id (UUID)
   - player1_score (INTEGER)
   - player2_score (INTEGER)
   - notes (TEXT)
   - created_at (TIMESTAMP)

## Fluxo do Usuário

1. Cadastro e Login
   - Usuário se registra/faz login usando email e senha

2. Jogadores
   - Cadastra jogadores com nome, apelido e telefone
   - Visualiza lista de jogadores cadastrados
   - Pode editar ou excluir jogadores

3. Comunidades
   - Cria uma comunidade
   - Adiciona jogadores à comunidade
   - Define administradores da comunidade

4. Competições
   - Cria uma competição dentro de uma comunidade
   - Define data de início e término
   - Adiciona jogadores da comunidade

5. Jogos
   - Cria jogos entre dois jogadores
   - Registra partidas dentro do jogo
   - Acompanha placar e define vencedor

## Contribuição

1. Faça um fork do projeto
2. Crie uma branch para sua feature (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

## Licença

Este projeto está licenciado sob a licença MIT - veja o arquivo [LICENSE.md](LICENSE.md) para detalhes.
