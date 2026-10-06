// Chrome из профиля Playwright-MCP (с входами Дениса) + локальный сервер задач.
// POST http://127.0.0.1:9444/run  тело: путь к .js, экспортирующему async (page, ctx, out) => result
// Ответ: JSON результата или {error}. Скриншоты — _tools/shots/.
const http = require('http'), fs = require('fs'), path = require('path');
const { chromium } = require(process.env.PWCORE);
const profile = path.join(process.env.LOCALAPPDATA, 'ms-playwright-mcp', 'mcp-chrome-69b27b7');
const shotsDir = path.join(__dirname, 'shots'); fs.mkdirSync(shotsDir, { recursive: true });

(async () => {
  const ctx = await chromium.launchPersistentContext(profile, {
    channel: 'chrome', headless: false, viewport: null,
    args: ['--window-size=1400,950'], ignoreDefaultArgs: ['--enable-automation'],
  });
  let page = ctx.pages()[0] || await ctx.newPage();
  const out = {
    shot: async (name, p = page, full = false) => {
      const f = path.join(shotsDir, name + '.png');
      try { await p.bringToFront(); await p.screenshot({ path: f, fullPage: full, timeout: 20000, animations: 'disabled' }); return f; }
      catch (e) { return 'shot failed: ' + String(e.message).slice(0, 120); }
    },
    save: (name, data) => { const f = path.join(shotsDir, name); fs.writeFileSync(f, typeof data === 'string' ? data : JSON.stringify(data, null, 1)); return f; },
    setPage: (p) => { page = p; },
    page: () => page,
  };
  let busy = false;
  http.createServer((req, res) => {
    let body = '';
    req.on('data', c => body += c);
    req.on('end', async () => {
      res.setHeader('Content-Type', 'application/json; charset=utf-8');
      if (req.url === '/ping') return res.end(JSON.stringify({ ok: true, pages: ctx.pages().map(p => p.url()) }));
      if (busy) return res.end(JSON.stringify({ error: 'busy' }));
      busy = true;
      try {
        const file = path.resolve(body.trim());
        delete require.cache[file];
        const fn = require(file);
        const result = await Promise.race([
          fn(page, ctx, out),
          new Promise((_, rej) => setTimeout(() => rej(new Error('task timeout 150s')), 150000)),
        ]);
        res.end(JSON.stringify(result ?? null, null, 1));
      } catch (e) { res.end(JSON.stringify({ error: String(e.stack || e.message) })); }
      busy = false;
    });
  }).listen(9444, '127.0.0.1', () => console.log('ready 9444 pages=', ctx.pages().length));
})().catch(e => { console.error('ERR', e.message); process.exit(1); });
