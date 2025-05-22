#!/usr/bin/env node

/**
 * Enhanced Build Verification Script for Netlify Deployment
 * 
 * This script performs comprehensive checks to ensure your project
 * is properly configured for Netlify deployment.
 * 
 * Run with: node scripts/verify-build.cjs
 * Run with fix mode: node scripts/verify-build.cjs --fix
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// Parse command line arguments
const args = process.argv.slice(2);
const shouldFix = args.includes('--fix');

// ANSI color codes for terminal output
const COLORS = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
  magenta: '\x1b[35m',
};

// Emoji indicators
const EMOJI = {
  check: '✅',
  error: '❌',
  warning: '⚠️',
  info: 'ℹ️',
  build: '🏗️',
  verify: '🔍',
  success: '🎉',
  docs: '📝',
  fix: '🔧',
};

// Logging utilities
const log = {
  info: (msg) => console.log(`${COLORS.blue}${EMOJI.info} ${msg}${COLORS.reset}`),
  success: (msg) => console.log(`${COLORS.green}${EMOJI.check} ${msg}${COLORS.reset}`),
  warning: (msg) => console.log(`${COLORS.yellow}${EMOJI.warning} ${msg}${COLORS.reset}`),
  error: (msg) => console.log(`${COLORS.red}${EMOJI.error} ${msg}${COLORS.reset}`),
  section: (msg) => console.log(`\n${COLORS.cyan}${EMOJI.verify} ${msg}${COLORS.reset}`),
  build: (msg) => console.log(`${COLORS.magenta}${EMOJI.build} ${msg}${COLORS.reset}`),
  fix: (msg) => console.log(`${COLORS.cyan}${EMOJI.fix} ${msg}${COLORS.reset}`),
};

// Project paths
const ROOT_DIR = process.cwd();
const NETLIFY_TOML_PATH = path.join(ROOT_DIR, 'netlify.toml');
const NEXT_CONFIG_PATH = path.join(ROOT_DIR, 'next.config.js');
const PACKAGE_JSON_PATH = path.join(ROOT_DIR, 'package.json');
const REDIRECTS_PATH = path.join(ROOT_DIR, 'public', '_redirects');
const ENV_PATH = path.join(ROOT_DIR, '.env');
const ENV_EXAMPLE_PATH = path.join(ROOT_DIR, '.env.example');
const DIST_DIR = path.join(ROOT_DIR, 'dist');

// Track issues for summary
const issues = {
  errors: [],
  warnings: [],
  fixes: [],
};

// Helper functions
function fileExists(filePath) {
  return fs.existsSync(filePath);
}

function readJsonFile(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    return JSON.parse(content);
  } catch (error) {
    log.error(`Failed to read or parse ${filePath}: ${error.message}`);
    issues.errors.push(`Failed to read or parse ${filePath}: ${error.message}`);
    return null;
  }
}

function readTextFile(filePath) {
  try {
    return fs.readFileSync(filePath, 'utf8');
  } catch (error) {
    log.error(`Failed to read ${filePath}: ${error.message}`);
    issues.errors.push(`Failed to read ${filePath}: ${error.message}`);
    return null;
  }
}

function createFileIfNotExists(filePath, content) {
  if (!fileExists(filePath)) {
    try {
      const dir = path.dirname(filePath);
      if (!fileExists(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
      fs.writeFileSync(filePath, content);
      log.fix(`Created ${filePath}`);
      issues.fixes.push(`Created ${filePath}`);
      return true;
    } catch (error) {
      log.error(`Failed to create ${filePath}: ${error.message}`);
      issues.errors.push(`Failed to create ${filePath}: ${error.message}`);
      return false;
    }
  }
  return false;
}

// Check functions
function checkNetlifyToml() {
  log.section('Checking netlify.toml configuration');
  
  if (!fileExists(NETLIFY_TOML_PATH)) {
    log.error('netlify.toml file not found');
    issues.errors.push('netlify.toml file not found');
    
    if (shouldFix) {
      const basicNetlifyToml = `[build]
  command = "npm run build:netlify"
  publish = "dist"

[build.environment]
  NETLIFY_NEXT_PLUGIN_SKIP = "true"

[[plugins]]
  package = "@netlify/plugin-nextjs"
`;
      
      if (createFileIfNotExists(NETLIFY_TOML_PATH, basicNetlifyToml)) {
        log.success('Created basic netlify.toml file');
      }
    } else {
      log.info('Run with --fix to create a basic netlify.toml file');
    }
    return false;
  }
  
  log.success('netlify.toml file found');
  return true;
}

function checkRedirects() {
  log.section('Checking redirects configuration');
  
  if (!fileExists(REDIRECTS_PATH)) {
    log.error('public/_redirects file not found');
    issues.errors.push('public/_redirects file not found');
    
    if (shouldFix) {
      const basicRedirects = `# Netlify redirects file
# This ensures that all routes are handled by the Next.js application
/*    /index.html   200
`;
      
      if (createFileIfNotExists(REDIRECTS_PATH, basicRedirects)) {
        log.success('Created basic _redirects file');
      }
    } else {
      log.info('Run with --fix to create a basic _redirects file');
    }
    return false;
  }
  
  log.success('public/_redirects file found');
  return true;
}

function checkEnvironmentVariables() {
  log.section('Checking environment variables');
  
  // Check if .env.example exists
  if (!fileExists(ENV_EXAMPLE_PATH)) {
    log.warning('.env.example file not found - this is recommended for documenting required environment variables');
    issues.warnings.push('.env.example file not found');
  } else {
    log.success('.env.example file found');
    
    // Check if .env exists
    if (!fileExists(ENV_PATH)) {
      log.warning('.env file not found - make sure to set up environment variables in Netlify dashboard');
      issues.warnings.push('.env file not found');
    } else {
      log.success('.env file found');
      
      // Compare .env with .env.example to check for missing variables
      const envExample = readTextFile(ENV_EXAMPLE_PATH);
      const env = readTextFile(ENV_PATH);
      
      if (envExample && env) {
        const exampleVars = envExample.split('\n')
          .filter(line => line.trim() && !line.startsWith('#'))
          .map(line => line.split('=')[0]);
        
        const envVars = env.split('\n')
          .filter(line => line.trim() && !line.startsWith('#'))
          .map(line => line.split('=')[0]);
        
        const missingVars = exampleVars.filter(v => !envVars.includes(v));
        
        if (missingVars.length > 0) {
          log.warning(`Missing environment variables: ${missingVars.join(', ')}`);
          issues.warnings.push(`Missing environment variables: ${missingVars.join(', ')}`);
          log.info('Make sure to set these variables in your Netlify dashboard');
        } else {
          log.success('All required environment variables are set');
        }
      }
    }
  }
  
  return true; // Non-critical check
}

function checkPackageJson() {
  log.section('Checking package.json configuration');
  
  if (!fileExists(PACKAGE_JSON_PATH)) {
    log.error('package.json file not found');
    issues.errors.push('package.json file not found');
    return false;
  }
  
  const packageJson = readJsonFile(PACKAGE_JSON_PATH);
  if (!packageJson) return false;
  
  // Check for build:netlify script
  if (!packageJson.scripts || !packageJson.scripts['build:netlify']) {
    log.error('No build:netlify script found in package.json');
    issues.errors.push('No build:netlify script found in package.json');
    
    if (shouldFix && packageJson.scripts) {
      packageJson.scripts['build:netlify'] = 'next build && next export';
      try {
        fs.writeFileSync(PACKAGE_JSON_PATH, JSON.stringify(packageJson, null, 2));
        log.fix('Added build:netlify script to package.json');
        issues.fixes.push('Added build:netlify script to package.json');
      } catch (error) {
        log.error(`Failed to update package.json: ${error.message}`);
        issues.errors.push(`Failed to update package.json: ${error.message}`);
      }
    } else {
      log.info('Run with --fix to add a build:netlify script to package.json');
    }
    return false;
  }
  
  log.success('build:netlify script found in package.json');
  
  // Check for Next.js dependency
  if (!packageJson.dependencies || !packageJson.dependencies.next) {
    log.error('Next.js dependency not found in package.json');
    issues.errors.push('Next.js dependency not found in package.json');
    return false;
  }
  
  log.success('Next.js dependency found in package.json');
  return true;
}

function checkNextConfig() {
  log.section('Checking Next.js configuration');
  
  if (!fileExists(NEXT_CONFIG_PATH)) {
    log.warning('next.config.js file not found - this may be needed for proper Netlify deployment');
    issues.warnings.push('next.config.js file not found');
    return true; // Non-critical check
  }
  
  const content = readTextFile(NEXT_CONFIG_PATH);
  if (!content) return true; // Non-critical check
  
  // Check for static export configuration
  if (!content.includes('output:') && shouldFix) {
    try {
      // Simple string replacement - in a real scenario, you'd want to use an AST parser
      const updatedConfig = content.replace(
        'module.exports = {', 
        'module.exports = {\n  output: "export",'
      );
      
      fs.writeFileSync(NEXT_CONFIG_PATH, updatedConfig);
      log.fix('Added output: "export" to next.config.js');
      issues.fixes.push('Added output: "export" to next.config.js');
    } catch (error) {
      log.error(`Failed to update next.config.js: ${error.message}`);
      issues.errors.push(`Failed to update next.config.js: ${error.message}`);
    }
  } else if (!content.includes('output:')) {
    log.warning('Static export configuration (output: "export") not found in next.config.js');
    issues.warnings.push('Static export configuration not found in next.config.js');
    log.info('Run with --fix to add static export configuration');
  } else {
    log.success('Next.js configuration looks good for Netlify deployment');
  }
  
  return true; // Non-critical check
}

function runTestBuild() {
  log.section('Running test build');
  
  try {
    log.build('Executing npm run build:netlify...');
    execSync('npm run build:netlify', { stdio: 'inherit' });
    
    // Check if dist directory was created
    if (!fileExists(DIST_DIR)) {
      log.error('Build failed - dist directory not found');
      issues.errors.push('Build failed - dist directory not found');
      return false;
    }
    
    log.success('Build successful - dist directory created');
    
    // Check if index.html exists in dist
    if (!fileExists(path.join(DIST_DIR, 'index.html'))) {
      log.error('index.html not found in dist directory');
      issues.errors.push('index.html not found in dist directory');
      return false;
    }
    
    log.success('index.html found in dist directory');
    return true;
  } catch (error) {
    log.error(`Build command failed: ${error.message}`);
    issues.errors.push(`Build command failed: ${error.message}`);
    return false;
  }
}

// Main verification function
async function verifyBuild() {
  console.log(`\n${COLORS.cyan}${EMOJI.verify} ${COLORS.magenta}Verifying build for Netlify deployment...${COLORS.reset}\n`);
  
  if (shouldFix) {
    log.info('Running in fix mode - will attempt to fix issues automatically');
  }
  
  // Run all checks
  const netlifyTomlOk = checkNetlifyToml();
  const redirectsOk = checkRedirects();
  const packageJsonOk = checkPackageJson();
  checkNextConfig(); // Non-critical check
  checkEnvironmentVariables(); // Non-critical check
  
  // Only run the build if critical checks pass
  let buildOk = false;
  if (netlifyTomlOk && redirectsOk && packageJsonOk) {
    buildOk = runTestBuild();
  } else {
    log.warning('Skipping build test due to critical configuration issues');
  }
  
  // Print summary
  console.log('\n' + '-'.repeat(80));
  console.log(`${COLORS.cyan}${EMOJI.verify} VERIFICATION SUMMARY${COLORS.reset}`);
  console.log('-'.repeat(80));
  
  if (issues.errors.length === 0 && issues.warnings.length === 0) {
    console.log(`\n${COLORS.green}${EMOJI.success} All checks passed! Your project is ready for Netlify deployment.${COLORS.reset}`);
  } else {
    if (issues.errors.length > 0) {
      console.log(`\n${COLORS.red}${EMOJI.error} Errors (${issues.errors.length}):${COLORS.reset}`);
      issues.errors.forEach((error, i) => {
        console.log(`  ${i + 1}. ${error}`);
      });
    }
    
    if (issues.warnings.length > 0) {
      console.log(`\n${COLORS.yellow}${EMOJI.warning} Warnings (${issues.warnings.length}):${COLORS.reset}`);
      issues.warnings.forEach((warning, i) => {
        console.log(`  ${i + 1}. ${warning}`);
      });
    }
    
    if (issues.fixes.length > 0) {
      console.log(`\n${COLORS.cyan}${EMOJI.fix} Applied Fixes (${issues.fixes.length}):${COLORS.reset}`);
      issues.fixes.forEach((fix, i) => {
        console.log(`  ${i + 1}. ${fix}`);
      });
    }
    
    if (issues.errors.length > 0) {
      console.log(`\n${COLORS.red}Please fix the errors before deploying to Netlify.${COLORS.reset}`);
      if (!shouldFix) {
        console.log(`${COLORS.cyan}Run with --fix flag to attempt automatic fixes: node scripts/verify-build.cjs --fix${COLORS.reset}`);
      }
    } else if (buildOk) {
      console.log(`\n${COLORS.green}${EMOJI.success} Your project is ready for Netlify deployment despite warnings.${COLORS.reset}`);
    }
  }
  
  console.log(`\n${COLORS.blue}${EMOJI.docs} See NETLIFY-DEPLOYMENT.md for detailed deployment instructions.${COLORS.reset}`);
  console.log('-'.repeat(80) + '\n');
  
  // Exit with appropriate code
  if (issues.errors.length > 0) {
    process.exit(1);
  }
}

// Run the verification
verifyBuild().catch(error => {
  console.error(`${COLORS.red}${EMOJI.error} Unexpected error:${COLORS.reset}`, error);
  process.exit(1);
});