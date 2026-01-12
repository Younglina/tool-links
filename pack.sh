#!/bin/bash
echo "Building..."
npx vite build

echo "Copying extension files..."
cp manifest.json dist/
cp background.js dist/

echo "Done! Extension files in dist/"
ls -la dist/manifest.json dist/background.js
