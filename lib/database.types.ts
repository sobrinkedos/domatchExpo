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
          created_by: string
        }
        Insert: {
          id?: string
          name: string
          nickname?: string | null
          phone: string
          created_at?: string
          created_by: string
        }
        Update: {
          id?: string
          name?: string
          nickname?: string | null
          phone?: string
          created_at?: string
          created_by?: string
        }
        Relationships: [
          {
            foreignKeyName: "players_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      communities: {
        Row: {
          id: string
          name: string
          description: string | null
          location: string | null
          whatsapp_group_id: string | null
          created_at: string
          updated_at: string
          created_by: string
        }
        Insert: {
          id?: string
          name: string
          description?: string | null
          location?: string | null
          whatsapp_group_id?: string | null
          created_at?: string
          updated_at?: string
          created_by: string
        }
        Update: {
          id?: string
          name?: string
          description?: string | null
          location?: string | null
          whatsapp_group_id?: string | null
          created_at?: string
          updated_at?: string
          created_by?: string
        }
        Relationships: [
          {
            foreignKeyName: "communities_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      community_members: {
        Row: {
          id: string
          community_id: string
          player_id: string
          role: 'admin' | 'member'
          created_at: string
          created_by: string
        }
        Insert: {
          id?: string
          community_id: string
          player_id: string
          role: 'admin' | 'member'
          created_at?: string
          created_by: string
        }
        Update: {
          id?: string
          community_id?: string
          player_id?: string
          role?: 'admin' | 'member'
          created_at?: string
          created_by?: string
        }
        Relationships: [
          {
            foreignKeyName: "community_members_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
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
          created_by: string
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
          created_by: string
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
          created_by?: string
        }
        Relationships: [
          {
            foreignKeyName: "competitions_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
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
          created_by: string
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
          created_by: string
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
          created_by?: string
        }
        Relationships: [
          {
            foreignKeyName: "games_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      matches: {
        Row: {
          id: string
          game_id: string
          player1_score: number
          player2_score: number
          notes: string | null
          created_at: string
          created_by: string
        }
        Insert: {
          id?: string
          game_id: string
          player1_score: number
          player2_score: number
          notes?: string | null
          created_at?: string
          created_by: string
        }
        Update: {
          id?: string
          game_id?: string
          player1_score?: number
          player2_score?: number
          notes?: string | null
          created_at?: string
          created_by?: string
        }
        Relationships: [
          {
            foreignKeyName: "matches_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
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
