// Test AWS RDS Database Connection
const { Pool } = require('pg');
require('dotenv').config({ path: '.env.local' });

// Parse DATABASE_URL or use individual environment variables
const getDatabaseConfig = () => {
  if (process.env.DATABASE_URL) {
    // Parse DATABASE_URL format: postgresql://user:password@host:port/database
    const url = new URL(process.env.DATABASE_URL);
    return {
      host: url.hostname,
      port: parseInt(url.port) || 5432,
      database: url.pathname.slice(1), // Remove leading slash
      user: url.username,
      password: url.password,
      ssl: url.hostname.includes('amazonaws.com') ? { rejectUnauthorized: false } : false,
    };
  }
  
  // Fallback to individual environment variables
  return {
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432'),
    database: process.env.DB_NAME || 'aeroskop_db',
    user: process.env.DB_USER || 'aeroskop_user',
    password: process.env.DB_PASSWORD || 'aeroskop_password',
    ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : false,
  };
};

async function testConnection() {
  const config = getDatabaseConfig();
  console.log('🔧 Testing AWS RDS connection with config:', {
    host: config.host,
    port: config.port,
    database: config.database,
    user: config.user,
    ssl: config.ssl
  });

  const pool = new Pool(config);
  
  try {
    // Test basic connection
    const client = await pool.connect();
    console.log('✅ Database connection successful!');
    
    // Test query
    const result = await client.query('SELECT NOW() as current_time, version() as postgres_version');
    console.log('📊 Database info:', result.rows[0]);
    
    // Test if our tables exist
    const tablesResult = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      ORDER BY table_name
    `);
    
    console.log('📋 Available tables:');
    tablesResult.rows.forEach(row => {
      console.log(`  - ${row.table_name}`);
    });
    
    // Test data count
    const countResult = await client.query('SELECT COUNT(*) as total_tables FROM information_schema.tables WHERE table_schema = \'public\'');
    console.log(`📈 Total tables: ${countResult.rows[0].total_tables}`);
    
    client.release();
    console.log('🎉 AWS RDS connection test completed successfully!');
    
  } catch (error) {
    console.error('❌ Database connection failed:', error.message);
    console.error('Full error:', error);
  } finally {
    await pool.end();
  }
}

// Run the test
testConnection();
