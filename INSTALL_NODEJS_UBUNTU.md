# Install Node.js and npm on Ubuntu

## Quick Install (Recommended - Node.js 18)

```bash
# Update package list
sudo apt-get update

# Install Node.js 18.x
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Verify installation
node -v
npm -v
```

## Alternative: Install Node.js 20.x

```bash
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs

# Verify
node -v
npm -v
```

## Alternative: Using apt (Ubuntu default)

```bash
sudo apt-get update
sudo apt-get install -y nodejs npm

# Verify
node -v
npm -v
```

## After Installation - Complete Setup

```bash
# Navigate to project
cd ~/aeroskop/aeroskop

# Install dependencies
npm install

# Continue with PM2 setup...
```

