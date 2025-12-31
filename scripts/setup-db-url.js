#!/usr/bin/env node
const fs = require('fs');
const path = require('path');

const databaseUrl = process.env.DATABASE_URL || process.env.NETLIFY_DATABASE_URL;

if (!databaseUrl) {
  console.error('ERROR: Neither DATABASE_URL nor NETLIFY_DATABASE_URL is set');
  process.exit(1);
}

if (!process.env.DATABASE_URL && process.env.NETLIFY_DATABASE_URL) {
  console.log('Setting DATABASE_URL from NETLIFY_DATABASE_URL');
  process.env.DATABASE_URL = process.env.NETLIFY_DATABASE_URL;
}

const envPath = path.join(__dirname, '..', '.env.local');
const envContent = `DATABASE_URL="${databaseUrl}"\n`;

if (!fs.existsSync(envPath)) {
  fs.writeFileSync(envPath, envContent);
  console.log('Created .env.local with DATABASE_URL');
}

console.log('Database URL configured successfully');
