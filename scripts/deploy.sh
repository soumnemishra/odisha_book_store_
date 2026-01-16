#!/bin/bash

# Deployment script for Odisha Book Store

echo "Starting deployment..."

# Build frontend
echo "Building frontend..."
cd frontend
npm install
npm run build
cd ..

# Build backend Docker image
echo "Building backend Docker image..."
docker build -t odisha-book-store-backend ./backend

# Start services with Docker Compose
echo "Starting services..."
docker-compose up -d

echo "Deployment complete!"

