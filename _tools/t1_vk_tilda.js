module.exports = async (page, ctx, out) => {
  const pages = ctx.pages();
  let vkp = pages.find(p => p.url().includes('vk.ru'));
  if (!vkp) { vkp = page; await vkp.goto('https://vk.ru/abakan_klining', { waitUntil: 'domcontentloaded', timeout: 60000 }); await vkp.waitForTimeout(4000); }
  out.setPage(vkp);
  const vk = { url: vkp.url(), title: await vkp.title() };
  vk.shot = await out.shot('vk_group', vkp);
  try { vk.group = await vkp.evaluate(() => window.vkApi.api('groups.getById', { group_id: 'abakan_klining', fields: 'description,status,members_count,activity,site,contacts,addresses,menu,market,cover,is_admin,main_section' })); }
  catch (e) { vk.groupErr = String(e.message).slice(0, 200); }
  if (vk.groupErr) { try { vk.group = await vkp.evaluate(() => window.vkApi.api('groups.getById', { group_id: 'abakan_klining', fields: 'description,status,members_count' })); } catch (e) { vk.groupErr2 = String(e.message).slice(0, 200); } }
  vk.text = (await vkp.evaluate(() => document.body.innerText)).slice(0, 3500);
  let p2 = pages.find(p => p.url().includes('tilda.cc'));
  if (!p2) { p2 = await ctx.newPage(); await p2.goto('https://tilda.cc/projects/', { waitUntil: 'domcontentloaded', timeout: 60000 }); await p2.waitForTimeout(4000); }
  const tilda = { url: p2.url(), title: await p2.title(), shot: await out.shot('tilda_projects', p2) };
  tilda.text = (await p2.evaluate(() => document.body.innerText)).slice(0, 2500);
  return { vk, tilda };
};
