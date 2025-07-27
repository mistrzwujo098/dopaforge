'use client';

import { createSupabaseBrowser } from './supabase-browser';
import type { Database } from '@dopaforge/db';

type MicroTask = Database['public']['Tables']['micro_tasks']['Row'];
type MicroTaskInsert = Database['public']['Tables']['micro_tasks']['Insert'];
type MicroTaskUpdate = Database['public']['Tables']['micro_tasks']['Update'];
type UserProfile = Database['public']['Tables']['user_profiles']['Row'];
type UserProfileUpdate = Database['public']['Tables']['user_profiles']['Update'];

// Task queries using the browser client
export async function getTodayTasks(userId: string) {
  const supabase = createSupabaseBrowser();
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const { data, error } = await supabase
    .from('micro_tasks')
    .select('*')
    .eq('user_id', userId)
    .gte('created_at', today.toISOString())
    .order('display_order', { ascending: true });

  if (error) {
    console.error('Error fetching tasks:', error);
    throw error;
  }
  return data as MicroTask[];
}

export async function createTask(task: MicroTaskInsert) {
  const supabase = createSupabaseBrowser();
  const { data, error } = await supabase
    .from('micro_tasks')
    .insert(task)
    .select()
    .single();

  if (error) {
    console.error('Error creating task:', error);
    throw error;
  }
  return data as MicroTask;
}

export async function updateTask(id: string, update: MicroTaskUpdate) {
  const supabase = createSupabaseBrowser();
  const { data, error } = await supabase
    .from('micro_tasks')
    .update(update)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    console.error('Error updating task:', error);
    throw error;
  }
  return data as MicroTask;
}

export async function reorderTasks(userId: string, taskIds: string[]) {
  const supabase = createSupabaseBrowser();
  
  // Update all display_order values based on the new order
  const updates = taskIds.map((taskId, index) => ({
    id: taskId,
    display_order: index
  }));

  // Batch update
  for (const update of updates) {
    const { error } = await supabase
      .from('micro_tasks')
      .update({ display_order: update.display_order })
      .eq('id', update.id);
    
    if (error) {
      console.error('Error reordering tasks:', error);
      throw error;
    }
  }
}

// User profile queries
export async function getUserProfile(userId: string) {
  const supabase = createSupabaseBrowser();
  const { data, error } = await supabase
    .from('user_profiles')
    .select('*')
    .eq('user_id', userId)
    .single();

  if (error && error.code !== 'PGRST116') {
    console.error('Error fetching user profile:', error);
    throw error;
  }
  return data as UserProfile | null;
}

export async function createUserProfile(userId: string, profile?: Partial<UserProfileUpdate>) {
  const supabase = createSupabaseBrowser();
  const { data, error } = await supabase
    .from('user_profiles')
    .insert({
      user_id: userId,
      ...profile
    })
    .select()
    .single();

  if (error) {
    console.error('Error creating user profile:', error);
    throw error;
  }
  return data as UserProfile;
}

export async function updateUserProfile(userId: string, update: UserProfileUpdate) {
  const supabase = createSupabaseBrowser();
  const { data, error } = await supabase
    .from('user_profiles')
    .update(update)
    .eq('user_id', userId)
    .select()
    .single();

  if (error) {
    console.error('Error updating user profile:', error);
    throw error;
  }
  return data as UserProfile;
}

// Future self queries
export async function getTodayFutureSelf(userId: string) {
  const supabase = createSupabaseBrowser();
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const { data, error } = await supabase
    .from('future_self')
    .select('*')
    .eq('user_id', userId)
    .gte('created_at', today.toISOString())
    .order('created_at', { ascending: false })
    .limit(1);

  if (error) {
    console.error('Error fetching future self:', error);
    throw error;
  }
  return data?.[0] || null;
}

export async function createFutureSelf(userId: string, visualization: string, feelings: string[]) {
  const supabase = createSupabaseBrowser();
  const { data, error } = await supabase
    .from('future_self')
    .insert({
      user_id: userId,
      visualization,
      feelings
    })
    .select()
    .single();

  if (error) {
    console.error('Error creating future self:', error);
    throw error;
  }
  return data;
}

// Weekly review queries
export async function needsWeeklyReview(userId: string) {
  const supabase = createSupabaseBrowser();
  const oneWeekAgo = new Date();
  oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
  
  const { data, error } = await supabase
    .from('weekly_reviews')
    .select('*')
    .eq('user_id', userId)
    .gte('created_at', oneWeekAgo.toISOString())
    .order('created_at', { ascending: false })
    .limit(1);

  if (error) {
    console.error('Error checking weekly review:', error);
    throw error;
  }
  
  return !data || data.length === 0;
}

