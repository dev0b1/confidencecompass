#!/usr/bin/env node

import { spawn } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('🚀 Starting Confidence Compass development servers...\n');

// Start the backend server
const server = spawn('npx', ['tsx', 'server/index.ts'], {
  stdio: 'inherit',
  cwd: process.cwd()
});

// Start the frontend development server
const client = spawn('npx', ['vite', '--port', '3000'], {
  stdio: 'inherit',
  cwd: process.cwd()
});

// Handle process termination
process.on('SIGINT', () => {
  console.log('\n🛑 Shutting down development servers...');
  server.kill('SIGINT');
  client.kill('SIGINT');
  process.exit(0);
});

process.on('SIGTERM', () => {
  console.log('\n🛑 Shutting down development servers...');
  server.kill('SIGTERM');
  client.kill('SIGTERM');
  process.exit(0);
});

// Handle server errors
server.on('error', (err) => {
  console.error('❌ Backend server error:', err);
  process.exit(1);
});

client.on('error', (err) => {
  console.error('❌ Frontend server error:', err);
  process.exit(1);
});

console.log('✅ Development servers started!');
console.log('📱 Frontend: http://localhost:3000');
console.log('🔧 Backend: http://localhost:5000');
console.log('🛑 Press Ctrl+C to stop both servers\n'); 