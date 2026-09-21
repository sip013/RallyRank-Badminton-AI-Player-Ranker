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
      clubs: {
        Row: {
          id: string
          name: string
          slug: string | null
          share_token: string | null
          created_by: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          slug?: string | null
          share_token?: string | null
          created_by?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          slug?: string | null
          share_token?: string | null
          created_by?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      memberships: {
        Row: {
          id: string
          club_id: string
          user_id: string
          role: string
          created_at: string
        }
        Insert: {
          id?: string
          club_id: string
          user_id: string
          role: string
          created_at?: string
        }
        Update: {
          id?: string
          club_id?: string
          user_id?: string
          role?: string
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "memberships_club_id_fkey"
            columns: ["club_id"]
            isOneToOne: false
            referencedRelation: "clubs"
            referencedColumns: ["id"]
          }
        ]
      }
      invites: {
        Row: {
          id: string
          club_id: string
          code: string
          role: string
          expires_at: string | null
          created_by: string | null
          used_by: string | null
          used_at: string | null
          created_at: string
        }
        Insert: {
          id?: string
          club_id: string
          code?: string
          role?: string
          expires_at?: string | null
          created_by?: string | null
          used_by?: string | null
          used_at?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          club_id?: string
          code?: string
          role?: string
          expires_at?: string | null
          created_by?: string | null
          used_by?: string | null
          used_at?: string | null
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "invites_club_id_fkey"
            columns: ["club_id"]
            isOneToOne: false
            referencedRelation: "clubs"
            referencedColumns: ["id"]
          }
        ]
      }
      seasons: {
        Row: {
          id: string
          club_id: string
          name: string
          starts_at: string
          ends_at: string | null
          is_active: boolean
          created_at: string
        }
        Insert: {
          id?: string
          club_id: string
          name: string
          starts_at?: string
          ends_at?: string | null
          is_active?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          club_id?: string
          name?: string
          starts_at?: string
          ends_at?: string | null
          is_active?: boolean
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "seasons_club_id_fkey"
            columns: ["club_id"]
            isOneToOne: false
            referencedRelation: "clubs"
            referencedColumns: ["id"]
          }
        ]
      }
      match_history: {
        Row: {
          created_at: string
          date: string
          id: string
          is_winner: boolean
          match_id: string
          player_id: string | null
          club_id: string | null
          rating_after: number
          rating_before: number
          rating_change: number
          score_difference: number
        }
        Insert: {
          created_at?: string
          date: string
          id?: string
          is_winner: boolean
          match_id: string
          player_id?: string | null
          club_id?: string | null
          rating_after: number
          rating_before: number
          rating_change: number
          score_difference: number
        }
        Update: {
          created_at?: string
          date?: string
          id?: string
          is_winner?: boolean
          match_id?: string
          player_id?: string | null
          club_id?: string | null
          rating_after?: number
          rating_before?: number
          rating_change?: number
          score_difference?: number
        }
        Relationships: [
          {
            foreignKeyName: "match_history_match_id_fkey"
            columns: ["match_id"]
            isOneToOne: false
            referencedRelation: "matches"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "match_history_player_id_fkey"
            columns: ["player_id"]
            isOneToOne: false
            referencedRelation: "players"
            referencedColumns: ["id"]
          }
        ]
      }
      matches: {
        Row: {
          created_at: string
          duration_minutes: number
          id: string
          club_id: string | null
          season_id: string | null
          session_note: string | null
          team1_player1_id: string
          team1_player2_id: string | null
          team1_score: number
          team2_player1_id: string
          team2_player2_id: string | null
          team2_score: number
          updated_at: string
          user_id: string
          winner: string
        }
        Insert: {
          created_at?: string
          duration_minutes?: number
          id?: string
          club_id?: string | null
          season_id?: string | null
          session_note?: string | null
          team1_player1_id: string
          team1_player2_id?: string | null
          team1_score: number
          team2_player1_id: string
          team2_player2_id?: string | null
          team2_score: number
          updated_at?: string
          user_id: string
          winner: string
        }
        Update: {
          created_at?: string
          duration_minutes?: number
          id?: string
          club_id?: string | null
          season_id?: string | null
          session_note?: string | null
          team1_player1_id?: string
          team1_player2_id?: string | null
          team1_score?: number
          team2_player1_id?: string
          team2_player2_id?: string | null
          team2_score?: number
          updated_at?: string
          user_id?: string
          winner?: string
        }
        Relationships: [
          {
            foreignKeyName: "matches_club_id_fkey"
            columns: ["club_id"]
            isOneToOne: false
            referencedRelation: "clubs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "matches_team1_player1_id_fkey"
            columns: ["team1_player1_id"]
            isOneToOne: false
            referencedRelation: "players"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "matches_team1_player2_id_fkey"
            columns: ["team1_player2_id"]
            isOneToOne: false
            referencedRelation: "players"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "matches_team2_player1_id_fkey"
            columns: ["team2_player1_id"]
            isOneToOne: false
            referencedRelation: "players"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "matches_team2_player2_id_fkey"
            columns: ["team2_player2_id"]
            isOneToOne: false
            referencedRelation: "players"
            referencedColumns: ["id"]
          }
        ]
      }
      players: {
        Row: {
          age: number | null
          created_at: string | null
          id: string
          club_id: string | null
          season_id: string | null
          last_played_at: string | null
          matches_played: number
          name: string
          position: string | null
          rating: number
          streak_count: number | null
          updated_at: string | null
          user_id: string | null
          win_rate: number | null
          wins: number
        }
        Insert: {
          age?: number | null
          created_at?: string | null
          id?: string
          club_id?: string | null
          season_id?: string | null
          last_played_at?: string | null
          matches_played?: number
          name: string
          position?: string | null
          rating?: number
          streak_count?: number | null
          updated_at?: string | null
          user_id?: string | null
          win_rate?: number | null
          wins?: number
        }
        Update: {
          age?: number | null
          created_at?: string | null
          id?: string
          club_id?: string | null
          season_id?: string | null
          last_played_at?: string | null
          matches_played?: number
          name?: string
          position?: string | null
          rating?: number
          streak_count?: number | null
          updated_at?: string | null
          user_id?: string | null
          win_rate?: number | null
          wins?: number
        }
        Relationships: [
          {
            foreignKeyName: "players_club_id_fkey"
            columns: ["club_id"]
            isOneToOne: false
            referencedRelation: "clubs"
            referencedColumns: ["id"]
          }
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          id: string
          updated_at: string
          username: string | null
          first_name: string | null
          last_name: string | null
          phone: string | null
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          id: string
          updated_at?: string
          username?: string | null
          first_name?: string | null
          last_name?: string | null
          phone?: string | null
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          id?: string
          updated_at?: string
          username?: string | null
          first_name?: string | null
          last_name?: string | null
          phone?: string | null
        }
        Relationships: []
      }
    }
    Functions: {
      create_club: {
        Args: { p_name: string }
        Returns: Database["public"]["Tables"]["clubs"]["Row"]
      }
      join_club_with_code: {
        Args: { p_code: string }
        Returns: Database["public"]["Tables"]["clubs"]["Row"]
      }
      create_invite: {
        Args: { p_club_id: string; p_role?: string }
        Returns: Database["public"]["Tables"]["invites"]["Row"]
      }
      start_season: {
        Args: { p_club_id: string; p_name: string }
        Returns: Database["public"]["Tables"]["seasons"]["Row"]
      }
      log_match: {
        Args: {
          p_club_id: string
          p_team1_player1_id: string
          p_team1_player2_id: string | null
          p_team2_player1_id: string
          p_team2_player2_id: string | null
          p_team1_score: number
          p_team2_score: number
          p_played_at?: string
        }
        Returns: Json
      }
      get_public_ladder: {
        Args: { p_share_token: string }
        Returns: Json
      }
      is_club_member: {
        Args: { p_club_id: string }
        Returns: boolean
      }
      club_role: {
        Args: { p_club_id: string }
        Returns: string
      }
    }
    Views: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

export type Tables<T extends keyof Database["public"]["Tables"]> =
  Database["public"]["Tables"][T]["Row"]

export type Player = Tables<"players">
export type Match = Tables<"matches">
export type Club = Tables<"clubs">
export type Membership = Tables<"memberships">
export type Season = Tables<"seasons">
export type Invite = Tables<"invites">
export type ClubRole = "owner" | "admin" | "coach"
