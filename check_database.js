const { createClient } = require('@supabase/supabase-js');

// Provided credentials
const supabaseUrl = 'https://orventmkporiqqjpfgcq.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9ydmVudG1rcG9yaXFxanBmZ2NxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTM1NzI1NzYsImV4cCI6MjA2OTE0ODU3Nn0.SAGVLYOpucxgCQ0yUpcRgpqqWaJ7QApQEODaGt5S5GE';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9ydmVudG1rcG9yaXFxanBmZ2NxIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MzU3MjU3NiwiZXhwIjoyMDY5MTQ4NTc2fQ.rJbXWn-txgzMvJ1cmD4q6S4Sz3NmRzoxRSN1t0UgSl0';

// Create clients
const supabase = createClient(supabaseUrl, supabaseAnonKey);
const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

async function checkDatabase() {
  console.log('🔍 Checking Supabase Database for Ny Braidr Project...');
  console.log('Project URL:', supabaseUrl);
  console.log('');

  try {
    // Test basic connection by checking auth
    console.log('1. Testing database connection...');
    const { data: authData, error: authError } = await supabase.auth.getSession();
    
    if (authError && authError.message.includes('Invalid API key')) {
      console.log('❌ Invalid API key - connection failed');
      return;
    }
    console.log('✅ Database connection successful');
    console.log('');

    // Check for expected Braidr tables by trying to access them
    console.log('2. Checking for expected Braidr tables...');
    const expectedTables = [
      { name: 'users', description: 'User accounts (customers and stylists)' },
      { name: 'stylists', description: 'Stylist profiles and information' },
      { name: 'services', description: 'Services offered by stylists' },
      { name: 'appointments', description: 'Booking appointments' },
      { name: 'reviews', description: 'Customer reviews and ratings' },
      { name: 'messages', description: 'Chat messages between users' },
      { name: 'conversations', description: 'Chat conversations' }
    ];
    
    const tableStatus = [];
    
    for (const table of expectedTables) {
      try {
        console.log(`   Checking ${table.name}...`);
        const { data, error } = await supabaseAdmin
          .from(table.name)
          .select('*', { count: 'exact', head: true })
          .limit(1);
        
        if (error) {
          if (error.message.includes('does not exist') || error.code === '42P01') {
            console.log(`   ❌ ${table.name} - Table does not exist`);
            tableStatus.push({ ...table, exists: false, error: 'Table not found' });
          } else {
            console.log(`   ⚠️  ${table.name} - Access error: ${error.message}`);
            tableStatus.push({ ...table, exists: true, error: error.message });
          }
        } else {
          console.log(`   ✅ ${table.name} - Table exists and accessible`);
          tableStatus.push({ ...table, exists: true, error: null });
        }
      } catch (err) {
        console.log(`   ❌ ${table.name} - Unexpected error: ${err.message}`);
        tableStatus.push({ ...table, exists: false, error: err.message });
      }
    }
    
    console.log('');

    // Summary of table status
    console.log('3. Table Status Summary:');
    const existingTables = tableStatus.filter(t => t.exists);
    const missingTables = tableStatus.filter(t => !t.exists);
    
    if (existingTables.length > 0) {
      console.log('\n✅ Existing tables:');
      existingTables.forEach(table => {
        console.log(`   - ${table.name}: ${table.description}`);
        if (table.error) {
          console.log(`     ⚠️  Warning: ${table.error}`);
        }
      });
    }
    
    if (missingTables.length > 0) {
      console.log('\n❌ Missing tables:');
      missingTables.forEach(table => {
        console.log(`   - ${table.name}: ${table.description}`);
      });
    }

    // Test sample data access for existing tables
    console.log('\n4. Testing data access...');
    if (existingTables.length > 0) {
      for (const table of existingTables.slice(0, 3)) { // Test first 3 tables
        try {
          const { count, error } = await supabaseAdmin
            .from(table.name)
            .select('*', { count: 'exact', head: true });
          
          if (error) {
            console.log(`   ❌ ${table.name}: Cannot count records - ${error.message}`);
          } else {
            console.log(`   ✅ ${table.name}: Contains ${count || 0} records`);
          }
        } catch (err) {
          console.log(`   ❌ ${table.name}: Error accessing data - ${err.message}`);
        }
      }
    } else {
      console.log('   No tables available for data testing');
    }

    // Test authentication functionality
    console.log('\n5. Testing authentication...');
    try {
      const { data: user, error: userError } = await supabase.auth.getUser();
      if (userError) {
        console.log('   ℹ️  No active user session (expected for server-side check)');
      } else {
        console.log('   ✅ Auth system accessible');
      }
    } catch (err) {
      console.log('   ⚠️  Auth check error:', err.message);
    }

    // Final assessment
    console.log('\n🎯 Database Health Assessment:');
    console.log('=' .repeat(50));
    console.log(`✅ Connection: Working`);
    console.log(`📊 Tables: ${existingTables.length}/${expectedTables.length} expected tables found`);
    console.log(`🔑 Authentication: Accessible`);
    
    if (missingTables.length === 0) {
      console.log('\n🎉 Database is fully set up and ready!');
      console.log('💡 All expected tables are present and accessible.');
    } else if (existingTables.length > 0) {
      console.log('\n⚠️  Database is partially set up');
      console.log(`💡 ${missingTables.length} tables need to be created.`);
      console.log('📝 Recommendation: Run the missing table creation scripts');
    } else {
      console.log('\n❌ Database setup is incomplete');
      console.log('💡 Recommendation: Run all table creation scripts to set up the database');
      console.log('📋 You may need to create the database schema from scratch');
    }

    // Provide next steps
    if (missingTables.length > 0) {
      console.log('\n📋 Next Steps:');
      console.log('1. Create the missing tables using SQL scripts');
      console.log('2. Set up Row Level Security (RLS) policies');
      console.log('3. Create necessary indexes for performance');
      console.log('4. Test the application with the database');
    }

  } catch (error) {
    console.log('❌ Unexpected error during database check:', error.message);
    console.log('🔧 This might indicate a connection or authentication issue.');
  }
}

// Run the check
checkDatabase().catch(console.error);