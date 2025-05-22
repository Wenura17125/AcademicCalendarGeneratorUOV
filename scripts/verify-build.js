// Build verification script for Netlify deployment
// Run with: node scripts/verify-build.js

import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('🔍 Verifying build for Netlify deployment...');

try {
  // Check if netlify.toml exists
  if (fs.existsSync(path.join(process.cwd(), 'netlify.toml'))) {
    console.log('✅ netlify.toml found');
  } else {
    console.error('❌ netlify.toml not found');
    process.exit(1);
  }

  // Check if _redirects exists
  if (fs.existsSync(path.join(process.cwd(), 'public', '_redirects'))) {
    console.log('✅ public/_redirects found');
  } else {
    console.error('❌ public/_redirects not found');
    process.exit(1);
  }

  // Run a test build
  console.log('🏗️ Running test build...');
  execSync('npm run build:netlify', { stdio: 'inherit' });

  // Check if dist directory was created
  if (fs.existsSync(path.join(process.cwd(), 'dist'))) {
    console.log('✅ Build successful - dist directory created');
  } else {
    console.error('❌ Build failed - dist directory not found');
    process.exit(1);
  }

  // Check if index.html exists in dist
  if (fs.existsSync(path.join(process.cwd(), 'dist', 'index.html'))) {
    console.log('✅ index.html found in dist directory');
  } else {
    console.error('❌ index.html not found in dist directory');
    process.exit(1);
  }

  console.log('\n🎉 Verification complete! Your project is ready for Netlify deployment.');
  console.log('📝 See NETLIFY-DEPLOYMENT.md for deployment instructions.');
} catch (error) {
  console.error('❌ Verification failed:', error.message);
  process.exit(1);
}