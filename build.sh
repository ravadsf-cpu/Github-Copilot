#!/bin/bash
# Vercel build hook - ensures Firebase is disabled during build
export REACT_APP_ENABLE_FIREBASE_AUTH=false
cd cleary
npm install
npm run build
