# Push Code to New GitHub Repository

## New Repository
- **URL**: https://github.com/AI-APP-FREELANCER/aeroskop.git
- **Old Repository**: https://github.com/AI-APP-FREELANCER/aeroskop-smart-ai-storage-calculator.git (kept as backup)

## Steps to Push

### 1. Commit All Changes

```bash
git add -A
git commit -m "Refactor: Migrate to DigitalOcean assets and PostgreSQL

- Migrated all images to DigitalOcean Spaces CDN
- Updated all image paths to use DO_ASSET_BASE_URL
- Converted all image extensions to .webp
- Added image optimization (lazy loading, sizes attributes)
- Migrated database from AWS RDS to DigitalOcean PostgreSQL
- Updated all database connection strings
- Removed unused .md documentation files
- Cleaned up code (removed unused imports, dead code)
- Excluded public/images from git (hosted on DigitalOcean)
- Added comprehensive database setup scripts
- Updated all documentation with new infrastructure details"
```

### 2. Push to New Repository

```bash
# Push to new repository
git push aeroskop main

# Or if main branch doesn't exist yet, create it:
git push -u aeroskop main
```

### 3. Verify Push

Visit: https://github.com/AI-APP-FREELANCER/aeroskop

## What's Excluded from Repository

The following are excluded (already on DigitalOcean):
- `/public/images/` - All product images (hosted on DigitalOcean Spaces)
- `/public/videos/` - All video files
- `/public/ASK_DATASHEETS/` - Datasheet files

## What's Included

- All source code
- Database setup scripts
- Configuration examples (production.env, gemini-config.env)
- Documentation
- Test scripts

## Important Notes

1. **Environment Variables**: `.env.local` is excluded - make sure to set it up on the VM
2. **Images**: All images are served from DigitalOcean Spaces CDN
3. **Database**: Connection string is in `production.env` (example only, not actual credentials)
4. **Old Repository**: Still exists as backup at `origin` remote

## Next Steps After Push

1. **On VM**: Clone the new repository
   ```bash
   git clone https://github.com/AI-APP-FREELANCER/aeroskop.git
   cd aeroskop
   ```

2. **Set up environment**:
   ```bash
   cp production.env .env.local
   # Edit .env.local with actual credentials
   ```

3. **Install dependencies**:
   ```bash
   npm install
   ```

4. **Run database setup** (if not done):
   ```bash
   PGPASSWORD="your_password" psql "your_connection_string" -f database/digitalocean-setup.sql
   ```

5. **Start application**:
   ```bash
   npm run dev
   ```

