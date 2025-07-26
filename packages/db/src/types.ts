// path: packages/db/src/types.ts
export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type TaskStatus = 'pending' | 'completed';
export type RewardType = 'xp' | 'badge';

export type TriggerType = 'time' | 'location' | 'habit';
export type CueType = 'time' | 'location' | 'event';
export type CommitmentStatus = 'active' | 'completed' | 'failed';

export interface Database {
  public: {
    Tables: {
      micro_tasks: {
        Row: {
          id: string;
          user_id: string;
          title: string;
          est_minutes: number;
          status: TaskStatus;
          started_at: string | null;
          completed_at: string | null;
          created_at: string;
          display_order: number;
        };
        Insert: {
          id?: string;
          user_id: string;
          title: string;
          est_minutes: number;
          status?: TaskStatus;
          started_at?: string | null;
          completed_at?: string | null;
          created_at?: string;
          display_order?: number;
        };
        Update: {
          id?: string;
          user_id?: string;
          title?: string;
          est_minutes?: number;
          status?: TaskStatus;
          started_at?: string | null;
          completed_at?: string | null;
          created_at?: string;
          display_order?: number;
        };
      };
      rewards: {
        Row: {
          id: string;
          user_id: string;
          type: RewardType;
          payload: Json | null;
          granted_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          type: RewardType;
          payload?: Json | null;
          granted_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          type?: RewardType;
          payload?: Json | null;
          granted_at?: string;
        };
      };
      badges: {
        Row: {
          code: string;
          title: string;
          description: string | null;
          xp_bonus: number;
        };
        Insert: {
          code: string;
          title: string;
          description?: string | null;
          xp_bonus?: number;
        };
        Update: {
          code?: string;
          title?: string;
          description?: string | null;
          xp_bonus?: number;
        };
      };
      user_badges: {
        Row: {
          user_id: string;
          badge_code: string;
          granted_at: string;
        };
        Insert: {
          user_id: string;
          badge_code: string;
          granted_at?: string;
        };
        Update: {
          user_id?: string;
          badge_code?: string;
          granted_at?: string;
        };
      };
      user_profiles: {
        Row: {
          user_id: string;
          display_name: string | null;
          total_xp: number;
          current_streak: number;
          longest_streak: number;
          last_active_date: string | null;
          dark_mode: boolean;
          break_reminder: boolean;
          lootbox_available_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          user_id: string;
          display_name?: string | null;
          total_xp?: number;
          current_streak?: number;
          longest_streak?: number;
          last_active_date?: string | null;
          dark_mode?: boolean;
          break_reminder?: boolean;
          lootbox_available_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          user_id?: string;
          display_name?: string | null;
          total_xp?: number;
          current_streak?: number;
          longest_streak?: number;
          last_active_date?: string | null;
          dark_mode?: boolean;
          break_reminder?: boolean;
          lootbox_available_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      future_self: {
        Row: {
          id: string;
          user_id: string;
          visualization: string;
          feelings: string[];
          created_at: string;
          reminder_sent: boolean;
        };
        Insert: {
          id?: string;
          user_id: string;
          visualization: string;
          feelings: string[];
          created_at?: string;
          reminder_sent?: boolean;
        };
        Update: {
          id?: string;
          user_id?: string;
          visualization?: string;
          feelings?: string[];
          created_at?: string;
          reminder_sent?: boolean;
        };
      };
      implementation_intentions: {
        Row: {
          id: string;
          user_id: string;
          trigger_type: TriggerType;
          trigger_value: string;
          action: string;
          active: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          trigger_type: TriggerType;
          trigger_value: string;
          action: string;
          active?: boolean;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          trigger_type?: TriggerType;
          trigger_value?: string;
          action?: string;
          active?: boolean;
          created_at?: string;
        };
      };
      habit_cues: {
        Row: {
          id: string;
          user_id: string;
          task_id: string | null;
          cue_type: CueType;
          cue_value: Json;
          schedule: string | null;
          active: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          task_id?: string | null;
          cue_type: CueType;
          cue_value: Json;
          schedule?: string | null;
          active?: boolean;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          task_id?: string | null;
          cue_type?: CueType;
          cue_value?: Json;
          schedule?: string | null;
          active?: boolean;
          created_at?: string;
        };
      };
      open_loops: {
        Row: {
          id: string;
          user_id: string;
          task_id: string;
          paused_at: string;
          resumed_at: string | null;
        };
        Insert: {
          id?: string;
          user_id: string;
          task_id: string;
          paused_at?: string;
          resumed_at?: string | null;
        };
        Update: {
          id?: string;
          user_id?: string;
          task_id?: string;
          paused_at?: string;
          resumed_at?: string | null;
        };
      };
      weekly_reviews: {
        Row: {
          id: string;
          user_id: string;
          week_start: string;
          satisfaction_score: number | null;
          burnout_score: number | null;
          addiction_score: number | null;
          reflections: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          week_start: string;
          satisfaction_score?: number | null;
          burnout_score?: number | null;
          addiction_score?: number | null;
          reflections?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          week_start?: string;
          satisfaction_score?: number | null;
          burnout_score?: number | null;
          addiction_score?: number | null;
          reflections?: string | null;
          created_at?: string;
        };
      };
      lootbox_history: {
        Row: {
          id: string;
          user_id: string;
          reward_type: string;
          reward_payload: Json;
          granted_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          reward_type: string;
          reward_payload: Json;
          granted_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          reward_type?: string;
          reward_payload?: Json;
          granted_at?: string;
        };
      };
      commitment_contracts: {
        Row: {
          id: string;
          user_id: string;
          goal: string;
          stake_type: 'social' | 'donation' | 'habit_lock';
          stake_details: Json;
          deadline: string;
          accountability_partner: string | null;
          status: CommitmentStatus;
          created_at: string;
          completed_at: string | null;
        };
        Insert: {
          id?: string;
          user_id: string;
          goal: string;
          stake_type: 'social' | 'donation' | 'habit_lock';
          stake_details: Json;
          deadline: string;
          accountability_partner?: string | null;
          status?: CommitmentStatus;
          created_at?: string;
          completed_at?: string | null;
        };
        Update: {
          id?: string;
          user_id?: string;
          goal?: string;
          stake_type?: 'social' | 'donation' | 'habit_lock';
          stake_details?: Json;
          deadline?: string;
          accountability_partner?: string | null;
          status?: CommitmentStatus;
          created_at?: string;
          completed_at?: string | null;
        };
      };
      priming_cues: {
        Row: {
          id: string;
          user_id: string;
          cue_type: CueType;
          cue_details: Json;
          priming_message: string;
          active: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          cue_type: CueType;
          cue_details: Json;
          priming_message: string;
          active?: boolean;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          cue_type?: CueType;
          cue_details?: Json;
          priming_message?: string;
          active?: boolean;
          created_at?: string;
        };
      };
      self_compassion_sessions: {
        Row: {
          id: string;
          user_id: string;
          trigger_reason: string | null;
          duration_seconds: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          trigger_reason?: string | null;
          duration_seconds: number;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          trigger_reason?: string | null;
          duration_seconds?: number;
          created_at?: string;
        };
      };
      scheduled_cues: {
        Row: {
          id: string;
          user_id: string;
          title: string;
          message: string;
          schedule_type: 'daily' | 'weekly' | 'specific';
          schedule_time: string;
          schedule_days: number[] | null;
          specific_date: string | null;
          active: boolean;
          last_triggered_at: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          title: string;
          message: string;
          schedule_type: 'daily' | 'weekly' | 'specific';
          schedule_time: string;
          schedule_days?: number[] | null;
          specific_date?: string | null;
          active?: boolean;
          last_triggered_at?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          title?: string;
          message?: string;
          schedule_type?: 'daily' | 'weekly' | 'specific';
          schedule_time?: string;
          schedule_days?: number[] | null;
          specific_date?: string | null;
          active?: boolean;
          last_triggered_at?: string | null;
          created_at?: string;
        };
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      task_status: TaskStatus;
      reward_type: RewardType;
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
}