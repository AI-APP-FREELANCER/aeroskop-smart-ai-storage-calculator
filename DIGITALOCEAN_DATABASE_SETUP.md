# DigitalOcean PostgreSQL Database Setup Guide

This guide will help you set up the Aeroskop application database on DigitalOcean PostgreSQL.

## Prerequisites

1. **DigitalOcean Account**: Sign up at [digitalocean.com](https://www.digitalocean.com)
2. **PostgreSQL Database**: Create a managed PostgreSQL database on DigitalOcean
3. **Database Access**: Connection string or credentials from DigitalOcean

---

## Step 1: Create PostgreSQL Database on DigitalOcean

### 1.1 Navigate to Databases
1. Log in to your DigitalOcean account
2. Go to **Databases** in the left sidebar
3. Click **Create Database Cluster**

### 1.2 Configure Database
- **Database Engine**: PostgreSQL
- **Version**: PostgreSQL 15 or 16 (recommended)
- **Datacenter Region**: Choose closest to your application (e.g., `sgp1` for Singapore)
- **Plan**: 
  - **Development**: Basic ($15/month) - 1 GB RAM, 1 vCPU, 10 GB storage
  - **Production**: Professional ($60/month+) - Higher specs recommended
- **Database Name**: `aeroskop_db` (or your preferred name)
- **Database User**: `aeroskop_user` (or your preferred username)

### 1.3 Get Connection Details
After creation, DigitalOcean will provide:
- **Host**: `your-db-name.db.ondigitalocean.com`
- **Port**: `25060` (default for DigitalOcean)
- **Database**: `defaultdb` (or your custom name)
- **Username**: Your database user
- **Password**: Generated password (save this securely!)
- **SSL Mode**: `require` (DigitalOcean requires SSL)

---

## Step 2: Configure Database Connection

### 2.1 Get Connection String
DigitalOcean provides a connection string in this format:
```
postgresql://username:password@host:port/database?sslmode=require
```

**Example:**
```
postgresql://aeroskop_user:your_password@aeroskop-db.db.ondigitalocean.com:25060/defaultdb?sslmode=require
```

### 2.2 Update Environment Variables

#### For Local Development (`.env.local`):
```env
# DigitalOcean PostgreSQL Connection
DATABASE_URL=postgresql://aeroskop_user:your_password@aeroskop-db.db.ondigitalocean.com:25060/defaultdb?sslmode=require

# OR use individual variables:
DB_HOST=aeroskop-db.db.ondigitalocean.com
DB_PORT=25060
DB_NAME=defaultdb
DB_USER=aeroskop_user
DB_PASSWORD=your_password
DB_SSL=true
```

#### For Production (`.env.production` or `production.env`):
```env
DATABASE_URL=postgresql://aeroskop_user:your_password@aeroskop-db.db.ondigitalocean.com:25060/defaultdb?sslmode=require
```

---

## Step 3: Run Database Setup Script

### 3.1 Connect to Database

#### Option A: Using psql (Command Line)
```bash
# Install psql if not already installed
# On macOS: brew install postgresql
# On Ubuntu: sudo apt-get install postgresql-client
# On Windows: Download from postgresql.org

# Connect using connection string
psql "postgresql://aeroskop_user:your_password@aeroskop-db.db.ondigitalocean.com:25060/defaultdb?sslmode=require"
```

#### Option B: Using DigitalOcean Console
1. Go to your database cluster in DigitalOcean
2. Click **Connection Details** tab
3. Click **Launch Console** (opens web-based SQL editor)

#### Option C: Using Database GUI Tool
- **pgAdmin**: [pgadmin.org](https://www.pgadmin.org/)
- **DBeaver**: [dbeaver.io](https://dbeaver.io/)
- **TablePlus**: [tableplus.com](https://tableplus.com/)

**Connection Settings:**
- Host: `your-db-name.db.ondigitalocean.com`
- Port: `25060`
- Database: `defaultdb`
- Username: `aeroskop_user`
- Password: `your_password`
- SSL Mode: `require`

### 3.2 Run Setup Script

1. **Copy the SQL script**: `database/digitalocean-setup.sql`
2. **Execute the script** in your database client:

```sql
-- The script will create all 16 tables with indexes and constraints
-- Execution time: ~30-60 seconds depending on database plan
```

**Using psql:**
```bash
psql "postgresql://aeroskop_user:your_password@aeroskop-db.db.ondigitalocean.com:25060/defaultdb?sslmode=require" -f database/digitalocean-setup.sql
```

**Using DigitalOcean Console:**
1. Open the SQL editor
2. Paste the entire contents of `database/digitalocean-setup.sql`
3. Click **Run** or press `Ctrl+Enter`

### 3.3 Verify Tables Created

Run this query to verify all tables were created:
```sql
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
ORDER BY table_name;
```

**Expected Output (16 tables):**
```
ai_recommendations
ai_usage_logs
analytics_summary
calculation_contexts
calculator_interactions
chat_messages
click_streams
consultation_enquiry
gemini_usage
page_analytics
recommendation_analytics
sessions
storage_recommendations_cache
user_activities
user_analytics
users
```

---

## Step 4: Configure Firewall Rules (If Needed)

### 4.1 Trusted Sources
DigitalOcean databases are protected by firewall rules. You need to add your application's IP address:

1. Go to your database cluster
2. Click **Settings** tab
3. Scroll to **Trusted Sources**
4. Add your application server's IP address:
   - **For VM**: Add your Ubuntu VM's public IP
   - **For Local Development**: Add your local machine's public IP (use [whatismyip.com](https://whatismyip.com))
   - **For All IPs (Development Only)**: `0.0.0.0/0` (⚠️ Not recommended for production)

### 4.2 Connection Pooling (Optional)
DigitalOcean provides connection pooling:
- **Pool Mode**: Transaction (recommended)
- **Pool Size**: 25 connections (default)
- **Pool URL**: Different from direct connection URL

**Example Pool URL:**
```
postgresql://aeroskop_user:password@aeroskop-db.db.ondigitalocean.com:25061/defaultdb?sslmode=require
```
Note: Port is `25061` for connection pool, `25060` for direct connection.

---

## Step 5: Test Database Connection

### 5.1 Test from Application

Update your `.env.local` with the DigitalOcean connection string, then test:

```bash
# Start the application
npm run dev

# The application should connect to DigitalOcean PostgreSQL
# Check console for any connection errors
```

### 5.2 Test Connection Programmatically

Create a test file `test-db-connection.js`:
```javascript
const { Pool } = require('pg');
require('dotenv').config({ path: '.env.local' });

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

pool.query('SELECT NOW()', (err, res) => {
  if (err) {
    console.error('❌ Connection failed:', err);
  } else {
    console.log('✅ Connected successfully!', res.rows[0]);
  }
  pool.end();
});
```

Run:
```bash
node test-db-connection.js
```

---

## Step 6: Migrate Existing Data (Optional)

If you have existing data from AWS RDS or local database:

### 6.1 Export from Source Database
```bash
# Export all data
pg_dump "postgresql://user:pass@source-host:5432/dbname" > backup.sql

# Or export specific tables
pg_dump "postgresql://user:pass@source-host:5432/dbname" -t users -t sessions > partial-backup.sql
```

### 6.2 Import to DigitalOcean
```bash
# Import data (schema should already exist from Step 3)
psql "postgresql://aeroskop_user:password@aeroskop-db.db.ondigitalocean.com:25060/defaultdb?sslmode=require" < backup.sql
```

**Note**: Make sure to run the setup script (Step 3) **before** importing data to ensure tables exist.

---

## Step 7: Update Application Configuration

### 7.1 Update `src/lib/db.ts` (If Needed)

The application should automatically detect DigitalOcean connections. However, verify SSL configuration:

```typescript
// src/lib/db.ts should handle SSL automatically
// DigitalOcean hostnames don't contain 'amazonaws.com'
// So you may need to explicitly set SSL for DigitalOcean

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.DATABASE_URL?.includes('digitalocean.com') 
    ? { rejectUnauthorized: false } 
    : undefined
});
```

### 7.2 Verify Connection Pool Settings

DigitalOcean PostgreSQL has connection limits based on your plan:
- **Basic Plan**: 25 connections
- **Professional Plan**: 100+ connections

Ensure your application's connection pool doesn't exceed these limits.

---

## Troubleshooting

### Issue: "Connection refused" or "Timeout"
**Solution**: 
- Check firewall rules in DigitalOcean (Step 4.1)
- Verify your IP address is whitelisted
- Check if database is running (status in DigitalOcean dashboard)

### Issue: "SSL connection required"
**Solution**: 
- Ensure `sslmode=require` is in connection string
- For Node.js, use `ssl: { rejectUnauthorized: false }`

### Issue: "Too many connections"
**Solution**: 
- Reduce connection pool size in application
- Upgrade DigitalOcean database plan
- Use connection pooling (port 25061)

### Issue: "Table does not exist"
**Solution**: 
- Verify setup script ran successfully (Step 3.3)
- Check if you're connected to the correct database
- Re-run the setup script

### Issue: "Permission denied"
**Solution**: 
- Verify database user has proper permissions
- Check if user has CREATE, INSERT, UPDATE, DELETE privileges
- DigitalOcean users should have full access by default

---

## Database Maintenance

### Backup
DigitalOcean provides automatic daily backups:
- **Retention**: 7 days (Basic) to 30 days (Professional)
- **Manual Backup**: Available in dashboard
- **Point-in-Time Recovery**: Available on Professional plans

### Monitoring
- **Metrics**: Available in DigitalOcean dashboard
- **Alerts**: Configure in database settings
- **Query Performance**: Use `EXPLAIN ANALYZE` for slow queries

### Scaling
- **Vertical Scaling**: Upgrade plan for more resources
- **Horizontal Scaling**: Read replicas available on Professional plans

---

## Security Best Practices

1. **Use Strong Passwords**: Generate secure passwords for database users
2. **Enable SSL**: Always use `sslmode=require` (mandatory on DigitalOcean)
3. **Restrict IP Access**: Only whitelist necessary IP addresses
4. **Regular Backups**: Ensure backups are enabled and tested
5. **Monitor Access**: Review connection logs regularly
6. **Update Regularly**: Keep PostgreSQL version up to date

---

## Cost Optimization

### Development Environment
- Use **Basic Plan** ($15/month) for development
- Stop database when not in use (if using on-demand)
- Use connection pooling to reduce connection count

### Production Environment
- **Professional Plan** recommended for production
- Monitor usage and scale as needed
- Use read replicas for high-traffic scenarios

---

## Support

- **DigitalOcean Docs**: [docs.digitalocean.com/products/databases/postgresql](https://docs.digitalocean.com/products/databases/postgresql/)
- **DigitalOcean Support**: Available in dashboard
- **PostgreSQL Docs**: [postgresql.org/docs](https://www.postgresql.org/docs/)

---

## Summary Checklist

- [ ] Created PostgreSQL database on DigitalOcean
- [ ] Saved connection credentials securely
- [ ] Updated `.env.local` with connection string
- [ ] Added application IP to trusted sources
- [ ] Ran `database/digitalocean-setup.sql` script
- [ ] Verified all 16 tables were created
- [ ] Tested connection from application
- [ ] Migrated existing data (if applicable)
- [ ] Configured connection pooling (optional)
- [ ] Enabled automatic backups
- [ ] Set up monitoring alerts

---

**Next Steps**: After database setup is complete, update your application's environment variables and restart the application to use the new DigitalOcean PostgreSQL database.

