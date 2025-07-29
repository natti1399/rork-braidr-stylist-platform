const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

// Initialize Supabase client
const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.EXPO_PUBLIC_SUPABASE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase credentials in .env.local');
  console.log('Required variables:');
  console.log('- EXPO_PUBLIC_SUPABASE_URL');
  console.log('- EXPO_PUBLIC_SUPABASE_KEY');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function testConnection() {
  console.log('🔍 Testing Supabase connection...');
  console.log('URL:', supabaseUrl);
  console.log('Key:', supabaseKey.substring(0, 20) + '...');
  
  try {
    // Test basic connection
    const { data, error } = await supabase
      .from('users')
      .select('count')
      .limit(1);
    
    if (error) {
      console.error('❌ Connection failed:', error.message);
      return false;
    }
    
    console.log('✅ Successfully connected to Supabase!');
    return true;
  } catch (err) {
    console.error('❌ Connection error:', err.message);
    return false;
  }
}

async function checkTables() {
  console.log('\n📋 Checking database tables...');
  
  const tables = ['users', 'stylists', 'services', 'appointments', 'messages', 'reviews'];
  
  for (const table of tables) {
    try {
      const { data, error } = await supabase
        .from(table)
        .select('*')
        .limit(1);
      
      if (error) {
        console.log(`❌ Table '${table}': ${error.message}`);
      } else {
        console.log(`✅ Table '${table}': exists and accessible`);
      }
    } catch (err) {
      console.log(`❌ Table '${table}': ${err.message}`);
    }
  }
}

async function testAuth() {
  console.log('\n🔐 Testing authentication...');
  
  try {
    const { data, error } = await supabase.auth.getSession();
    
    if (error) {
      console.log('❌ Auth error:', error.message);
    } else {
      console.log('✅ Auth system is working');
      console.log('Current session:', data.session ? 'Active' : 'No active session');
    }
  } catch (err) {
    console.log('❌ Auth test failed:', err.message);
  }
}

async function runTests() {
  console.log('🚀 Starting Supabase Database Check\n');
  
  const connected = await testConnection();
  
  if (connected) {
    await checkTables();
    await testAuth();
  }
  
  console.log('\n✨ Database check complete!');
}

runTests().catch(console.error);