module.exports = async (page, ctx, out) => {
  let t = ctx.pages().find(p => p.url().includes('tilda.cc'));
  if (!t) { t = await ctx.newPage(); await t.goto('https://tilda.cc/login/', { waitUntil: 'commit', timeout: 60000 }); }
  global.AK = global.AK || {}; global.AK.tilda = t;
  await t.bringToFront();
  return { url: t.url(), title: await t.title().catch(() => '') };
};
