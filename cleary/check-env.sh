#!/bin/bash
# Firebase & OAuth Environment Checker

echo "🔍 Checking Firebase & Google OAuth configuration..."
echo ""

# Check for .env.local (frontend Firebase config)
if [ -f ".env.local" ]; then
  echo "✅ .env.local found"
  
  # Check for required Firebase vars
  if grep -q "REACT_APP_FIREBASE_API_KEY=" .env.local && \
     ! grep -q "REACT_APP_FIREBASE_API_KEY=your_firebase_api_key_here" .env.local; then
    echo "✅ Firebase API Key configured"
  else
    echo "❌ Firebase API Key missing or using template value"
    echo "   → Add REACT_APP_FIREBASE_API_KEY to .env.local"
  fi
  
  if grep -q "REACT_APP_FIREBASE_PROJECT_ID=" .env.local && \
     ! grep -q "REACT_APP_FIREBASE_PROJECT_ID=your-project-id" .env.local; then
    echo "✅ Firebase Project ID configured"
  else
    echo "❌ Firebase Project ID missing or using template value"
    echo "   → Add REACT_APP_FIREBASE_PROJECT_ID to .env.local"
  fi
  
else
  echo "❌ .env.local not found"
  echo "   → Copy .env.local.template to .env.local and fill in your Firebase config"
  echo "   → See FIREBASE_GOOGLE_AUTH_SETUP.md for step-by-step instructions"
fi

echo ""

# Check for .env (backend config)
if [ -f ".env" ]; then
  echo "✅ .env found (backend)"
  
  if grep -q "GEMINI_API_KEY=" .env && \
     ! grep -q "GEMINI_API_KEY=your_key" .env; then
    echo "✅ Gemini API Key configured"
  else
    echo "⚠️  Gemini API Key missing (AI features won't work)"
  fi
  
else
  echo "⚠️  .env not found (backend will use defaults)"
fi

echo ""
echo "📖 Next steps:"
echo "1. If Firebase vars are missing, follow: FIREBASE_GOOGLE_AUTH_SETUP.md"
echo "2. After adding .env.local, restart dev server: npm start"
echo "3. Test Google Sign-In at http://localhost:3000/login"
