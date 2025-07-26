// path: packages/db/src/queries.ts
import { supabase } from './client';
import type { Database } from './types';

type MicroTask = Database['public']['Tables']['micro_tasks']['Row'];
type MicroTaskInsert = Database['public']['Tables']['micro_tasks']['Insert'];
type MicroTaskUpdate = Database['public']['Tables']['micro_tasks']['Update'];
type Reward = Database['public']['Tables']['rewards']['Row'];
type Badge = Database['public']['Tables']['badges']['Row'];
type UserProfile = Database['public']['Tables']['user_profiles']['Row'];
type FutureSelf = Database['public']['Tables']['future_self']['Row'];
type ImplementationIntention = Database['public']['Tables']['implementation_intentions']['Row'];
type WeeklyReview = Database['public']['Tables']['weekly_reviews']['Row'];
type LootboxHistory = Database['public']['Tables']['lootbox_history']['Row'];

// Task queries
export async function getTasks(userId: string) {
  const { data, error } = await supabase
    .from('micro_tasks')
    .select('*')
    .eq('user_id', userId)
    .order('display_order', { ascending: true });

  if (error) throw error;
  return data as MicroTask[];
}

export async function getTodayTasks(userId: string) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const { data, error } = await supabase
    .from('micro_tasks')
    .select('*')
    .eq('user_id', userId)
    .gte('created_at', today.toISOString())
    .order('display_order', { ascending: true });

  if (error) throw error;
  return data as MicroTask[];
}

export async function createTask(task: MicroTaskInsert) {
  const { data, error } = await supabase
    .from('micro_tasks')
    .insert(task)
    .select()
    .single();

  if (error) throw error;
  return data as MicroTask;
}

export async function updateTask(id: string, updates: MicroTaskUpdate) {
  const { data, error } = await supabase
    .from('micro_tasks')
    .update(updates)
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data as MicroTask;
}

export async function completeTask(id: string, userId: string) {
  const { data: task, error: taskError } = await supabase
    .from('micro_tasks')
    .update({ 
      status: 'completed', 
      completed_at: new Date().toISOString() 
    })
    .eq('id', id)
    .eq('user_id', userId)
    .select()
    .single();

  if (taskError) throw taskError;

  // Grant XP reward
  const { error: rewardError } = await supabase
    .from('rewards')
    .insert({
      user_id: userId,
      type: 'xp',
      payload: { amount: (task as MicroTask).est_minutes }
    });

  if (rewardError) throw rewardError;

  return task as MicroTask;
}

export async function deleteTask(id: string, userId: string) {
  const { error } = await supabase
    .from('micro_tasks')
    .delete()
    .eq('id', id)
    .eq('user_id', userId);

  if (error) throw error;
}

export async function reorderTasks(userId: string, taskIds: string[]) {
  const updates = taskIds.map((id, index) => ({
    id,
    user_id: userId,
    display_order: index
  }));

  const { error } = await supabase
    .from('micro_tasks')
    .upsert(updates);

  if (error) throw error;
}

// User profile queries
export async function getUserProfile(userId: string) {
  const { data, error } = await supabase
    .from('user_profiles')
    .select('*')
    .eq('user_id', userId)
    .single();

  if (error && error.code !== 'PGRST116') throw error; // PGRST116 = no rows returned
  return data as UserProfile | null;
}

export async function updateUserProfile(userId: string, updates: Partial<UserProfile>) {
  const { data, error } = await supabase
    .from('user_profiles')
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq('user_id', userId)
    .select()
    .single();

  if (error) throw error;
  return data as UserProfile;
}

// Badge queries
export async function getBadges() {
  const { data, error } = await supabase
    .from('badges')
    .select('*')
    .order('xp_bonus', { ascending: true });

  if (error) throw error;
  return data as Badge[];
}

export async function getUserBadges(userId: string) {
  const { data, error } = await supabase
    .from('user_badges')
    .select(`
      badge_code,
      granted_at,
      badges (*)
    `)
    .eq('user_id', userId);

  if (error) throw error;
  return data;
}

