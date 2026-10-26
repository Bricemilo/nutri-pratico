const { chromium } = require('playwright');
const svg = (pad) => `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="100%" height="100%">
<defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#2A1D14"/><stop offset="1" stop-color="#0E0B09"/></linearGradient></defs>
<rect width="100" height="100" fill="url(#g)"/>
<g transform="translate(${pad} ${pad}) scale(${(100 - 2 * pad) / 24})" fill="none" stroke="#E2A577" stroke-width="2.1" stroke-linecap="round" stroke-linejoin="round">
<path d="M5 19c0-8 5-14 14-14 0 9-6 14-14 14Z"/><path d="M5 19 13 11"/></g></svg>`;
(async () => {
  const b = await chromium.launch();
  const pg = await b.newPage();
  const out = '/home/user/nutri-pratico/site/icons/';
  for (const [name, size, pad] of [['apple-touch-icon.png', 180, 12], ['icon-192.png', 192, 12], ['icon-512.png', 512, 12], ['icon-maskable-512.png', 512, 20]]) {
    await pg.setViewportSize({ width: size, height: size });
    await pg.setContent(`<html><body style="margin:0">${svg(pad)}</body></html>`);
    await pg.screenshot({ path: out + name, clip: { x: 0, y: 0, width: size, height: size } });
  }
  await b.close();
})();
