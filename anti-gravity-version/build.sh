#!/bin/bash
set -euo pipefail

# Force Firebase disabled & prevent CI from treating warnings as errors
export REACT_APP_ENABLE_FIREBASE_AUTH=false
export CI=false

echo "[build] Starting Cleary build (Firebase disabled, CI=$CI)"
cd cleary
echo "[build] Installing app dependencies"
npm install --no-audit --no-fund
echo "[build] Running production build"
npm run build
echo "[build] Build complete"
