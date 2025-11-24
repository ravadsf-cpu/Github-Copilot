#!/bin/bash

# Google OAuth Setup Helper
# This script helps you add OAuth credentials to your .env file

echo "🔐 Google OAuth Setup Helper"
echo ""
echo "Please have your Google OAuth credentials ready."
echo "If you don't have them yet, visit:"
echo "https://console.cloud.google.com/apis/credentials"
echo ""

# Check if .env exists
ENV_FILE="/Users/adisanghavi/Github Copilot/cleary/.env"
if [ ! -f "$ENV_FILE" ]; then
    echo "❌ Error: .env file not found at $ENV_FILE"
    exit 1
fi

echo "Current OAuth configuration in .env:"
echo "---"
grep "GOOGLE_OAUTH" "$ENV_FILE"
echo "---"
echo ""

read -p "Do you want to update these values? (y/n): " answer

if [ "$answer" != "y" ]; then
    echo "Setup cancelled."
    exit 0
fi

echo ""
echo "Enter your Google OAuth Client ID:"
read -r client_id

echo "Enter your Google OAuth Client Secret:"
read -r client_secret

# Backup .env
cp "$ENV_FILE" "${ENV_FILE}.backup"
echo "✅ Backed up .env to .env.backup"

# Update .env
if [[ "$OSTYPE" == "darwin"* ]]; then
    # macOS
    sed -i '' "s|GOOGLE_OAUTH_CLIENT_ID=.*|GOOGLE_OAUTH_CLIENT_ID=${client_id}|" "$ENV_FILE"
    sed -i '' "s|GOOGLE_OAUTH_CLIENT_SECRET=.*|GOOGLE_OAUTH_CLIENT_SECRET=${client_secret}|" "$ENV_FILE"
else
    # Linux
    sed -i "s|GOOGLE_OAUTH_CLIENT_ID=.*|GOOGLE_OAUTH_CLIENT_ID=${client_id}|" "$ENV_FILE"
    sed -i "s|GOOGLE_OAUTH_CLIENT_SECRET=.*|GOOGLE_OAUTH_CLIENT_SECRET=${client_secret}|" "$ENV_FILE"
fi

echo ""
echo "✅ OAuth credentials updated in .env!"
echo ""
echo "Updated configuration:"
echo "---"
grep "GOOGLE_OAUTH" "$ENV_FILE"
echo "---"
echo ""
echo "🚀 Next steps:"
echo "1. Restart the backend server:"
echo "   cd /Users/adisanghavi/Github\\ Copilot/cleary && npm run server"
echo ""
echo "2. Start the frontend (in a new terminal):"
echo "   cd /Users/adisanghavi/Github\\ Copilot/cleary && npm start"
echo ""
echo "3. Test Google Sign-In at http://localhost:3000/login"
