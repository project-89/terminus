#!/usr/bin/env node

// Simple wrapper to run the MCP server with proper Node.js settings
const { spawn } = require('child_process');
const path = require('path');

// Set environment variables
process.env.P89_API_URL = process.env.P89_API_URL || 'http://localhost:8889';
process.env.P89_HANDLE = process.env.P89_HANDLE || `mcp_agent_${Date.now()}`;

// Path to the TypeScript MCP server
const serverPath = path.join(__dirname, 'scripts', 'mcp-server.ts');

// Run tsx with the server
const child = spawn('npx', ['tsx', serverPath], {
  stdio: 'inherit',
  env: process.env
});

child.on('error', (error) => {
  console.error('Failed to start MCP server:', error);
  process.exit(1);
});

child.on('exit', (code) => {
  process.exit(code || 0);
});