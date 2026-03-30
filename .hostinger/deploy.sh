#!/bin/bash
# Hostinger post-deployment script

# Build frontend (student)
cd frontend
npm install --production=false
npm run build

# Build admin
cd ../admin
npm install --production=false
npm run build

# Copy frontend dist to public_html root
cd ..
rm -rf public_html/assets public_html/admin 2>/dev/null || true
cp -r frontend/dist/* public_html/

# Create admin subfolder and copy admin dist
mkdir -p public_html/admin
cp -r admin/dist/* public_html/admin/

echo "Deployment complete!"
