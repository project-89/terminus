#!/usr/bin/env npx tsx

/**
 * Interactive CLI tester for Project 89
 * Run with: npx tsx scripts/test-game.ts
 */

import * as readline from 'readline';

const BASE_URL = process.env.P89_URL || 'http://localhost:8889';
let sessionId: string | null = null;
let handle = `test_${Date.now()}`;

async function api(endpoint: string, method = 'GET', body?: any) {
  const res = await fetch(`${BASE_URL}${endpoint}`, {
    method,
    headers: { 'Content-Type': 'application/json' },
    body: body ? JSON.stringify(body) : undefined,
  });
  return res.json();
}

async function cli(command: string) {
  if (!sessionId) {
    console.log('No session. Creating one...');
    await createSession();
  }
  const result = await api('/api/project89cli', 'POST', { command, sessionId });
  if (result.output) {
    console.log('\n' + result.output);
  } else if (result.error) {
    console.log('\n[ERROR]', result.error);
  }
  return result;
}

async function createSession() {
  const result = await api('/api/session', 'POST', { handle, reset: true });
  if (result.sessionId) {
    sessionId = result.sessionId;
    console.log(`\n[SESSION CREATED] ${sessionId}`);
    console.log(`[HANDLE] ${handle}`);
  } else {
    console.log('[ERROR] Failed to create session:', result);
  }
}

async function testAdventure(message: string) {
  if (!sessionId) await createSession();
  
  console.log('\n[SENDING TO ADVENTURE API]', message);
  
  const res = await fetch(`${BASE_URL}/api/adventure`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      messages: [{ role: 'user', content: message }],
      sessionId,
      handle,
    }),
  });
  
  // Read stream
  const reader = res.body?.getReader();
  const decoder = new TextDecoder();
  let fullText = '';
  
  if (reader) {
    console.log('\n[LOGOS RESPONSE]');
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      const chunk = decoder.decode(value, { stream: true });
      process.stdout.write(chunk);
      fullText += chunk;
    }
    console.log('\n');
  }
  
  return fullText;
}

async function runTests() {
  console.log('='.repeat(60));
  console.log('PROJECT 89 TERMINUS - TEST SUITE');
  console.log('='.repeat(60));
  
  // Test 1: Create session
  console.log('\n[TEST 1] Creating session...');
  await createSession();
  
  // Test 2: Check status
  console.log('\n[TEST 2] Checking status...');
  await cli('status');
  
  // Test 3: View profile
  console.log('\n[TEST 3] Viewing profile...');
  await cli('profile');
  
  // Test 4: Request mission
  console.log('\n[TEST 4] Requesting mission...');
  await cli('mission');
  
  // Test 5: Help
  console.log('\n[TEST 5] Help command...');
  await cli('help');
  
  console.log('\n' + '='.repeat(60));
  console.log('TESTS COMPLETE');
  console.log('='.repeat(60));
}

async function interactive() {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });
  
  console.log('\n='.repeat(60));
  console.log('PROJECT 89 TERMINUS - INTERACTIVE MODE');
  console.log('='.repeat(60));
  console.log('\nCommands:');
  console.log('  help, status, mission, report <text>, profile, reset');
  console.log('  !adventure <message> - Send to AI adventure endpoint');
  console.log('  !test - Run automated tests');
  console.log('  exit - Quit\n');
  
  await createSession();
  
  const prompt = () => {
    rl.question('\n> ', async (input) => {
      const trimmed = input.trim();
      
      if (trimmed === 'exit' || trimmed === 'quit') {
        console.log('Disconnecting from Protocol 89...');
        rl.close();
        process.exit(0);
      }
      
      if (trimmed === '!test') {
        await runTests();
      } else if (trimmed.startsWith('!adventure ')) {
        await testAdventure(trimmed.slice(11));
      } else if (trimmed) {
        await cli(trimmed);
      }
      
      prompt();
    });
  };
  
  prompt();
}

// Check for --test flag
if (process.argv.includes('--test')) {
  runTests().then(() => process.exit(0)).catch(console.error);
} else {
  interactive().catch(console.error);
}
