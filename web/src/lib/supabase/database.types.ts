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
    };
 |    Views: Record<string, never>;
 |    Functions: Record<string, never>;
 |    Enums: Record<string, never>;
  };
}
