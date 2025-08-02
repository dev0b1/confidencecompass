# Troubleshooting Guide - CSP & Favicon Issues

## 🚨 Common Issues & Solutions

### 1. CSP Error: "default-src 'none'"

**Problem:**
```
Content-Security-Policy: The page's settings blocked the loading of a resource (img-src) at https://your-domain/favicon.ico because it violates the following directive: "default-src 'none'"
```

**Solutions:**

#### Option A: Remove CSP Headers (Recommended for Development)
```typescript
// In server/index.ts - Only set CSP in production
if (process.env.NODE_ENV === 'production') {
  // CSP headers here
}
```

#### Option B: Disable CSP in Vite Config
```typescript
// In vite.config.ts - Remove CSP headers
server: {
  // No headers section
}
```

#### Option C: Add CSP Meta Tag to HTML
```html
<!-- In client/index.html -->
<meta http-equiv="Content-Security-Policy" content="">
```

### 2. Favicon Not Loading

**Problem:** Favicon.ico requests failing

**Solutions:**

#### Option A: Custom SVG Favicon
- File: `client/public/vite.svg`
- HTML: `<link rel="icon" type="image/svg+xml" href="/vite.svg" />`

#### Option B: Server Route Redirect
```typescript
// In server/index.ts
app.get('/favicon.ico', (req, res) => {
  res.redirect('/vite.svg');
});
```

#### Option C: Static File Serving
```typescript
// In server/index.ts
app.use('/vite.svg', express.static(path.join(process.cwd(), 'client', 'public', 'vite.svg')));
```

### 3. Package.json Script Issues

**Problem:** `start-dev.js` not found

**Solution:** Create the missing file:
```javascript
// start-dev.js
#!/usr/bin/env node
const { spawn } = require('child_process');

console.log('🚀 Starting development servers...');

const server = spawn('npx', ['tsx', 'server/index.ts'], {
  stdio: 'inherit',
  cwd: process.cwd()
});

const client = spawn('npx', ['vite', '--port', '3000'], {
  stdio: 'inherit',
  cwd: process.cwd()
});

process.on('SIGINT', () => {
  server.kill('SIGINT');
  client.kill('SIGINT');
  process.exit(0);
});
```

## 🔧 Testing Steps

### 1. Test Favicon
```bash
# Start development servers
npm run dev:full

# Test favicon pages
http://localhost:3000/test-favicon.html
http://localhost:3000/no-csp.html
```

### 2. Check Console Errors
```bash
# Open browser dev tools
F12 → Console tab

# Look for:
# - CSP violations
# - Favicon loading errors
# - Network errors
```

### 3. Verify Environment
```bash
# Check environment variables
echo $NODE_ENV

# Should be 'development' for no CSP
# Should be 'production' for CSP enabled
```

## 🛠️ Quick Fixes

### Fix 1: Remove All CSP Headers
```typescript
// In vite.config.ts - Remove headers section
server: {
  fs: { strict: true, allow: ['..'] },
  hmr: { protocol: 'ws', host: 'localhost' }
  // No headers section
}
```

### Fix 2: Disable CSP in HTML
```html
<!-- In client/index.html -->
<meta http-equiv="Content-Security-Policy" content="">
```

### Fix 3: Use Different Favicon
```html
<!-- In client/index.html -->
<link rel="icon" href="data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><text y='.9em' font-size='90'>🎤</text></svg>">
```

## 📋 Checklist

### Before Starting
- [ ] `NODE_ENV=development` (no CSP)
- [ ] No CSP headers in vite.config.ts
- [ ] Favicon file exists: `client/public/vite.svg`
- [ ] start-dev.js file exists
- [ ] All dependencies installed: `npm install`

### After Starting
- [ ] No CSP errors in console
- [ ] Favicon displays in browser tab
- [ ] All pages load correctly
- [ ] Audio recording works
- [ ] API calls work

### If Issues Persist
- [ ] Clear browser cache
- [ ] Hard refresh (Ctrl+F5)
- [ ] Check network tab for blocked requests
- [ ] Try different browser
- [ ] Check firewall/antivirus settings

## 🎯 Environment-Specific Fixes

### Local Development
```bash
NODE_ENV=development npm run dev:full
```

### GitHub Codespaces
```bash
# Same as local, but access via Codespace URL
# https://your-codespace.app.github.dev:3000
```

### Production
```bash
NODE_ENV=production npm run build
NODE_ENV=production npm start
```

## 🚀 Alternative Approaches

### Approach 1: No CSP in Development
- ✅ Simplest solution
- ✅ Works everywhere
- ✅ No configuration needed
- ✅ Security in production only

### Approach 2: Permissive CSP
```typescript
"default-src 'self' 'unsafe-inline' 'unsafe-eval' data: blob:"
```

### Approach 3: Inline Favicon
```html
<link rel="icon" href="data:image/svg+xml,<svg>...</svg>">
```

---

**Try the "No CSP in Development" approach first - it's the most reliable solution! 🎉** 