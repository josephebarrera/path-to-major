export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type Database = {
  __InternalSupabase: {
    PostgrestVersion: "14.5";
  };
  public: {
    Tables: {
      activities: {
        Row: {
          ai_analyzed_at: string | null;
          ai_related: string[];
          ai_relevance: string | null;
          ai_relevance_score: number | null;
          ai_skills: string[];
          ai_suggestions: string[];
          ai_summary: string | null;
          category: string;
          created_at: string;
          description: string | null;
          end_date: string | null;
          end_grade: number | null;
          id: string;
          is_summer: boolean;
          leadership_role: string | null;
          name: string;
          organization: string | null;
          skills: string[];
          start_date: string | null;
          start_grade: number | null;
          started_before_hs: boolean;
          time_commitment: string | null;
          tracks_hours: boolean;
          updated_at: string;
          user_id: string;
        };
        Insert: {
          ai_analyzed_at?: string | null;
          ai_related?: string[];
          ai_relevance?: string | null;
          ai_relevance_score?: number | null;
          ai_skills?: string[];
          ai_suggestions?: string[];
          ai_summary?: string | null;
          category: string;
          created_at?: string;
          description?: string | null;
          end_date?: string | null;
          end_grade?: number | null;
          id?: string;
          is_summer?: boolean;
          leadership_role?: string | null;
          name: string;
          organization?: string | null;
          skills?: string[];
          start_date?: string | null;
          start_grade?: number | null;
          started_before_hs?: boolean;
          time_commitment?: string | null;
          tracks_hours?: boolean;
          updated_at?: string;
          user_id: string;
        };
        Update: {
          ai_analyzed_at?: string | null;
          ai_related?: string[];
          ai_relevance?: string | null;
          ai_relevance_score?: number | null;
          ai_skills?: string[];
          ai_suggestions?: string[];
          ai_summary?: string | null;
          category?: string;
          created_at?: string;
          description?: string | null;
          end_date?: string | null;
          end_grade?: number | null;
          id?: string;
          is_summer?: boolean;
          leadership_role?: string | null;
          name?: string;
          organization?: string | null;
          skills?: string[];
          start_date?: string | null;
          start_grade?: number | null;
          started_before_hs?: boolean;
          time_commitment?: string | null;
          tracks_hours?: boolean;
          updated_at?: string;
          user_id?: string;
        };
        Relationships: [];
      };
      hour_logs: {
        Row: {
          activity_id: string;
          created_at: string;
          hours: number;
          id: string;
          log_date: string;
          note: string | null;
          user_id: string;
        };
        Insert: {
          activity_id: string;
          created_at?: string;
          hours: number;
          id?: string;
          log_date?: string;
          note?: string | null;
          user_id: string;
        };
        Update: {
          activity_id?: string;
          created_at?: string;
          hours?: number;
          id?: string;
          log_date?: string;
          note?: string | null;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "hour_logs_activity_id_fkey";
            columns: ["activity_id"];
            isOneToOne: false;
            referencedRelation: "activities";
            referencedColumns: ["id"];
          },
        ];
      };
      profiles: {
        Row: {
          created_at: string;
          display_name: string | null;
          email: string | null;
          exploring: boolean;
          grade_level: number | null;
          id: string;
          intended_majors: string[];
          is_admin: boolean;
          onboarded: boolean;
          updated_at: string;
        };
        Insert: {
          created_at?: string;
          display_name?: string | null;
          email?: string | null;
          exploring?: boolean;
          grade_level?: number | null;
          id: string;
          intended_majors?: string[];
          is_admin?: boolean;
          onboarded?: boolean;
          updated_at?: string;
        };
        Update: {
          created_at?: string;
          display_name?: string | null;
          email?: string | null;
          exploring?: boolean;
          grade_level?: number | null;
          id?: string;
          intended_majors?: string[];
          is_admin?: boolean;
          onboarded?: boolean;
          updated_at?: string;
        };
        Relationships: [];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      [_ in never]: never;
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
};

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">;

type DefaultSchema = DatabaseWithoutInternals[Extract<
  keyof Database,
  "public"
>];

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R;
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R;
      }
      ? R
      : never
    : never;

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I;
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I;
      }
      ? I
      : never
    : never;

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U;
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U;
      }
      ? U
      : never
    : never;

export const Constants = {
  public: {
    Enums: {},
  },
} as const;
