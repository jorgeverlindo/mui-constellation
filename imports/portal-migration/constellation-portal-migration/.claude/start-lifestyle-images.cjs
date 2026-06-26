#!/usr/bin/env node
// Starts the lifestyle-images Next.js server from its own directory.
const { spawn } = require('child_process');
const path = require('path');

const cwd = path.resolve(__dirname, '../../constellation/lifestyle-images');
const next = path.join(cwd, 'node_modules/.bin/next');

const child = spawn(next, ['dev', '--port', '3000'], {
  cwd,
  stdio: 'inherit',
  env: { ...process.env },
});

child.on('exit', code => process.exit(code ?? 0));
