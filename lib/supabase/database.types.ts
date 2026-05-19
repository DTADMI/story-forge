export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string;
          name: string | null;
          username: string | null;
          bio: string | null;
          website: string | null;
          image: string | null;
          settings: Json | null;
          subscription_status: string | null;
          subscription_expires_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          name?: string | null;
          username?: string | null;
          bio?: string | null;
          website?: string | null;
          image?: string | null;
          settings?: Json | null;
          subscription_status?: string | null;
          subscription_expires_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string | null;
          username?: string | null;
          bio?: string | null;
          website?: string | null;
          image?: string | null;
          settings?: Json | null;
          subscription_status?: string | null;
          subscription_expires_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      projects: {
        Row: {
          id: string;
          user_id: string;
          title: string;
          description: string | null;
          content: string | null;
          genre: string | null;
          is_public: boolean;
          word_count: number;
          default_scope: string;
          panel_count: number;
          settings: Json | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          title: string;
          description?: string | null;
          content?: string | null;
          genre?: string | null;
          is_public?: boolean;
          word_count?: number;
          default_scope?: string;
          panel_count?: number;
          settings?: Json | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          title?: string;
          description?: string | null;
          content?: string | null;
          genre?: string | null;
          is_public?: boolean;
          word_count?: number;
          default_scope?: string;
          panel_count?: number;
          settings?: Json | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      characters: {
        Row: {
          id: string;
          user_id: string;
          project_id: string | null;
          name: string;
          bio: string | null;
          traits: string | null;
          quirks: string | null;
          image_url: string | null;
          metadata: Json | null;
          is_shared: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          project_id?: string | null;
          name: string;
          bio?: string | null;
          traits?: string | null;
          quirks?: string | null;
          image_url?: string | null;
          metadata?: Json | null;
          is_shared?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: Record<string, unknown>;
      };
      feature_flags: {
        Row: {
          id: string;
          name: string;
          description: string | null;
          type: string;
          enabled: boolean;
          value: Json;
          category: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          name: string;
          description?: string | null;
          type?: string;
          enabled?: boolean;
          value?: Json;
          category?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: Record<string, unknown>;
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
  };
}
