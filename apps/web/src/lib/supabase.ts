'use client';

// Re-export from the browser client (single source of truth)
export { createSupabaseBrowser as getSupabaseClient } from './supabase-browser';