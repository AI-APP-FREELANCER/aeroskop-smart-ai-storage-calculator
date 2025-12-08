# Git Commands for Ubuntu VM

## Fresh Clone (New Setup)

```bash
# Navigate to your project directory
cd ~/aeroskop

# Clone the new repository
git clone https://github.com/AI-APP-FREELANCER/aeroskop.git aeroskop

# Navigate into the project
cd aeroskop

# Verify you're on main branch
git checkout main
```

## Update Existing Repository

```bash
# Navigate to project directory
cd ~/aeroskop/aeroskop

# Pull latest changes
git pull origin main
```

## If You Need to Switch Remotes

```bash
# Check current remotes
git remote -v

# Add new remote (if needed)
git remote add aeroskop https://github.com/AI-APP-FREELANCER/aeroskop.git

# Fetch from new remote
git fetch aeroskop

# Switch to new remote's main branch
git checkout -b aeroskop-main aeroskop/main

# Or set upstream
git branch --set-upstream-to=aeroskop/main main
```

## Quick Pull (Most Common)

```bash
cd ~/aeroskop/aeroskop && git pull origin main
```

