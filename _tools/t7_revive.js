const T = (p, ms) => Promise.race([p, new Promise((_, r) => setTimeout(() => r(new Error('timeout ' + ms)), ms))]);
module.exports = async (page, ctx, out) => {
  const r = {};
  let vkp = global.AK.vk;
  await vkp.bringToFront().catch(() => {});
  r.front = await T(vkp.evaluate(() => 1 + 1), 10000).catch(e => 'ERR ' + e.message.slice(0, 40));
  if (r.front !== 2) {
    await T(vkp.close(), 5000).catch(() => {});
    vkp = await ctx.newPage(); global.AK.vk = vkp;
    await vkp.goto('https://vk.ru/abakan_klining', { waitUntil: 'commit', timeout: 60000 }).catch(e => r.gotoErr = e.message.slice(0, 80));
    await vkp.waitForTimeout(6000);
    r.fresh = await T(vkp.evaluate(() => { window.name = 'AK_KLINING'; return { api: !!(window.vkApi && window.vkApi.api), title: document.title }; }), 15000).catch(e => 'ERR ' + e.message.slice(0, 40));
  }
  r.cpu = await T(vkp.evaluate(() => performance.now()), 5000).catch(e => 'ERR');
  r.pagesNow = ctx.pages().length;
  return r;
};
