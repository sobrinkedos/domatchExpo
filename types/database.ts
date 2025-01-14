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
      profiles: {
        Row: {
          id: string
          name: string
          nickname: string | null
          phone: string
          roles: string[]
          created_at: string
          updated_at: string | null
        }
        Insert: {
          id: string
          name: string
          nickname?: string | null
          phone: string
          roles?: string[]
          created_at?: string
          updated_at?: string | null
        }
        Update: {
          id?: string
          name?: string
          nickname?: string | null
          phone?: string
          roles?: string[]
          created_at?: string
          updated_at?: string | null
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

export type Tables<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Row']
export type TablesInsert<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Insert']
export type TablesUpdate<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Update']
