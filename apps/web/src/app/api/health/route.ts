import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase-server';

export async function GET(request: NextRequest) {
  const checks = {
    status: 'ok',
    timestamp: new Date().toISOString(),
    checks: {
      environment: {
        status: 'ok',
        details: {
          nodeEnv: process.env.NODE_ENV,
          hasSupabaseUrl: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
          hasSupabaseKey: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
          hasGeminiKey: !!process.env.GEMINI_API_KEY,
          hasRedisUrl: !!process.env.REDIS_URL,
        }
      },
      database: {
        status: 'unknown',
        tables: [],
        error: null
      }
    }
  };

  // Check database connectivity and tables
  try {
    const supabase = createClient();
    
    // Check if we can query the database
    const { data: tables, error } = await supabase
      .from('user_profiles')
      .select('user_id')
      .limit(1);
    
    if (error) {
      checks.checks.database.status = 'error';
      checks.checks.database.error = error.message;
      checks.status = 'degraded';
    } else {
      // Get list of tables
      const { data: tableList } = await supabase.rpc('get_table_list', {});
      
      checks.checks.database.status = 'ok';
      checks.checks.database.tables = [
        'user_profiles',
        'micro_tasks',
        'rewards',
        'badges',
        'user_badges',
        'dopamine_feedback',
        'implementation_intentions',
        'commitment_contracts',
        'self_compassion_sessions',
        'priming_cues',
        'scheduled_cues',
        'future_self',
        'weekly_reviews',
        'lootbox_history'
      ];
    }
  } catch (error) {
    checks.checks.database.status = 'error';
    checks.checks.database.error = error instanceof Error ? error.message : 'Unknown error';
    checks.status = 'degraded';
  }

  return NextResponse.json(checks, {
    status: checks.status === 'ok' ? 200 : 503,
    headers: {
      'Cache-Control': 'no-store, must-revalidate',
    }
  });
}

// Migration status check endpoint
export async function POST(request: NextRequest) {
  try {
    const supabase = createClient();
    
    // Define expected tables
    const expectedTables = [
      'user_profiles',
      'micro_tasks',
      'rewards',
      'badges',
      'user_badges',
      'dopamine_feedback',
      'implementation_intentions',
      'commitment_contracts',
      'self_compassion_sessions',
      'priming_cues',
      'scheduled_cues',
      'future_self',
      'weekly_reviews',
      'lootbox_history'
    ];
    
    const tableStatus: Record<string, boolean> = {};
    
    // Check each table
    for (const table of expectedTables) {
      try {
        const { error } = await supabase
          .from(table)
          .select('*')
          .limit(1);
        
        tableStatus[table] = !error;
      } catch {
        tableStatus[table] = false;
      }
    }
    
    const allTablesExist = Object.values(tableStatus).every(status => status);
    
    return NextResponse.json({
      success: allTablesExist,
      tables: tableStatus,
      message: allTablesExist 
        ? 'All database tables are properly configured' 
        : 'Some database tables are missing. Please run migrations.'
    });
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to check migration status',
      message: 'Unable to verify database status'
    }, { status: 500 });
  }
}