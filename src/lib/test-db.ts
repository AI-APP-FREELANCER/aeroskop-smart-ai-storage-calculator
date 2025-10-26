import { testConnection } from './db';

// Test database connection
async function testDB() {
  console.log('Testing database connection...');
  const isConnected = await testConnection();
  
  if (isConnected) {
    console.log('✅ Database connection successful!');
  } else {
    console.log('❌ Database connection failed!');
  }
  
  process.exit(0);
}

testDB();
