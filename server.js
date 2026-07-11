#!/usr/bin/env node
/* ============================================================
   KRL // VFX  —  tiny zero-dependency local server + remote bus
   ------------------------------------------------------------
   • Serves the visuals (index.html) and the phone remote (remote.html)
     to any device on your local Wi-Fi.
   • Relays control messages between the phone and the visuals over
     Server-Sent Events (SSE) — a POST from the remote is fanned out
     to the visuals page, and status from the visuals is fanned out
     back to every connected phone.
   • No npm install, no cloud, no account, no internet. Pure Node.

   Run it:   node server.js
   ============================================================ */

const http = require('http');
const fs   = require('fs');
const path = require('path');
const os   = require('os');

const PORT = process.env.PORT ? Number(process.env.PORT) : 8123;
const ROOT = __dirname;
const LOG_DIR = path.join(ROOT, 'logs');
const BOOT_LOG_FILE = path.join(LOG_DIR, 'krl-vfx-browser.log');

const MIME = {
  '.html':'text/html; charset=utf-8',
  '.js'  :'text/javascript; charset=utf-8',
  '.css' :'text/css; charset=utf-8',
  '.png' :'image/png',
  '.jpg' :'image/jpeg',
  '.jpeg':'image/jpeg',
  '.gif' :'image/gif',
  '.svg' :'image/svg+xml',
  '.ico' :'image/x-icon',
  '.ttf' :'font/ttf',
  '.otf' :'font/otf',
  '.woff':'font/woff',
  '.woff2':'font/woff2',
  '.json':'application/json; charset=utf-8',
  '.txt' :'text/plain; charset=utf-8'
};

const clients = new Set();   // open SSE responses = the live message bus
let lastStatus = null;       // newest status frame, so a fresh phone syncs instantly

function broadcast(payload){
  const frame = `data: ${payload}\n\n`;
  for(const res of clients){
    try { res.write(frame); } catch(_){ /* cleaned up on its own 'close' */ }
  }
}

function appendBootLog(req, payload){
  fs.mkdirSync(LOG_DIR, { recursive:true });
  const ip = (req.socket && req.socket.remoteAddress) || 'unknown';
  const record = {
    serverTime: new Date().toISOString(),
    ip,
    payload
  };
  fs.appendFileSync(BOOT_LOG_FILE, JSON.stringify(record) + '\n', 'utf8');
}

const server = http.createServer((req, res) => {
  const url = new URL(req.url, `http://${req.headers.host || '127.0.0.1'}`);
  const pathname = decodeURIComponent(url.pathname);

  /* ---- browser boot/crash diagnostics ---- */
  if(pathname === '/boot-log'){
    if(req.method === 'OPTIONS'){
      res.writeHead(204, {
        'Access-Control-Allow-Origin':'*',
        'Access-Control-Allow-Methods':'POST, OPTIONS',
        'Access-Control-Allow-Headers':'Content-Type'
      });
      res.end();
      return;
    }
    if(req.method === 'POST'){
      let body = '';
      req.on('data', c => { body += c; if(body.length > 512 * 1024) req.destroy(); });
      req.on('end', () => {
        try {
          appendBootLog(req, JSON.parse(body));
          res.writeHead(204, {'Access-Control-Allow-Origin':'*'});
        } catch(err){
          res.writeHead(400, {'Content-Type':'text/plain; charset=utf-8', 'Access-Control-Allow-Origin':'*'});
          res.end('bad log payload');
          return;
        }
        res.end();
      });
      return;
    }
    res.writeHead(405); res.end(); return;
  }

  /* ---- control message bus (Server-Sent Events) ---- */
  if(pathname === '/bus'){
    if(req.method === 'GET'){
      res.writeHead(200, {
        'Content-Type':'text/event-stream',
        'Cache-Control':'no-cache, no-transform',
        'Connection':'keep-alive',
        'Access-Control-Allow-Origin':'*'
      });
      res.write(': connected\n\n');
      if(lastStatus) res.write(`data: ${lastStatus}\n\n`);   // instant sync for new phones
      clients.add(res);
      const ping = setInterval(() => { try { res.write(': ping\n\n'); } catch(_){} }, 25000);
      req.on('close', () => { clearInterval(ping); clients.delete(res); });
      return;
    }
    if(req.method === 'POST'){
      let body = '';
      req.on('data', c => { body += c; if(body.length > 1e6) req.destroy(); });
      req.on('end', () => {
        try {
          const msg = JSON.parse(body);
          if(msg && msg.type === 'status') lastStatus = body;
          broadcast(body);
        } catch(_){ /* ignore malformed frames */ }
        res.writeHead(204, {'Access-Control-Allow-Origin':'*'});
        res.end();
      });
      return;
    }
    res.writeHead(405); res.end(); return;
  }

  /* ---- static files ---- */
  const rel = pathname === '/' ? '/index.html' : pathname;
  const filePath = path.normalize(path.join(ROOT, rel));
  if(filePath !== ROOT && !filePath.startsWith(ROOT + path.sep)){
    res.writeHead(403); res.end('forbidden'); return;
  }
  fs.readFile(filePath, (err, data) => {
    if(err){ res.writeHead(404, {'Content-Type':'text/plain'}); res.end('not found'); return; }
    const ext = path.extname(filePath).toLowerCase();
    res.writeHead(200, {'Content-Type': MIME[ext] || 'application/octet-stream'});
    res.end(data);
  });
});

server.listen(PORT, '0.0.0.0', () => {
  const nets = os.networkInterfaces();
  const ips = [];
  for(const name of Object.keys(nets)){
    for(const ni of nets[name] || []){
      if(ni.family === 'IPv4' && !ni.internal) ips.push(ni.address);
    }
  }
  console.log('\n  KRL // VFX  —  local server running');
  console.log('  -----------------------------------');
  console.log(`  Visuals (this computer):  http://127.0.0.1:${PORT}/index.html`);
  console.log(`  Browser crash log:        ${BOOT_LOG_FILE}`);
  if(ips.length){
    console.log('\n  Phone remote (same Wi-Fi) — open on your phone:');
    for(const ip of ips) console.log(`     http://${ip}:${PORT}/remote.html`);
  } else {
    console.log('\n  (No LAN IP found — join Wi-Fi, then restart to see the phone URL.)');
  }
  console.log('\n  Press Ctrl+C to stop.\n');
});
