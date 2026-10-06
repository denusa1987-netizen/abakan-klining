const T = (p, ms) => Promise.race([p, new Promise((_, r) => setTimeout(() => r(new Error('timeout ' + ms)), ms))]);
module.exports = async (page, ctx, out) => {
  const r = { pages: [] };
  for (const p of ctx.pages()) {
    const name = await T(p.evaluate(() => window.name), 5000).catch(e => 'ERR ' + e.message.slice(0, 40));
    r.pages.push({ url: p.url().slice(0, 60), name, mine: p === (global.AK && global.AK.vk) });
  }
  const vkp = global.AK && global.AK.vk;
  if (vkp) {
    r.myClosed = vkp.isClosed();
    r.simple = await T(vkp.evaluate(() => 1 + 1), 5000).catch(e => 'ERR ' + e.message.slice(0, 60));
    r.api = await T(vkp.evaluate(() => window.vkApi.api('utils.getServerTime', {})), 15000).catch(e => 'ERR ' + e.message.slice(0, 60));
  }
  return r;
};
