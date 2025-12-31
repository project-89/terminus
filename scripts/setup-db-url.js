#!/usr/bin/env node
const { execSync } = require('child_process');

const databaseUrl = process.env.DATABASE_URL || process.env.NETLIFY_DATABASE_URL;

if (!databaseUrl) {
  console.error('ERROR: Neither DATABASE_URL nor NETLIFY_DATABASE_URL is set');
  process.exit(1);
}

process.env.DATABASE_URL = databaseUrl;
console.log('DATABASE_URL configured from:', process.env.DATABASE_URL ? 'DATABASE_URL' : 'NETLIFY_DATABASE_URL');

const args = process.argv.slice(2);
if (args.length > 0) {
  const command = args.join(' ');
  console.log(`Running: ${command}`);
  try {
    execSync(command, { 
      stdio: 'inherit',
      env: { ...process.env, DATABASE_URL: databaseUrl }
    });
  } catch (error) {
    process.exit(error.status || 1);
  }
}
