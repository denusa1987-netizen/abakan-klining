const T = (p, ms) => Promise.race([p, new Promise((_, r) => setTimeout(() => r(new Error('timeout ' + ms)), ms))]);
module.exports = async (page, ctx, out) => {
  global.AK = global.AK || {};
  let t = global.AK.tilda;
  if (!t || t.isClosed()) t = ctx.pages().find(p => /tilda\.cc|chrome-error/.test(p.url())) || await ctx.newPage();
  global.AK.tilda = t;
  await t.bringToFront();
  const r = {};
  await t.goto('https://tilda.cc/projects/', { waitUntil: 'domcontentloaded', timeout: 60000 }).catch(e => r.gotoErr = String(e.message).slice(0, 150));
  await t.waitForTimeout(4000);
  r.url = t.url(); r.title = await t.title().catch(() => '');
  r.text = await T(t.evaluate(() => document.body.innerText.slice(0, 2500)), 10000).catch(e => 'ERR ' + e.message.slice(0, 60));
  r.projects = await T(t.evaluate(() => [...document.querySelectorAll('a[href*="projectid="]')].map(a => a.href + ' | ' + a.innerText.trim().slice(0, 60)).filter((v, i, a) => a.indexOf(v) === i).slice(0, 40)), 10000).catch(() => []);
  r.shot = await out.shot('tilda_state', t);
  return r;
};