export async function createWeeklyReview(userId: string, review: {
  satisfaction_score: number;
  burnout_score: number;
  addiction_score: number;
  reflections: string;
}) {
  const supabase = createSupabaseBrowser();
  const weekStart = new Date();
  weekStart.setDate(weekStart.getDate() - weekStart.getDay());
  weekStart.setHours(0, 0, 0, 0);
  
  const { data, error } = await supabase
    .from('weekly_reviews')
    .insert({
      user_id: userId,
      week_start: weekStart.toISOString(),
      ...review
    })
    .select()
    .single();

  if (error) {
    console.error('Error creating weekly review:', error);
    throw error;
  }
  return data;
}

// Implementation intentions
export async function getImplementationIntentions(userId: string) {
  const supabase = createSupabaseBrowser();
  const { data, error } = await supabase
    .from('implementation_intentions')
    .select('*')
    .eq('user_id', userId)
    .eq('active', true)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching implementation intentions:', error);
    throw error;
  }
  return data || [];
}

export async function createImplementationIntention(userId: string, intention: {
  trigger_type: 'time' | 'location' | 'habit';
  trigger_value: string;
  action: string;
}) {
  const supabase = createSupabaseBrowser();
  const { data, error } = await supabase
    .from('implementation_intentions')
    .insert({
      user_id: userId,
      ...intention,
      active: true
    })
    .select()
    .single();

  if (error) {
    console.error('Error creating implementation intention:', error);
    throw error;
  }
  return data;
}

export async function deleteImplementationIntention(id: string) {
  const supabase = createSupabaseBrowser();
  const { error } = await supabase
    .from('implementation_intentions')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('Error deleting implementation intention:', error);
    throw error;
  }
}

// Commitment contracts
export async function getCommitmentContracts(userId: string) {
  const supabase = createSupabaseBrowser();
  const { data, error } = await supabase
    .from('commitment_contracts')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching commitment contracts:', error);
    throw error;
  }
  return data || [];
}

export async function createCommitmentContract(userId: string, contract: {
  goal: string;
  stake_type: 'social' | 'donation' | 'habit_lock';
  stake_details: any;
  deadline: string;
  accountability_partner?: string;
}) {
  const supabase = createSupabaseBrowser();
  const { data, error } = await supabase
    .from('commitment_contracts')
    .insert({
      user_id: userId,
      ...contract,
      status: 'active'
    })
    .select()
    .single();

  if (error) {
    console.error('Error creating commitment contract:', error);
    throw error;
  }
  return data;
}

// Priming cues
export async function getPrimingCues(userId: string) {
  const supabase = createSupabaseBrowser();
  const { data, error } = await supabase
    .from('priming_cues')
    .select('*')
    .eq('user_id', userId)
    .eq('active', true)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching priming cues:', error);
    throw error;
  }
  return data || [];
}

export async function createPrimingCue(userId: string, cue: {
  cue_type: 'time' | 'location' | 'event';
  cue_details: any;
  priming_message: string;
}) {
  const supabase = createSupabaseBrowser();
  const { data, error } = await supabase
    .from('priming_cues')
    .insert({
      user_id: userId,
      ...cue,
      active: true
    })
    .select()
    .single();

  if (error) {
    console.error('Error creating priming cue:', error);
    throw error;
  }
  return data;
}

export async function deletePrimingCue(id: string) {
  const supabase = createSupabaseBrowser();
  const { error } = await supabase
    .from('priming_cues')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('Error deleting priming cue:', error);
    throw error;
  }
}

// Self compassion
export async function createSelfCompassionSession(userId: string, triggerReason: string | null, durationSeconds: number) {
  const supabase = createSupabaseBrowser();
  const { data, error } = await supabase
    .from('self_compassion_sessions')
    .insert({
      user_id: userId,
      trigger_reason: triggerReason,
      duration_seconds: durationSeconds
    })
    .select()
    .single();

  if (error) {
    console.error('Error creating self compassion session:', error);
    throw error;
  }
  return data;
}

// Scheduled cues
export async function getScheduledCues(userId: string) {
  const supabase = createSupabaseBrowser();
  const { data, error } = await supabase
    .from('scheduled_cues')
    .select('*')
    .eq('user_id', userId)
    .eq('active', true)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching scheduled cues:', error);
    throw error;
  }
  return data || [];
}

// Lootbox functions
export async function updateLootboxAvailability(userId: string, availableAt: Date) {
  const supabase = createSupabaseBrowser();
  const { error } = await supabase
    .from('user_profiles')
    .update({ lootbox_available_at: availableAt.toISOString() })
    .eq('user_id', userId);

  if (error) {
    console.error('Error updating lootbox availability:', error);
    throw error;
  }
}

// Re-export other functions that don't need modification
export {
  getUserRewards,
  getBadges,
  getUserBadges,
  checkAndGrantBadges,
  getOpenLoops,
  createOpenLoop,
  resumeOpenLoop,
  spinLootbox,
  getLootboxHistory,
  createScheduledCue,
  updateScheduledCue,
  deleteScheduledCue
} from '@dopaforge/db';