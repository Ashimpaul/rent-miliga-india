import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.REACT_APP_SUPABASE_URL;
const supabaseAnonKey = process.env.REACT_APP_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error("Supabase URL and anonymous key are required.");
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function addCountryColumn() {
  const { error } = await supabase.rpc('execute_sql', { 
    sql: "ALTER TABLE listings ADD COLUMN IF NOT EXISTS country TEXT DEFAULT 'India'" 
  });

  if (error) {
    console.error('Error adding country column:', error);
  } else {
    console.log('Successfully added country column to listings table.');
  }
}

addCountryColumn();