export async function checkAndGrantBadges(userId: string, totalXp: number) {
  await getBadges(); // Verify badges exist
  const userBadges = await getUserBadges(userId);
  const ownedBadgeCodes = userBadges.map((ub: any) => ub.badge_code);

  const newBadges: string[] = [];

  // Check XP-based badges
  if (totalXp >= 100 && !ownedBadgeCodes.includes('starter')) {
    newBadges.push('starter');
  }
  if (totalXp >= 500 && !ownedBadgeCodes.includes('momentum')) {
    newBadges.push('momentum');
  }
  if (totalXp >= 2000 && !ownedBadgeCodes.includes('flow_master')) {
    newBadges.push('flow_master');
  }

  // Grant new badges
  if (newBadges.length > 0) {
    const badgeInserts = newBadges.map(code => ({
      user_id: userId,
      badge_code: code
    }));

    const { error } = await supabase
      .from('user_badges')
      .insert(badgeInserts);

    if (error) throw error;

    // Create reward entries for badges
    const rewardInserts = newBadges.map(code => ({
      user_id: userId,
      type: 'badge' as const,
      payload: { code }
    }));

    await supabase
      .from('rewards')
      .insert(rewardInserts);
  }

  return newBadges;
}

// Reward queries
export async function getUserRewards(userId: string, limit = 10) {
  const { data, error } = await supabase
    .from('rewards')
    .select('*')
    .eq('user_id', userId)
    .order('granted_at', { ascending: false })
    .limit(limit);

  if (error) throw error;
  return data as Reward[];
}

// Future Self queries
export async function createFutureSelf(userId: string, visualization: string, feelings: string[]) {
  const { data, error } = await supabase
    .from('future_self')
    .insert({
      user_id: userId,
      visualization,
      feelings,
    })
    .select()
    .single();

  if (error) throw error;
  return data as FutureSelf;
}

export async function getTodayFutureSelf(userId: string) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const { data, error } = await supabase
    .from('future_self')
    .select('*')
    .eq('user_id', userId)
    .gte('created_at', today.toISOString())
    .order('created_at', { ascending: false })
    .limit(1)
    .single();

  if (error && error.code !== 'PGRST116') throw error;
  return data as FutureSelf | null;
}

// Implementation Intentions queries
export async function getImplementationIntentions(userId: string) {
  const { data, error } = await supabase
    .from('implementation_intentions')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data as ImplementationIntention[];
}

export async function createImplementationIntention(
  userId: string,
  intention: Omit<ImplementationIntention, 'id' | 'user_id' | 'created_at' | 'active'>
) {
  const { data, error } = await supabase
    .from('implementation_intentions')
    .insert({
      user_id: userId,
      ...intention,
    })
    .select()
    .single();

  if (error) throw error;
  return data as ImplementationIntention;
}

export async function updateImplementationIntention(id: string, updates: { active?: boolean }) {
  const { data, error } = await supabase
    .from('implementation_intentions')
    .update(updates)
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data as ImplementationIntention;
}

export async function deleteImplementationIntention(id: string) {
  const { error } = await supabase
    .from('implementation_intentions')
    .delete()
    .eq('id', id);

  if (error) throw error;
}

// Weekly Review queries
export async function createWeeklyReview(userId: string, review: {
  satisfaction_score: number;
  burnout_score: number;
  addiction_score: number;
  reflections: string;
}) {
  const weekStart = new Date();
  weekStart.setDate(weekStart.getDate() - weekStart.getDay()); // Start of week
  weekStart.setHours(0, 0, 0, 0);

  const { data, error } = await supabase
    .from('weekly_reviews')
    .insert({
      user_id: userId,
      week_start: weekStart.toISOString().split('T')[0],
      ...review,
    })
    .select()
    .single();

  if (error) throw error;
  return data as WeeklyReview;
}

export async function getLatestWeeklyReview(userId: string) {
  const { data, error } = await supabase
    .from('weekly_reviews')
    .select('*')
    .eq('user_id', userId)
    .order('week_start', { ascending: false })
    .limit(1)
    .single();

  if (error && error.code !== 'PGRST116') throw error;
  return data as WeeklyReview | null;
}

export async function needsWeeklyReview(userId: string): Promise<boolean> {
  const latest = await getLatestWeeklyReview(userId);
  if (!latest) return true;

  const weekStart = new Date();
  weekStart.setDate(weekStart.getDate() - weekStart.getDay());
  weekStart.setHours(0, 0, 0, 0);

  const lastReviewWeek = new Date(latest.week_start);
  return weekStart > lastReviewWeek;
}

