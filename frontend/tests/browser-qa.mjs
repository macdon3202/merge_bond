import { spawn } from 'node:child_process';
import { existsSync, mkdirSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';

const project = resolve(import.meta.dirname, '..');
const chromeCandidates = [
  'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
  'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe',
];
const chrome = chromeCandidates.find(existsSync);
if (!chrome) throw new Error('Chrome is required for browser QA.');

const profile = join(tmpdir(), `mergebond-qa-${process.pid}`);
const screenshot = resolve(project, '..', 'artifacts', 'frontend-home.png');
mkdirSync(resolve(project, '..', 'artifacts'), { recursive: true });
const serverMode = process.env.QA_DEV === '1' ? [] : ['preview'];
const preview = spawn(process.execPath, [
  resolve(project, 'node_modules/vite/bin/vite.js'), ...serverMode, '--host', '127.0.0.1', '--port', '4173',
], { cwd: project, stdio: 'ignore' });
const browser = spawn(chrome, [
  '--headless=new', '--no-sandbox', '--disable-gpu', '--disable-extensions', '--no-first-run',
  '--remote-debugging-port=9227', `--user-data-dir=${profile}`, '--window-size=1440,1200', 'about:blank',
], { stdio: ['ignore', 'pipe', 'pipe'] });
let browserLog = '';
browser.stdout.on('data', (chunk) => { browserLog += chunk.toString(); });
browser.stderr.on('data', (chunk) => { browserLog += chunk.toString(); });

const delay = (ms) => new Promise((resolveDelay) => setTimeout(resolveDelay, ms));
async function waitFor(url, attempts = 80) {
  for (let i = 0; i < attempts; i += 1) {
    try { const response = await fetch(url); if (response.ok) return response; } catch {}
    await delay(100);
  }
  throw new Error(`Timed out waiting for ${url}`);
}

let socket;
try {
  await waitFor('http://127.0.0.1:4173/');
  try {
    await waitFor('http://127.0.0.1:9227/json/version');
  } catch (error) {
    throw new Error(`${error.message}; Chrome exit=${browser.exitCode}; ${browserLog.slice(-1000)}`);
  }
  const targetResponse = await fetch(
    `http://127.0.0.1:9227/json/new?${encodeURIComponent('http://127.0.0.1:4173/')}`,
    { method: 'PUT' },
  );
  const target = await targetResponse.json();
  socket = new WebSocket(target.webSocketDebuggerUrl);
  await new Promise((resolveOpen, reject) => {
    socket.addEventListener('open', resolveOpen, { once: true });
    socket.addEventListener('error', reject, { once: true });
  });
  let id = 0;
  const pending = new Map();
  const exceptions = [];
  socket.addEventListener('message', (event) => {
    const message = JSON.parse(event.data);
    if (message.id && pending.has(message.id)) {
      const { resolve: resolveCall, reject } = pending.get(message.id);
      pending.delete(message.id);
      if (message.error) reject(new Error(message.error.message)); else resolveCall(message.result);
    }
    if (message.method === 'Runtime.exceptionThrown') {
      const details = message.params.exceptionDetails;
      exceptions.push(details.exception?.description || details.text || 'Runtime exception');
    }
  });
  const call = (method, params = {}) => new Promise((resolveCall, reject) => {
    const callId = ++id;
    pending.set(callId, { resolve: resolveCall, reject });
    socket.send(JSON.stringify({ id: callId, method, params }));
  });
  await call('Page.enable');
  await call('Runtime.enable');
  await call('Page.navigate', { url: 'http://127.0.0.1:4173/' });
  await delay(2500);
  const evaluated = await call('Runtime.evaluate', {
    expression: `({text: document.body.innerText, width: document.documentElement.scrollWidth, height: document.documentElement.scrollHeight})`,
    returnByValue: true,
  });
  const page = evaluated.result.value;
  if (exceptions.length) throw new Error(`Browser runtime exceptions: ${exceptions.join('; ')}`);
  for (const marker of ['MergeBond', 'SPONSOR DESK', 'ACTIVE CONTRACT', '0x35C38...F8624', 'HOW IT WORKS']) {
    if (!page.text.includes(marker)) throw new Error(`Rendered page is missing: ${marker}; text=${JSON.stringify(page.text.slice(0, 500))}`);
  }
  await call('Runtime.evaluate', {
    expression: `(() => {
      const set = (input, value) => {
        const setter = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value').set;
        setter.call(input, value);
        input.dispatchEvent(new Event('input', { bubbles: true }));
      };
      set(document.querySelector('input[placeholder="Bounty ID"]'), '1');
      set(document.querySelector('input[placeholder="Claim ID"]'), '1');
      return true;
    })()`,
    returnByValue: true,
  });
  await delay(250);
  await call('Runtime.evaluate', {
    expression: `([...document.querySelectorAll('button')].find(button => button.textContent.trim() === 'Sync')).click()`,
    returnByValue: true,
  });
  await delay(4000);
  const reconciled = await call('Runtime.evaluate', { expression: 'document.body.innerText', returnByValue: true });
  for (const marker of ['Bounty #1', 'PAID', 'Claim #1', 'WINNER', 'Canonical state synchronized.']) {
    if (!reconciled.result.value.includes(marker)) throw new Error(`Live readback is missing: ${marker}; text=${JSON.stringify(reconciled.result.value.slice(-1200))}`);
  }
  const image = await call('Page.captureScreenshot', { format: 'png', captureBeyondViewport: false });
  writeFileSync(screenshot, Buffer.from(image.data, 'base64'));
  console.log(JSON.stringify({ ok: true, width: page.width, height: page.height, screenshot }, null, 2));
} finally {
  if (socket?.readyState === WebSocket.OPEN) socket.close();
  preview.kill();
  browser.kill();
  await delay(250);
  rmSync(profile, { recursive: true, force: true });
}
