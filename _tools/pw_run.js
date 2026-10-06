// node pw_run.js <script.js>  — скрипт получает (page, ctx, out) и возвращает значение; результат печатается JSON.
// out.shot(name, page?, fullPage?) — скриншот в _tools/shots/name.png; out.save(name, data) — файл туда же.
const fs = require('fs'), path = require('path');
const { chromium } = require(process.env.PWCORE);
(async () => {
  const browser = await chromium.connectOverCDP('http://127.0.0.1:9333');
  const ctx = browser.contexts()[0];
  let page = ctx.pages().find(p => !p.url().startsWith('devtools')) || await ctx.newPage();
  const shotsDir = path.join(__dirname, 'shots'); fs.mkdirSync(shotsDir, { recursive: true });
  const out = {
    shot: async (name, p = page, full = false) => {
      const f = path.join(shotsDir, name + '.png');
      try {
        await p.bringToFront();
        await p.screenshot({ path: f, fullPage: full, timeout: 15000, animations: 'disabled' });
        return f;
      } catch (e) { return 'shot failed: ' + String(e.message).slice(0, 120); }
    },
    save: (name, data) => { const f = path.join(shotsDir, name); fs.writeFileSync(f, typeof data === 'string' ? data : JSON.stringify(data, null, 1)); return f; },
    setPage: (p) => { page = p; },
  };
  const fn = require(path.resolve(process.argv[2]));
  const res = await fn(page, ctx, out);
  console.log(JSON.stringify(res, null, 1));
  await browser.close(); // только отключение CDP, Chrome живёт
})().catch(e => { console.error('ERR', e.stack || e.message); process.exit(1); });
