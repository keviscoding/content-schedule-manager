#!/bin/bash

# Digital Ocean Droplet Deployment Script
# Run this on your droplet after initial setup

echo "🚀 Deploying Content Schedule Manager..."

# Update code
echo "📦 Pulling latest code..."
git pull origin main

# Install dependencies
echo "📚 Installing dependencies..."
npm run install:all

# Build backend
echo "🔨 Building backend..."
cd backend
npm run build

# Restart backend with PM2
echo "♻️  Restarting backend..."
pm2 restart content-schedule-api || pm2 start dist/index.js --name content-schedule-api

# Build frontend
echo "🎨 Building frontend..."
cd ../frontend
npm run build

# Restart Nginx
echo "🔄 Restarting Nginx..."
sudo systemctl restart nginx

echo "✅ Deployment complete!"
echo "🌐 Your app should be live at your domain"

# Show PM2 status
pm2 status
