module.exports = async (page, ctx, out) => {
  const vkp = ctx.pages().find(p => p.url().includes('vk.ru')) || page;
  const r = {};
  // полный текст страницы сообщества: услуги, закреп, контакты
  r.hasManage = await vkp.evaluate(() => /Управление|Редактировать|Статистика сообщества/.test(document.body.innerText));
  r.textTail = (await vkp.evaluate(() => document.body.innerText)).slice(3500, 9000);
  await vkp.goto('https://vk.ru/feed', { waitUntil: 'domcontentloaded', timeout: 60000 });
  await vkp.waitForTimeout(3500);
  try { r.me = await vkp.evaluate(() => window.vkApi.api('users.get', {})); } catch (e) { r.meErr = String(e.message).slice(0, 150); }
  try { r.group = await vkp.evaluate(() => window.vkApi.api('groups.getById', { group_id: 'abakan_klining', fields: 'is_admin,is_member,members_count,description,status,site,contacts,addresses,menu,market,cover,activity,main_section' })); } catch (e) { r.groupErr = String(e.message).slice(0, 300); }
  try { r.managed = await vkp.evaluate(() => window.vkApi.api('groups.get', { filter: 'admin,editor,moder', extended: 1, count: 100, fields: 'screen_name' })); } catch (e) { r.managedErr = String(e.message).slice(0, 300); }
  return r;
};
