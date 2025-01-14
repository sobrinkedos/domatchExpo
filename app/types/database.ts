export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          name: string
          nickname: string | null
          phone: string
          roles: UserRole[]
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          name: string
          nickname?: string | null
          phone: string
          roles?: UserRole[]
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          nickname?: string | null
          phone?: string
          roles?: UserRole[]
          created_at?: string
          updated_at?: string
        }
      }
      communities: {
        Row: {
          id: string
          name: string
          admin_id: string
          whatsapp_group_id: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          admin_id: string
          whatsapp_group_id?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          admin_id?: string
          whatsapp_group_id?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      players: {
        Row: {
          id: string
          name: string
          nickname: string | null
          phone: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          nickname?: string | null
          phone: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          nickname?: string | null
          phone?: string
          created_at?: string
          updated_at?: string
        }
      }
      community_players: {
        Row: {
          community_id: string
          player_id: string
          created_at: string
        }
        Insert: {
          community_id: string
          player_id: string
          created_at?: string
        }
        Update: {
          community_id?: string
          player_id?: string
          created_at?: string
        }
      }
      competitions: {
        Row: {
          id: string
          community_id: string
          name: string
          status: CompetitionStatus
          created_at: string
          updated_at: string
          finished_at: string | null
        }
        Insert: {
          id?: string
          community_id: string
          name: string
          status?: CompetitionStatus
          created_at?: string
          updated_at?: string
          finished_at?: string | null
        }
        Update: {
          id?: string
          community_id?: string
          name?: string
          status?: CompetitionStatus
          created_at?: string
          updated_at?: string
          finished_at?: string | null
        }
      }
      games: {
        Row: {
          id: string
          competition_id: string
          player_a1_id: string
          player_a2_id: string
          player_b1_id: string
          player_b2_id: string
          status: GameStatus
          score_a: number
          score_b: number
          created_at: string
          updated_at: string
          finished_at: string | null
        }
        Insert: {
          id?: string
          competition_id: string
          player_a1_id: string
          player_a2_id: string
          player_b1_id: string
          player_b2_id: string
          status?: GameStatus
          score_a?: number
          score_b?: number
          created_at?: string
          updated_at?: string
          finished_at?: string | null
        }
        Update: {
          id?: string
          competition_id?: string
          player_a1_id?: string
          player_a2_id?: string
          player_b1_id?: string
          player_b2_id?: string
          status?: GameStatus
          score_a?: number
          score_b?: number
          created_at?: string
          updated_at?: string
          finished_at?: string | null
        }
      }
      matches: {
        Row: {
          id: string
          game_id: string
          winner_team: 'a' | 'b'
          points: number
          type: MatchType
          created_at: string
        }
        Insert: {
          id?: string
          game_id: string
          winner_team: 'a' | 'b'
          points: number
          type: MatchType
          created_at?: string
        }
        Update: {
          id?: string
          game_id?: string
          winner_team?: 'a' | 'b'
          points?: number
          type?: MatchType
          created_at?: string
        }
      }
    }
    Enums: {
      competition_status: CompetitionStatus
      game_status: GameStatus
      match_type: MatchType
      user_role: UserRole
    }
  }
}

export type CompetitionStatus = 'pending' | 'active' | 'finished'
export type GameStatus = 'pending' | 'in_progress' | 'finished'
export type MatchType = 'simple' | 'carroca' | 'la_e_lo' | 'cruzada' | 'points'
export type UserRole = 'admin' | 'organizer'

// Helpers
export type Tables<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Row']
export type Enums<T extends keyof Database['public']['Enums']> = Database['public']['Enums'][T]
export type TablesInsert<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Insert']
export type TablesUpdate<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Update']
