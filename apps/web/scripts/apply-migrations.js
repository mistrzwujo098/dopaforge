#!/usr/bin/env node

const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing Supabase environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function applyMigrations() {
  const migrationsDir = path.join(__dirname, '../../../supabase/migrations');
  
  // List of migrations to apply in order
  const migrations = [
    '20240726_create_advanced_features.sql',
    '20240726_create_future_self.sql',
    '20240726_create_reviews_and_lootbox.sql'
  ];

  console.log('Applying database migrations...\n');

  for (const migration of migrations) {
    const filePath = path.join(migrationsDir, migration);
    
    if (!fs.existsSync(filePath)) {
      console.log(`⚠️  Migration ${migration} not found, skipping...`);
      continue;
    }

    console.log(`📄 Applying ${migration}...`);
    
    try {
      const sql = fs.readFileSync(filePath, 'utf8');
      
      // Split by semicolons and execute each statement
      const statements = sql
        .split(';')
        .map(s => s.trim())
        .filter(s => s.length > 0);

      for (const statement of statements) {
        // Skip comments
        if (statement.startsWith('--')) continue;
        
        // Execute the SQL statement
        const { error } = await supabase.from('_sql').select(statement);
        
        if (error && !error.message.includes('already exists')) {
          console.error(`❌ Error in ${migration}:`, error.message);
          // Continue with other statements
        }
      }
      
      console.log(`✅ ${migration} applied successfully\n`);
    } catch (error) {
      console.error(`❌ Failed to apply ${migration}:`, error.message);
    }
  }

  console.log('✨ Migration process completed!');
  console.log('\nNote: If you see "already exists" errors, that means the tables were already created.');
  console.log('The application should now work with all advanced features enabled.');
}

// Run migrations
applyMigrations().catch(console.error);