/**
 * Hand-written stand-in for the generated Supabase types (PLAN.md M2).
 *
 * It mirrors the data model in CLAUDE.md §4 *and* the shape that
 * `supabase gen types typescript` emits, so M10 can replace this file wholesale:
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
        Relationships: [];
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
        };
        Insert: {
          id?: string;
          workspace_id: string;
          email: string;
          role?: Database["public"]["Enums"]["member_role"];
          token: string;
          expires_at: string;
          accepted_at?: string | null;
          created_at?: string;
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
        Relationships: [];
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
        Relationships: [];
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
        Relationships: [];
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
        Relationships: [];
      };
    };
    Views: { [_ in never]: never };
    Functions: { [_ in never]: never };
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
export type Lead = Tables<"leads">;
export type Deal = Tables<"deals">;
export type Activity = Tables<"activities">;
export type Subscription = Tables<"subscriptions">;

export type MemberRole = Enums<"member_role">;
export type Plan = Enums<"plan">;
export type LeadStatus = Enums<"lead_status">;
export type ActivityType = Enums<"activity_type">;
export type DealStage = Enums<"deal_stage">;
