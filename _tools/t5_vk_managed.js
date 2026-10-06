const T = (p, ms) => Promise.race([p, new Promise((_, r) => setTimeout(() => r(new Error('timeout ' + ms)), ms))]);
module.exports = async (page, ctx, out) => {
  const vkp = global.AK.vk; await vkp.bringToFront().catch(()=>{});
  const api = (m, p) => T(vkp.evaluate(([m, p]) => window.vkApi.api(m, p), [m, p]), 25000).catch(e => ({ err: String(e.message).slice(0, 120) }));
  const r = {};
  const mg = await api('groups.get', { filter: 'admin,editor,moder', extended: 1, count: 200, fields: 'screen_name' });
  r.managed = mg.items ? mg.items.map(g => g.screen_name + ':' + g.id + ':' + g.admin_level) : mg;
  r.g1 = await api('groups.getById', { group_ids: 'abakan_klining', fields: 'is_admin,is_member,members_count,description,status,site,contacts,addresses,cover,activity' });
  r.g2 = r.g1.err ? await api('groups.getById', { group_ids: 'abakan_klining' }) : null;
  return r;
};