// Lootbox queries
export async function spinLootbox(userId: string) {
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
  if (selectedReward.type === 'xp') {
    await supabase.from('rewards').insert({
      user_id: userId,
      type: 'xp',
      payload: selectedReward.payload,
    });
  }

  return {
    type: selectedReward.type,
    payload: selectedReward.payload,
  };
}

export async function getLootboxHistory(userId: string, limit = 10) {
  const { data, error } = await supabase
    .from('lootbox_history')
    .select('*')
    .eq('user_id', userId)
    .order('granted_at', { ascending: false })
    .limit(limit);

  if (error) throw error;
  return data as LootboxHistory[];
}

// Open Loops (Zeigarnik) queries
export async function createOpenLoop(userId: string, taskId: string) {
  const { data, error } = await supabase
    .from('open_loops')
    .insert({
      user_id: userId,
      task_id: taskId,
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function getOpenLoops(userId: string) {
  const { data, error } = await supabase
    .from('open_loops')
    .select(`
      *,
      micro_tasks (*)
    `)
    .eq('user_id', userId)
    .is('resumed_at', null)
    .order('paused_at', { ascending: false });

  if (error) throw error;
  return data;
}

export async function resumeOpenLoop(loopId: string) {
  const { data, error } = await supabase
    .from('open_loops')
    .update({ resumed_at: new Date().toISOString() })
    .eq('id', loopId)
    .select()
    .single();

  if (error) throw error;
  return data;
}

// Commitment Contract queries
export async function getCommitmentContracts(userId: string) {
  const { data, error } = await supabase
    .from('commitment_contracts')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data;
}

export async function createCommitmentContract(
  userId: string,
  contract: {
    goal: string;
    stake_type: 'social' | 'donation' | 'habit_lock';
    stake_details: any;
    deadline: string;
    accountability_partner?: string;
  }
) {
  const { data, error } = await supabase
    .from('commitment_contracts')
    .insert({
      user_id: userId,
      ...contract,
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function updateCommitmentStatus(
  contractId: string,
  status: 'completed' | 'failed'
) {
  const { data, error } = await supabase
    .from('commitment_contracts')
    .update({ 
      status,
      completed_at: new Date().toISOString(),
    })
    .eq('id', contractId)
    .select()
    .single();

  if (error) throw error;
  return data;
}

// Self-Compassion Session queries
export async function createSelfCompassionSession(
  userId: string,
  triggerReason?: string
) {
  const { data, error } = await supabase
    .from('self_compassion_sessions')
    .insert({
      user_id: userId,
      trigger_reason: triggerReason,
      duration_seconds: 120, // 2 minute meditation
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function getRecentSelfCompassionSessions(userId: string, limit = 10) {
  const { data, error } = await supabase
    .from('self_compassion_sessions')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(limit);

  if (error) throw error;
  return data;
}

// Environmental Priming queries
export async function getPrimingCues(userId: string) {
  const { data, error } = await supabase
    .from('priming_cues')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data;
}

export async function createPrimingCue(
  userId: string,
  cue: {
    cue_type: 'time' | 'location' | 'event';
    cue_details: any;
    priming_message: string;
    active: boolean;
  }
) {
  const { data, error } = await supabase
    .from('priming_cues')
    .insert({
      user_id: userId,
      ...cue,
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function updatePrimingCue(id: string, updates: { active?: boolean }) {
  const { data, error } = await supabase
    .from('priming_cues')
    .update(updates)
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function deletePrimingCue(id: string) {
  const { error } = await supabase
    .from('priming_cues')
    .delete()
    .eq('id', id);

  if (error) throw error;
}

// Scheduled Cues queries
export async function getScheduledCues(userId: string) {
  const { data, error } = await supabase
    .from('scheduled_cues')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data;
}

export async function createScheduledCue(
  userId: string,
  cue: {
    title: string;
    message: string;
    schedule_type: 'daily' | 'weekly' | 'specific';
    schedule_time: string;
    schedule_days?: number[];
    specific_date?: string;
  }
) {
  const { data, error } = await supabase
    .from('scheduled_cues')
    .insert({
      user_id: userId,
      ...cue,
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function updateScheduledCue(id: string, updates: { active?: boolean }) {
  const { data, error } = await supabase
    .from('scheduled_cues')
    .update(updates)
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function deleteScheduledCue(id: string) {
  const { error } = await supabase
    .from('scheduled_cues')
    .delete()
    .eq('id', id);

  if (error) throw error;
}