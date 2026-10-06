const T = (p, ms) => Promise.race([p, new Promise((_, r) => setTimeout(() => r(new Error('timeout ' + ms)), ms))]);
module.exports = async (page, ctx, out) => {
  const vkp = ctx.pages().find(p => p.url().includes('vk.ru')) || page;
  const r = { url: vkp.url() };
  const api = (m, p) => T(vkp.evaluate(([m, p]) => window.vkApi.api(m, p), [m, p]), 20000).catch(e => ({ err: String(e.message).slice(0, 200) }));
  r.hasApi = await T(vkp.evaluate(() => !!(window.vkApi && window.vkApi.api)), 10000).catch(e => String(e.message));
  r.me = await api('users.get', {});
  r.group = await api('groups.getById', { group_id: 'abakan_klining', fields: 'is_admin,is_member,members_count,description,status,site,contacts,addresses,cover,activity' });
  r.managed = await api('groups.get', { filter: 'admin,editor,moder', extended: 1, count: 100, fields: 'screen_name' });
  return r;
};
