const T = (p, ms) => Promise.race([p, new Promise((_, r) => setTimeout(() => r(new Error('timeout ' + ms)), ms))]);
module.exports = async (page, ctx, out) => {
  global.AK = global.AK || {};
  if (!global.AK.vk || global.AK.vk.isClosed()) {
    global.AK.vk = await ctx.newPage();
    await global.AK.vk.goto('https://vk.ru/feed', { waitUntil: 'commit', timeout: 60000 });
    await global.AK.vk.waitForTimeout(5000);
    await global.AK.vk.evaluate(() => { window.name = 'AK_KLINING'; }).catch(() => {});
  }
  const vkp = global.AK.vk;
  const r = { url: vkp.url() };
  const api = (m, p) => T(vkp.evaluate(([m, p]) => window.vkApi.api(m, p), [m, p]), 25000).catch(e => ({ err: String(e.message).slice(0, 200) }));
  r.hasApi = await T(vkp.evaluate(() => !!(window.vkApi && window.vkApi.api)), 15000).catch(e => String(e.message));
  r.me = await api('users.get', {});
  r.group = await api('groups.getById', { group_id: 'abakan_klining', fields: 'is_admin,is_member,members_count,description,status,site,contacts,addresses,cover,activity' });
  r.managed = await api('groups.get', { filter: 'admin,editor,moder', extended: 1, count: 100, fields: 'screen_name' });
  return r;
};
