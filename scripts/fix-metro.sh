#!/bin/bash

# Metro Bundling Fix Script
echo "🔧 Fixing Metro bundling issues..."

# Clear all caches
echo "📦 Clearing Metro cache..."
npx expo start --clear &
sleep 2
pkill -f "expo start" 2>/dev/null

echo "🧹 Clearing npm cache..."
npm cache clean --force

echo "📱 Clearing Expo cache..."
npx expo install --fix

# Check for common issues
echo "🔍 Checking for common issues..."

# Check if zustand is properly installed
if ! npm list zustand > /dev/null 2>&1; then
    echo "❌ Zustand not found, reinstalling..."
    npm install zustand
fi

# Check if babel plugin is installed
if ! npm list babel-plugin-module-resolver > /dev/null 2>&1; then
    echo "❌ Babel module resolver not found, installing..."
    npm install --save-dev babel-plugin-module-resolver
fi

# Validate syntax of key files
echo "✅ Validating syntax..."
node -c MainApp.js && echo "✅ MainApp.js syntax OK" || echo "❌ MainApp.js syntax error"
node -c stores/useAppStore.js && echo "✅ useAppStore.js syntax OK" || echo "❌ useAppStore.js syntax error"
node -c components/ErrorHandling/ErrorBoundary.js && echo "✅ ErrorBoundary.js syntax OK" || echo "❌ ErrorBoundary.js syntax error"

echo "🎉 Metro fix complete! Try running 'npm start' now."
