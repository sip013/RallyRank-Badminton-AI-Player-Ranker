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
          revoked_at: string | null
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
          revoked_at?: string | null
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
          revoked_at?: string | null
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
      club_sessions: {
        Row: {
          id: string
          club_id: string
          opened_by: string | null
          court_count: number
          status: string
          attendee_ids: string[]
          team_a_ids: string[]
          team_b_ids: string[]
          courts: Json
          created_at: string
          updated_at: string
          closed_at: string | null
        }
        Insert: {
          id?: string
          club_id: string
          opened_by?: string | null
          court_count?: number
          status?: string
          attendee_ids?: string[]
          team_a_ids?: string[]
          team_b_ids?: string[]
          courts?: Json
          created_at?: string
          updated_at?: string
          closed_at?: string | null
        }
        Update: {
          id?: string
          club_id?: string
          opened_by?: string | null
          court_count?: number
          status?: string
          attendee_ids?: string[]
          team_a_ids?: string[]
          team_b_ids?: string[]
          courts?: Json
          created_at?: string
          updated_at?: string
          closed_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "club_sessions_club_id_fkey"
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
          rating_format: string
          streak_before: number | null
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
          rating_format?: string
          streak_before?: number | null
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
          rating_format?: string
          streak_before?: number | null
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
          session_id: string | null
          session_note: string | null
          is_disputed: boolean
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
          session_id?: string | null
          session_note?: string | null
          is_disputed?: boolean
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
          session_id?: string | null
          session_note?: string | null
          is_disputed?: boolean
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
          doubles_rating: number
          doubles_matches_played: number
          doubles_wins: number
          doubles_streak_count: number
          streak_count: number | null
          updated_at: string | null
          user_id: string | null
          win_rate: number | null
          wins: number
          is_guest: boolean
          archived_at: string | null
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
          doubles_rating?: number
          doubles_matches_played?: number
          doubles_wins?: number
          doubles_streak_count?: number
          streak_count?: number | null
          updated_at?: string | null
          user_id?: string | null
          win_rate?: number | null
          wins?: number
          is_guest?: boolean
          archived_at?: string | null
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
          doubles_rating?: number
          doubles_matches_played?: number
          doubles_wins?: number
          doubles_streak_count?: number
          streak_count?: number | null
          updated_at?: string | null
          user_id?: string | null
          win_rate?: number | null
          wins?: number
          is_guest?: boolean
          archived_at?: string | null
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
      pair_ratings: {
        Row: {
          id: string
          club_id: string
          player_low_id: string
          player_high_id: string
          rating: number
          matches_played: number
          wins: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          club_id: string
          player_low_id: string
          player_high_id: string
          rating?: number
          matches_played?: number
          wins?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          club_id?: string
          player_low_id?: string
          player_high_id?: string
          rating?: number
          matches_played?: number
          wins?: number
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "pair_ratings_club_id_fkey"
            columns: ["club_id"]
            isOneToOne: false
            referencedRelation: "clubs"
            referencedColumns: ["id"]
          }
        ]
      }
      pair_match_history: {
        Row: {
          id: string
          match_id: string
          pair_id: string
          club_id: string
          rating_before: number
          rating_after: number
          rating_change: number
          is_winner: boolean
          created_at: string
        }
        Insert: {
          id?: string
          match_id: string
          pair_id: string
          club_id: string
          rating_before: number
          rating_after: number
          rating_change: number
          is_winner: boolean
          created_at?: string
        }
        Update: {
          id?: string
          match_id?: string
          pair_id?: string
          club_id?: string
          rating_before?: number
          rating_after?: number
          rating_change?: number
          is_winner?: boolean
          created_at?: string
        }
        Relationships: []
      }
      session_templates: {
        Row: {
          id: string
          club_id: string
          name: string
          court_count: number
          weekday: number | null
          created_by: string | null
          created_at: string
        }
        Insert: {
          id?: string
          club_id: string
          name: string
          court_count?: number
          weekday?: number | null
          created_by?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          club_id?: string
          name?: string
          court_count?: number
          weekday?: number | null
          created_by?: string | null
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "session_templates_club_id_fkey"
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
        Args: { p_club_id: string; p_name: string; p_hard_reset?: boolean }
        Returns: Database["public"]["Tables"]["seasons"]["Row"]
      }
      club_average_rating: {
        Args: { p_club_id: string }
        Returns: number
      }
      club_average_doubles_rating: {
        Args: { p_club_id: string }
        Returns: number
      }
      ensure_pair_rating: {
        Args: { p_club_id: string; p_player_a: string; p_player_b: string }
        Returns: Database["public"]["Tables"]["pair_ratings"]["Row"]
      }
      create_player: {
        Args: {
          p_club_id: string
          p_name: string
          p_age?: number | null
          p_is_guest?: boolean
        }
        Returns: Database["public"]["Tables"]["players"]["Row"]
      }
      update_player_profile: {
        Args: {
          p_player_id: string
          p_name: string
          p_age?: number | null
        }
        Returns: Database["public"]["Tables"]["players"]["Row"]
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
          p_session_id?: string
          p_session_note?: string
          p_is_disputed?: boolean
        }
        Returns: Json
      }
      set_match_disputed: {
        Args: { p_match_id: string; p_disputed: boolean }
        Returns: Database["public"]["Tables"]["matches"]["Row"]
      }
      transfer_ownership: {
        Args: { p_club_id: string; p_new_owner_id: string }
        Returns: Database["public"]["Tables"]["memberships"]["Row"]
      }
      revoke_invite: {
        Args: { p_invite_id: string }
        Returns: Database["public"]["Tables"]["invites"]["Row"]
      }
      archive_player: {
        Args: { p_player_id: string }
        Returns: Database["public"]["Tables"]["players"]["Row"]
      }
      promote_guest: {
        Args: { p_player_id: string }
        Returns: Database["public"]["Tables"]["players"]["Row"]
      }
      rename_club: {
        Args: { p_club_id: string; p_name: string }
        Returns: Database["public"]["Tables"]["clubs"]["Row"]
      }
      undo_match: {
        Args: { p_match_id: string }
        Returns: Json
      }
      leave_club: {
        Args: { p_club_id: string }
        Returns: undefined
      }
      remove_member: {
        Args: { p_club_id: string; p_user_id: string }
        Returns: undefined
      }
      update_member_role: {
        Args: { p_club_id: string; p_user_id: string; p_role: string }
        Returns: Database["public"]["Tables"]["memberships"]["Row"]
      }
      rotate_share_token: {
        Args: { p_club_id: string }
        Returns: Database["public"]["Tables"]["clubs"]["Row"]
      }
      link_player_to_user: {
        Args: { p_player_id: string }
        Returns: Database["public"]["Tables"]["players"]["Row"]
      }
      unlink_player: {
        Args: { p_player_id: string }
        Returns: Database["public"]["Tables"]["players"]["Row"]
      }
      get_or_open_session: {
        Args: { p_club_id: string }
        Returns: Database["public"]["Tables"]["club_sessions"]["Row"]
      }
      save_session_state: {
        Args: {
          p_session_id: string
          p_attendee_ids: string[]
          p_team_a_ids: string[]
          p_team_b_ids: string[]
          p_court_count?: number
          p_courts?: Json
        }
        Returns: Database["public"]["Tables"]["club_sessions"]["Row"]
      }
      close_session: {
        Args: { p_session_id: string }
        Returns: Database["public"]["Tables"]["club_sessions"]["Row"]
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
export type SessionTemplate = Tables<"session_templates">
export type ClubRole = "owner" | "admin" | "coach"
