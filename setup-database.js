#!/usr/bin/env node

const { Client } = require('pg');

async function setupDatabase() {
  console.log('🗄️  Setting up PostgreSQL database for Epitychia...\n');

  // First, connect to PostgreSQL server (not specific database)
  const adminClient = new Client({
    host: 'localhost',
    port: 5432,
    user: 'epitychia_user',
    password: 'epitychia_password',
    database: 'postgres' // Connect to default postgres database first
  });

  try {
    console.log('📡 Connecting to PostgreSQL server...');
    await adminClient.connect();
    console.log('✅ Connected to PostgreSQL server');

    // Check if epitychia database exists
    console.log('🔍 Checking if epitychia database exists...');
    const dbCheck = await adminClient.query(
      "SELECT 1 FROM pg_database WHERE datname = 'epitychia'"
    );

    if (dbCheck.rows.length === 0) {
      console.log('📦 Creating epitychia database...');
      await adminClient.query('CREATE DATABASE epitychia');
      console.log('✅ Database created successfully');
    } else {
      console.log('✅ Database already exists');
    }

    await adminClient.end();

    // Now connect to the epitychia database to test
    console.log('🔗 Testing connection to epitychia database...');
    const appClient = new Client({
      host: 'localhost',
      port: 5432,
      user: 'epitychia_user',
      password: 'epitychia_password',
      database: 'epitychia'
    });

    await appClient.connect();
    const result = await appClient.query('SELECT NOW() as current_time, version()');
    console.log('✅ Successfully connected to epitychia database');
    console.log('⏰ Current time:', result.rows[0].current_time);
    console.log('🐘 PostgreSQL version:', result.rows[0].version.split(' ')[1]);
    
    await appClient.end();

    console.log('\n🎉 Database setup complete!');
    console.log('💡 You can now start the backend with: npm run dev:backend');
    console.log('📊 Database URL: postgresql://epitychia_user:***@localhost:5432/epitychia');

  } catch (error) {
    console.error('❌ Database setup failed:', error.message);
    console.log('\n🔧 Troubleshooting:');
    
    if (error.code === 'ECONNREFUSED') {
      console.log('   • PostgreSQL server is not running');
      console.log('   • Start it with: docker run -d -p 5432:5432 -e POSTGRES_USER=epitychia_user -e POSTGRES_PASSWORD=epitychia_password -e POSTGRES_DB=epitychia postgres:15');
    } else if (error.code === '28P01') {
      console.log('   • Wrong username or password');
      console.log('   • Check your PostgreSQL credentials');
    } else if (error.code === '3D000') {
      console.log('   • Database does not exist (this script should create it)');
    }
    
    console.log('   • Make sure PostgreSQL is running on localhost:5432');
    console.log('   • Verify credentials: epitychia_user / epitychia_password');
    process.exit(1);
  }
}

setupDatabase();