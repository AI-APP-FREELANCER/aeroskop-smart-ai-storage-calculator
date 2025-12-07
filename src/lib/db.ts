import { Pool } from 'pg';

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
      ssl: url.hostname.includes('amazonaws.com') || url.hostname.includes('digitalocean.com') 
        ? { rejectUnauthorized: false } 
        : false,
    };
  }
  
  // Fallback to individual environment variables
  return {
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432'),
    database: process.env.DB_NAME || 'aeroskop_db',
    user: process.env.DB_USER || 'aeroskop_user',
    password: process.env.DB_PASSWORD || 'aeroskop_password',
    ssl: process.env.DB_SSL === 'true' || process.env.DB_HOST?.includes('digitalocean.com')
      ? { rejectUnauthorized: false } 
      : false,
  };
};

const pool = new Pool(getDatabaseConfig());

export default pool;

// Database connection helper
export async function query(text: string, params?: any[]) {
  const client = await pool.connect();
  try {
    const result = await client.query(text, params);
    return result;
  } finally {
    client.release();
  }
}

// Test database connection
export async function testConnection() {
  try {
    const result = await query('SELECT NOW()');
    console.log('Database connected successfully:', result.rows[0]);
    return true;
  } catch (error) {
    console.error('Database connection failed:', error);
    return false;
  }
}
