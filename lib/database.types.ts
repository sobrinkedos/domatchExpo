export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      players: {
        Row: {
          id: string
          name: string
          nickname: string | null
          phone: string
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          nickname?: string | null
          phone: string
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          nickname?: string | null
          phone?: string
          created_at?: string
        }
      }
      communities: {
        Row: {
          id: string
          name: string
          description: string | null
          location: string | null
          whatsapp_group_id: string | null
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          description?: string | null
          location?: string | null
          whatsapp_group_id?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          description?: string | null
          location?: string | null
          whatsapp_group_id?: string | null
          created_at?: string
        }
      }
      community_members: {
        Row: {
          id: string
          community_id: string
          player_id: string
          role: 'admin' | 'member'
          created_at: string
        }
        Insert: {
          id?: string
          community_id: string
          player_id: string
          role: 'admin' | 'member'
          created_at?: string
        }
        Update: {
          id?: string
          community_id?: string
          player_id?: string
          role?: 'admin' | 'member'
          created_at?: string
        }
      }
      competitions: {
        Row: {
          id: string
          name: string
          description: string | null
          start_date: string
          end_date: string | null
          status: 'draft' | 'in_progress' | 'finished'
          community_id: string
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          description?: string | null
          start_date: string
          end_date?: string | null
          status?: 'draft' | 'in_progress' | 'finished'
          community_id: string
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          description?: string | null
          start_date?: string
          end_date?: string | null
          status?: 'draft' | 'in_progress' | 'finished'
          community_id?: string
          created_at?: string
        }
      }
      games: {
        Row: {
          id: string
          competition_id: string
          player1_id: string
          player2_id: string
          player1_score: number | null
          player2_score: number | null
          status: 'scheduled' | 'in_progress' | 'finished'
          winner_id: string | null
          created_at: string
        }
        Insert: {
          id?: string
          competition_id: string
          player1_id: string
          player2_id: string
          player1_score?: number | null
          player2_score?: number | null
          status?: 'scheduled' | 'in_progress' | 'finished'
          winner_id?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          competition_id?: string
          player1_id?: string
          player2_id?: string
          player1_score?: number | null
          player2_score?: number | null
          status?: 'scheduled' | 'in_progress' | 'finished'
          winner_id?: string | null
          created_at?: string
        }
      }
      matches: {
        Row: {
          id: string
          game_id: string
          player1_score: number
          player2_score: number
          notes: string | null
          created_at: string
        }
        Insert: {
          id?: string
          game_id: string
          player1_score: number
          player2_score: number
          notes?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          game_id?: string
          player1_score?: number
          player2_score?: number
          notes?: string | null
          created_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
  }
}
