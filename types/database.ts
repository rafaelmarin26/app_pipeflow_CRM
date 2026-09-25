/**
 * Hand-written stand-in for the generated Supabase types.
 *
 * The M10 migrations (`supabase/migrations/2026*_*.sql`) now define this
 * schema for real, but generating this file still requires running
 * `supabase gen types typescript` against a live database — either the
 * local stack (`npx supabase start`, needs Docker) or the linked remote
 * project (needs `supabase login` / `SUPABASE_ACCESS_TOKEN`), neither of
 * which is available in this environment. This file was updated by hand to
 * match the migrations exactly (columns, relationships, functions); replace
 * it wholesale once you can run the real command:
 *
 *   npx supabase gen types typescript --local > types/database.ts
 *
 * Every consumer goes through the `Tables<>` / `Enums<>` helpers at the bottom,
 * never through the `Database` tree directly — that keeps the swap invisible.
 */

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type Database = {
  public: {
    Tables: {
      workspaces: {
        Row: {
          id: string;
          name: string;
          slug: string;
          owner_id: string;
          plan: Database["public"]["Enums"]["plan"];
          created_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          slug: string;
          owner_id: string;
          plan?: Database["public"]["Enums"]["plan"];
          created_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          slug?: string;
          owner_id?: string;
          plan?: Database["public"]["Enums"]["plan"];
          created_at?: string;
        };
        Relationships: [];
      };
      workspace_members: {
        Row: {
          workspace_id: string;
          user_id: string;
          role: Database["public"]["Enums"]["member_role"];
          created_at: string;
        };
        Insert: {
          workspace_id: string;
          user_id: string;
          role?: Database["public"]["Enums"]["member_role"];
          created_at?: string;
        };
        Update: {
          workspace_id?: string;
          user_id?: string;
          role?: Database["public"]["Enums"]["member_role"];
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "workspace_members_workspace_id_fkey";
            columns: ["workspace_id"];
            isOneToOne: false;
            referencedRelation: "workspaces";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "workspace_members_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      invites: {
        Row: {
          id: string;
          workspace_id: string;
          email: string;
          role: Database["public"]["Enums"]["member_role"];
          token: string;
          expires_at: string;
          accepted_at: string | null;
          created_at: string;
          invited_by: string | null;
        };
        Insert: {
          id?: string;
          workspace_id: string;
          email: string;
          role?: Database["public"]["Enums"]["member_role"];
          token?: string;
          expires_at: string;
          accepted_at?: string | null;
          created_at?: string;
          invited_by?: string | null;
        };
        Update: {
          id?: string;
          workspace_id?: string;
          email?: string;
          role?: Database["public"]["Enums"]["member_role"];
          token?: string;
          expires_at?: string;
          accepted_at?: string | null;
          created_at?: string;
          invited_by?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "invites_workspace_id_fkey";
            columns: ["workspace_id"];
            isOneToOne: false;
            referencedRelation: "workspaces";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "invites_invited_by_fkey";
            columns: ["invited_by"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      profiles: {
        Row: {
          id: string;
          name: string;
          email: string;
          avatar_url: string | null;
          updated_at: string;
        };
        Insert: {
          id: string;
          name: string;
          email: string;
          avatar_url?: string | null;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          email?: string;
          avatar_url?: string | null;
          updated_at?: string;
        };
        Relationships: [];
      };
      leads: {
        Row: {
          id: string;
          workspace_id: string;
          name: string;
          email: string | null;
          phone: string | null;
          company: string | null;
          job_title: string | null;
          status: Database["public"]["Enums"]["lead_status"];
          owner_id: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          workspace_id: string;
          name: string;
          email?: string | null;
          phone?: string | null;
          company?: string | null;
          job_title?: string | null;
          status?: Database["public"]["Enums"]["lead_status"];
          owner_id?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          workspace_id?: string;
          name?: string;
          email?: string | null;
          phone?: string | null;
          company?: string | null;
          job_title?: string | null;
          status?: Database["public"]["Enums"]["lead_status"];
          owner_id?: string | null;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "leads_workspace_id_fkey";
            columns: ["workspace_id"];
            isOneToOne: false;
            referencedRelation: "workspaces";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "leads_owner_id_fkey";
            columns: ["owner_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      deals: {
        Row: {
          id: string;
          workspace_id: string;
          lead_id: string | null;
          title: string;
          /** Integer cents. Never a float — CLAUDE.md §4. */
          value_cents: number;
          stage: Database["public"]["Enums"]["deal_stage"];
          /** Fractional rank, so a card can be inserted between two others. */
          position: number;
          owner_id: string | null;
          due_date: string | null;
          closed_at: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          workspace_id: string;
          lead_id?: string | null;
          title: string;
          value_cents?: number;
          stage?: Database["public"]["Enums"]["deal_stage"];
          position?: number;
          owner_id?: string | null;
          due_date?: string | null;
          closed_at?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          workspace_id?: string;
          lead_id?: string | null;
          title?: string;
          value_cents?: number;
          stage?: Database["public"]["Enums"]["deal_stage"];
          position?: number;
          owner_id?: string | null;
          due_date?: string | null;
          closed_at?: string | null;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "deals_workspace_id_fkey";
            columns: ["workspace_id"];
            isOneToOne: false;
            referencedRelation: "workspaces";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "deals_lead_id_fkey";
            columns: ["lead_id"];
            isOneToOne: false;
            referencedRelation: "leads";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "deals_owner_id_fkey";
            columns: ["owner_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      activities: {
        Row: {
          id: string;
          workspace_id: string;
          lead_id: string | null;
          deal_id: string | null;
          author_id: string | null;
          type: Database["public"]["Enums"]["activity_type"];
          description: string;
          occurred_at: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          workspace_id: string;
          lead_id?: string | null;
          deal_id?: string | null;
          author_id?: string | null;
          type: Database["public"]["Enums"]["activity_type"];
          description: string;
          occurred_at?: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          workspace_id?: string;
          lead_id?: string | null;
          deal_id?: string | null;
          author_id?: string | null;
          type?: Database["public"]["Enums"]["activity_type"];
          description?: string;
          occurred_at?: string;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "activities_workspace_id_fkey";
            columns: ["workspace_id"];
            isOneToOne: false;
            referencedRelation: "workspaces";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "activities_lead_id_fkey";
            columns: ["lead_id"];
            isOneToOne: false;
            referencedRelation: "leads";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "activities_deal_id_fkey";
            columns: ["deal_id"];
            isOneToOne: false;
            referencedRelation: "deals";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "activities_author_id_fkey";
            columns: ["author_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      subscriptions: {
        Row: {
          workspace_id: string;
          stripe_customer_id: string | null;
          stripe_subscription_id: string | null;
          status: string | null;
          current_period_end: string | null;
        };
        Insert: {
          workspace_id: string;
          stripe_customer_id?: string | null;
          stripe_subscription_id?: string | null;
          status?: string | null;
          current_period_end?: string | null;
        };
        Update: {
          workspace_id?: string;
          stripe_customer_id?: string | null;
          stripe_subscription_id?: string | null;
          status?: string | null;
          current_period_end?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "subscriptions_workspace_id_fkey";
            columns: ["workspace_id"];
            isOneToOne: true;
            referencedRelation: "workspaces";
            referencedColumns: ["id"];
          },
        ];
      };
      stripe_events: {
        Row: {
          event_id: string;
          type: string;
          processed_at: string;
          workspace_id: string | null;
          user_id: string | null;
        };
        Insert: {
          event_id: string;
          type: string;
          processed_at?: string;
          workspace_id?: string | null;
          user_id?: string | null;
        };
        Update: {
          event_id?: string;
          type?: string;
          processed_at?: string;
          workspace_id?: string | null;
          user_id?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "stripe_events_workspace_id_fkey";
            columns: ["workspace_id"];
            isOneToOne: false;
            referencedRelation: "workspaces";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "stripe_events_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
    };
    Views: { [_ in never]: never };
    Functions: {
      is_workspace_member: {
        Args: { ws: string };
        Returns: boolean;
      };
      is_workspace_admin: {
        Args: { ws: string };
        Returns: boolean;
      };
      create_workspace_with_owner: {
        Args: { workspace_name: string; workspace_slug: string };
        Returns: Database["public"]["Tables"]["workspaces"]["Row"];
      };
    };
    Enums: {
      member_role: "admin" | "member";
      plan: "free" | "pro";
      lead_status:
        | "new"
        | "contacted"
        | "qualified"
        | "unqualified"
        | "customer";
      activity_type: "call" | "email" | "meeting" | "note";
      deal_stage:
        | "new"
        | "contacted"
        | "proposal"
        | "negotiation"
        | "won"
        | "lost";
    };
    CompositeTypes: { [_ in never]: never };
  };
};

type PublicSchema = Database["public"];

export type Tables<T extends keyof PublicSchema["Tables"]> =
  PublicSchema["Tables"][T]["Row"];

export type TablesInsert<T extends keyof PublicSchema["Tables"]> =
  PublicSchema["Tables"][T]["Insert"];

export type TablesUpdate<T extends keyof PublicSchema["Tables"]> =
  PublicSchema["Tables"][T]["Update"];

export type Enums<T extends keyof PublicSchema["Enums"]> =
  PublicSchema["Enums"][T];

/**
 * Enum values as runtime arrays, in database order. `supabase gen types` emits
 * an equivalent `Constants` object, so these survive the M10 regeneration.
 */
export const Constants = {
  public: {
    Enums: {
      member_role: ["admin", "member"],
      plan: ["free", "pro"],
      lead_status: ["new", "contacted", "qualified", "unqualified", "customer"],
      activity_type: ["call", "email", "meeting", "note"],
      deal_stage: [
        "new",
        "contacted",
        "proposal",
        "negotiation",
        "won",
        "lost",
      ],
    },
  },
} as const;

/* Aliases used across the app, so screens never spell out the tree. */
export type Workspace = Tables<"workspaces">;
export type WorkspaceMember = Tables<"workspace_members">;
export type Invite = Tables<"invites">;
export type Profile = Tables<"profiles">;
export type Lead = Tables<"leads">;
export type Deal = Tables<"deals">;
export type Activity = Tables<"activities">;
export type Subscription = Tables<"subscriptions">;

export type MemberRole = Enums<"member_role">;
export type Plan = Enums<"plan">;
export type LeadStatus = Enums<"lead_status">;
export type ActivityType = Enums<"activity_type">;
export type DealStage = Enums<"deal_stage">;
