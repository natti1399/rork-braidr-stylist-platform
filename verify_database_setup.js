const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

// Initialize Supabase client
const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.EXPO_PUBLIC_SUPABASE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase credentials in .env.local');
  console.log('\nPlease follow the SUPABASE_SETUP_GUIDE.md to:');
  console.log('1. Create a Supabase project');
  console.log('2. Get your project URL and API keys');
  console.log('3. Update the .env.local file with real credentials');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function verifyConnection() {
  console.log('🔍 Verifying Supabase connection...');
  
  try {
    const { data, error } = await supabase
      .from('users')
      .select('count')
      .limit(1);
    
    if (error) {
      if (error.message.includes('Invalid API key')) {
        console.error('❌ Invalid API key. Please check your credentials in .env.local');
        console.log('\nMake sure you\'re using the correct:');
        console.log('- Project URL from Supabase dashboard');
        console.log('- anon/public API key (not the service role key)');
        return false;
      }
      
      if (error.message.includes('relation "users" does not exist')) {
        console.error('❌ Database tables not found.');
        console.log('\nPlease run the database migration:');
        console.log('1. Go to your Supabase dashboard → SQL Editor');
        console.log('2. Copy and run the contents of supabase/migrations/001_initial_schema.sql');
        return false;
      }
      
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

async function verifyTables() {
  console.log('\n📋 Verifying database schema...');
  
  const requiredTables = [
    { name: 'users', description: 'User profiles and authentication' },
    { name: 'stylists', description: 'Stylist business profiles' },
    { name: 'services', description: 'Services offered by stylists' },
    { name: 'appointments', description: 'Booking requests and appointments' },
    { name: 'messages', description: 'In-app messaging' },
    { name: 'reviews', description: 'Customer reviews and ratings' }
  ];
  
  let allTablesExist = true;
  
  for (const table of requiredTables) {
    try {
      const { data, error } = await supabase
        .from(table.name)
        .select('*')
        .limit(1);
      
      if (error) {
        console.log(`❌ Table '${table.name}': ${error.message}`);
        allTablesExist = false;
      } else {
        console.log(`✅ Table '${table.name}': ${table.description}`);
      }
    } catch (err) {
      console.log(`❌ Table '${table.name}': ${err.message}`);
      allTablesExist = false;
    }
  }
  
  return allTablesExist;
}

async function verifyAuth() {
  console.log('\n🔐 Verifying authentication setup...');
  
  try {
    const { data, error } = await supabase.auth.getSession();
    
    if (error) {
      console.log('❌ Auth error:', error.message);
      return false;
    }
    
    console.log('✅ Authentication system is working');
    return true;
  } catch (err) {
    console.log('❌ Auth verification failed:', err.message);
    return false;
  }
}

async function runVerification() {
  console.log('🚀 BraidR Database Verification\n');
  console.log('This script verifies that your Supabase database is properly set up.');
  console.log('=' .repeat(60));
  
  const connected = await verifyConnection();
  
  if (!connected) {
    console.log('\n❌ Cannot proceed without a valid connection.');
    console.log('Please check the SUPABASE_SETUP_GUIDE.md for help.');
    return;
  }
  
  const tablesExist = await verifyTables();
  const authWorking = await verifyAuth();
  
  console.log('\n' + '=' .repeat(60));
  console.log('📊 VERIFICATION SUMMARY');
  console.log('=' .repeat(60));
  
  console.log(`Database Connection: ${connected ? '✅ Working' : '❌ Failed'}`);
  console.log(`Database Schema: ${tablesExist ? '✅ Complete' : '❌ Incomplete'}`);
  console.log(`Authentication: ${authWorking ? '✅ Working' : '❌ Issues'}`);
  
  if (connected && tablesExist && authWorking) {
    console.log('\n🎉 Your Supabase database is ready for BraidR!');
    console.log('\nNext steps:');
    console.log('1. Start your React Native app: npm start');
    console.log('2. Test user registration in the app');
    console.log('3. Create some sample stylist profiles');
    console.log('4. Test the booking flow');
  } else {
    console.log('\n⚠️  Some issues were found. Please:');
    console.log('1. Check the SUPABASE_SETUP_GUIDE.md');
    console.log('2. Verify your .env.local credentials');
    console.log('3. Run the database migration if tables are missing');
    console.log('4. Check your Supabase dashboard for any errors');
  }
  
  console.log('\n📚 For help, see: SUPABASE_SETUP_GUIDE.md');
}

runVerification().catch(console.error);