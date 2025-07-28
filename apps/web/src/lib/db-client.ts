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
  
  // Dodatkowa walidacja - upewnij się, że zwracamy tylko dzisiejsze zadania
  const todayTasks = (data || []).filter(task => {
    const taskDate = new Date(task.created_at);
    return taskDate >= today;
  });
  
  return todayTasks as MicroTask[];
}

export async function createTask(task: MicroTaskInsert) {
  const supabase = createSupabaseBrowser();
  
  console.log('Creating task in Supabase with data:', task);
  
  const { data, error } = await supabase
    .from('micro_tasks')
    .insert(task)
    .select()
    .single();

  console.log('Supabase response - data:', data, 'error:', error);

  if (error) {
    console.error('Error creating task:', error);
    throw error;
  }
  
  if (!data) {
    console.error('No data returned from Supabase despite no error');
    throw new Error('Failed to create task - no data returned');
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

export async function completeTask(taskId: string, userId: string) {
  const supabase = createSupabaseBrowser();
  
  // Update task status to completed
  const { data: task, error: taskError } = await supabase
    .from('micro_tasks')
    .update({ 
      status: 'completed',
      completed_at: new Date().toISOString()
    })
    .eq('id', taskId)
    .eq('user_id', userId)
    .select()
    .single();

  if (taskError) {
    console.error('Error completing task:', taskError);
    throw taskError;
  }

  // Update user profile with XP
  const { data: profile, error: profileError } = await supabase
    .from('user_profiles')
    .select('total_xp, tasks_completed, current_streak, last_task_date')
    .eq('user_id', userId)
    .single();

  if (profileError) {
    console.error('Error fetching user profile:', profileError);
    throw profileError;
  }

  // Calculate streak
  const today = new Date().toDateString();
  const lastTaskDate = profile.last_task_date ? new Date(profile.last_task_date).toDateString() : null;
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayString = yesterday.toDateString();

  let newStreak = profile.current_streak || 0;
  if (lastTaskDate !== today) {
    if (lastTaskDate === yesterdayString) {
      newStreak += 1;
    } else if (lastTaskDate !== today) {
      newStreak = 1;
    }
  }

  // Update user profile
  const { error: updateError } = await supabase
    .from('user_profiles')
    .update({
      total_xp: (profile.total_xp || 0) + task.est_minutes,
      tasks_completed: (profile.tasks_completed || 0) + 1,
      current_streak: newStreak,
      last_task_date: new Date().toISOString()
    })
    .eq('user_id', userId);

  if (updateError) {
    console.error('Error updating user profile:', updateError);
    throw updateError;
  }

  return { task, xpEarned: task.est_minutes, newStreak };
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

export async function updateImplementationIntention(id: string, updates: { active?: boolean }) {
  const supabase = createSupabaseBrowser();
  const { data, error } = await supabase
    .from('implementation_intentions')
    .update(updates)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    console.error('Error updating implementation intention:', error);
    throw error;
  }
  return data;
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

export async function updateCommitmentStatus(id: string, status: 'completed' | 'failed') {
  const supabase = createSupabaseBrowser();
  const { data, error } = await supabase
    .from('commitment_contracts')
    .update({ status })
    .eq('id', id)
    .select()
    .single();

  if (error) {
    console.error('Error updating commitment status:', error);
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

export async function updatePrimingCue(id: string, updates: { active?: boolean }) {
  const supabase = createSupabaseBrowser();
  const { data, error } = await supabase
    .from('priming_cues')
    .update(updates)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    console.error('Error updating priming cue:', error);
    throw error;
  }
  return data;
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

// Lootbox system
export async function spinLootbox(userId: string) {
  const supabase = createSupabaseBrowser();
  
  // Check if user can spin
  const profile = await getUserProfile(userId);
  if (!profile) throw new Error('Profile not found');

  if (profile.lootbox_available_at && new Date(profile.lootbox_available_at) > new Date()) {
    throw new Error('Lootbox on cooldown');
  }

  // Generate random reward
  const rewards = [
    { type: 'xp', weight: 40, payload: { amount: Math.floor(Math.random() * 50) + 10 } },
    { type: 'badge', weight: 10, payload: { name: 'Lucky Star' } },
    { type: 'theme', weight: 15, payload: { theme: 'ocean' } },
    { type: 'streak_shield', weight: 15, payload: { days: 1 } },
    { type: 'bonus_time', weight: 15, payload: { minutes: 15 } },
    { type: 'mystery', weight: 5, payload: { surprise: true } },
  ];

  const totalWeight = rewards.reduce((sum, r) => sum + r.weight, 0);
  let random = Math.random() * totalWeight;
  
  let selectedReward = rewards[0];
  for (const reward of rewards) {
    random -= reward.weight;
    if (random <= 0) {
      selectedReward = reward;
      break;
    }
  }

  // Save to history
  const { error: historyError } = await supabase
    .from('lootbox_history')
    .insert({
      user_id: userId,
      reward_type: selectedReward.type,
      reward_payload: selectedReward.payload,
    })
    .select()
    .single();

  if (historyError) throw historyError;

  // Update cooldown
  const nextAvailable = new Date();
  nextAvailable.setHours(nextAvailable.getHours() + 24);

  await updateUserProfile(userId, {
    lootbox_available_at: nextAvailable.toISOString(),
  });

  // Apply reward
  if (selectedReward.type === 'xp' && selectedReward.payload.amount) {
    await updateUserProfile(userId, {
      total_xp: (profile.total_xp || 0) + selectedReward.payload.amount,
    });
  }

  return selectedReward;
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
  getLootboxHistory,
  createScheduledCue,
  updateScheduledCue,
  deleteScheduledCue
} from '@dopaforge/db';