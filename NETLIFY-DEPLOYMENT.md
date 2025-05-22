# Netlify Deployment Guide

This document provides information about the Netlify deployment configuration for this Next.js project.

## Configuration Overview

The project is configured for optimal deployment on Netlify with the following features:

- **Next.js Integration**: Using the official `@netlify/plugin-nextjs` plugin with image optimization enabled
- **Build Optimization**: Configured for fast and reliable builds
- **Image Handling**: Support for remote images from Unsplash and other domains
- **Security Headers**: Comprehensive security headers for all routes
- **Caching Strategy**: Optimized caching for static assets

## Key Configuration Files

### netlify.toml

The `netlify.toml` file contains the main configuration for Netlify deployment:

```toml
[build]
  command = "npm ci && npm run build"
  publish = ".next"
  ignore = "git diff --quiet HEAD^ HEAD ." # Skip build if no changes

[build.environment]
  NODE_VERSION = "20"
  NEXT_TELEMETRY_DISABLED = "1" # Disable telemetry for faster builds
  NPM_FLAGS = "--prefer-offline --no-audit --no-fund" # Use cache and speed up npm install
  NETLIFY_USE_YARN = "false" # Explicitly use npm
  NEXT_SHARP_PATH = "/tmp/node_modules/sharp" # Optimize image processing
```

### next.config.js

The `next.config.js` file is configured to work with Netlify's image optimization:

```js
images: {
  domains: [
    "source.unsplash.com",
    "images.unsplash.com",
    "ext.same-assets.com",
    "ugc.same-assets.com",
  ],
  remotePatterns: [
    // Remote patterns configuration
  ],
}
```

## Verification

A verification script is included to check your Netlify deployment configuration:

```bash
npm run verify-netlify
```

This script checks:

1. The presence and correctness of `netlify.toml`
2. Compatibility of `next.config.js` with Netlify
3. Required dependencies and scripts in `package.json`
4. Build command functionality

## Deployment Process

1. Commit and push your changes to your repository
2. Connect your repository to Netlify
3. Configure the build settings (should be auto-detected from `netlify.toml`)
4. Deploy your site

# Netlify Deployment Guide
## Troubleshooting

If you encounter issues during deployment:

1. Check the Netlify build logs for specific errors
2. Run the verification script to identify configuration issues: `node scripts/verify-netlify-deploy.js`
3. To automatically fix common issues, run: `node scripts/verify-netlify-deploy.js --fix`
4. Ensure your Next.js version is compatible with the Netlify Next.js plugin

### Common Issues

#### Plugin Configuration Error

If you see an error like: `Plugin "@netlify/plugin-nextjs" does not accept any inputs`

**Solution**: Remove the `[plugins.inputs]` section from your `netlify.toml` file. As of version 5.11.2, the Next.js plugin doesn't accept direct inputs and is configured automatically.

```toml
# Correct configuration
[[plugins]]
  package = "@netlify/plugin-nextjs"
  # No inputs section needed
```

#### Other Common Issues

1. Verify that all remote image domains are properly configured in both `netlify.toml` and `next.config.js`
2. Remove deprecated or unrecognized options from `next.config.js` (e.g., `swcMinify` is no longer needed in newer Next.js versions)
3. Install missing TypeScript declaration files for third-party packages (e.g., `npm install --save-dev @types/file-saver`)
4. ESLint errors may not prevent deployment but should be addressed for code quality

## Performance Optimizations

The current configuration includes several performance optimizations:

- Image optimization and compression
- CSS and JS bundling and minification
- Appropriate caching headers for static assets
- API route handling via Netlify Functions

## Security

Security headers are configured for all routes to provide protection against common web vulnerabilities:

- XSS Protection
- Content Security Policy
- Frame options
- Referrer Policy
- Strict Transport Security