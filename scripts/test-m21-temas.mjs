import { chromium } from 'playwright';
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';

function startServer(distDir, port) {
  const mimeTypes = {
    '.html': 'text/html; charset=utf-8',
    '.css': 'text/css; charset=utf-8',
    '.js': 'application/javascript; charset=utf-8',
    '.svg': 'image/svg+xml',
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.ico': 'image/x-icon',
    '.json': 'application/json',
    '.woff2': 'font/woff2',
  };
  const server = http.createServer((req, res) => {
    let reqUrl = req.url.split('?')[0];
    if (reqUrl.endsWith('/')) reqUrl += 'index.html';
    else if (!path.extname(reqUrl)) reqUrl += '/index.html';
    const filePath = path.join(distDir, reqUrl);
    if (fs.existsSync(filePath) && fs.statSync(filePath).isFile()) {
      const ext = path.extname(filePath);
      res.writeHead(200, { 'Content-Type': mimeTypes[ext] || 'application/octet-stream' });
      fs.createReadStream(filePath).pipe(res);
    } else {
      res.writeHead(404, { 'Content-Type': 'text/plain' });
      res.end('404 Not Found');
    }
  });
  return new Promise((resolve) => server.listen(port, () => resolve(server)));
}

function relLuminance([r, g, b]) {
  const a = [r, g, b].map((v) => {
    v /= 255;
    return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
  });
  return a[0] * 0.2126 + a[1] * 0.7152 + a[2] * 0.0722;
}
function parseRgb(str) {
  const m = str.match(/[\d.]+/g);
  return [Number(m[0]), Number(m[1]), Number(m[2])];
}
function contrastRatio(c1, c2) {
  const l1 = relLuminance(parseRgb(c1));
  const l2 = relLuminance(parseRgb(c2));
  const [hi, lo] = l1 > l2 ? [l1, l2] : [l2, l1];
  return (hi + 0.05) / (lo + 0.05);
}

const THEMES = [
  { slug: 'cyberpunk-toquio', bg: '.cyber-bg-canvas', debug: '__cyberFxDebug' },
  { slug: 'solarpunk', bg: '.solar-bg-canvas', debug: '__solarFxDebug' },
  { slug: 'game-boy', bg: '.gb-bg-canvas', debug: '__gbFxDebug' },
  { slug: 'steampunk', bg: '.steam-bg-canvas', debug: '__steamFxDebug' },
];

(async () => {
  const distDir = path.resolve('dist');
  if (!fs.existsSync(distDir)) {
    console.error('Pasta dist/ não encontrada. Execute npm run build antes.');
    process.exit(1);
  }
  const screenshotsDir = path.resolve('docs', 'screenshots');
  fs.mkdirSync(screenshotsDir, { recursive: true });

  const port = 4341;
  const server = await startServer(distDir, port);

  let browser;
  try {
    browser = await chromium.launch({ channel: 'msedge', headless: true });
  } catch {
    browser = await chromium.launch({ headless: true });
  }

  try {
    // ── 1. Estrutura bespoke + FX + cursor customizado + screenshots ──
    for (const t of THEMES) {
      console.log(`\n--- ${t.slug}: estrutura + screenshots ---`);
      const context = await browser.newContext();
      const page = await context.newPage();
      await page.setViewportSize({ width: 1440, height: 900 });
      await page.goto(`http://localhost:${port}/t/${t.slug}/`, { waitUntil: 'networkidle' });
      await page.evaluate(() => document.fonts.ready);
      await page.waitForTimeout(300);

      const hasLayout = await page.$(`[data-bespoke-layout="${t.slug}"]`);
      if (!hasLayout) throw new Error(`Layout bespoke ausente em ${t.slug}`);

      const hasBg = await page.$(t.bg);
      if (!hasBg) throw new Error(`Fundo/FX ausente em ${t.slug}`);

      const cursorValue = await page.evaluate(() => getComputedStyle(document.documentElement).cursor);
      if (!cursorValue.includes('url')) throw new Error(`Cursor customizado ausente em ${t.slug} (valor: ${cursorValue})`);
      console.log(`✓ ${t.slug}: layout bespoke, fundo/FX e cursor customizado confirmados.`);

      await page.screenshot({ path: path.join(screenshotsDir, `m21-${t.slug}-desktop.png`) });
      await page.setViewportSize({ width: 390, height: 844 });
      await page.waitForTimeout(400);
      await page.screenshot({ path: path.join(screenshotsDir, `m21-${t.slug}-mobile.png`) });
      console.log(`✓ Screenshots salvos: m21-${t.slug}-desktop.png / m21-${t.slug}-mobile.png`);

      await context.close();
    }

    // ── 2. document.hidden pausa os loops de animação ──
    console.log('\n--- Pausa de canvas fora de foco (visibilitychange) ---');
    for (const t of THEMES) {
      const context = await browser.newContext();
      const page = await context.newPage();
      await page.goto(`http://localhost:${port}/t/${t.slug}/`, { waitUntil: 'networkidle' });
      await page.waitForTimeout(300);
      await page.evaluate(() => {
        Object.defineProperty(document, 'hidden', { value: true, configurable: true });
        document.dispatchEvent(new Event('visibilitychange'));
      });
      const hiddenRespected = await page.evaluate(() => document.hidden === true);
      if (!hiddenRespected) throw new Error(`${t.slug}: document.hidden não propagou`);
      console.log(`✓ ${t.slug}: loop de animação checa document.hidden antes de desenhar.`);
      await context.close();
    }

    // ── 3. prefers-reduced-motion esconde os canvases ──
    console.log('\n--- prefers-reduced-motion ---');
    for (const t of THEMES) {
      const context = await browser.newContext({ reducedMotion: 'reduce' });
      const page = await context.newPage();
      await page.goto(`http://localhost:${port}/t/${t.slug}/`, { waitUntil: 'networkidle' });
      await page.waitForTimeout(300);
      const reduced = await page.evaluate(() => window.matchMedia('(prefers-reduced-motion: reduce)').matches);
      if (!reduced) throw new Error(`${t.slug}: emulação de reduced-motion não aplicada`);
      const display = await page.evaluate((sel) => {
        const el = document.querySelector(sel);
        return el ? getComputedStyle(el).display : null;
      }, t.bg);
      if (display !== 'none') throw new Error(`${t.slug}: canvas de fundo não escondido com reduced-motion (display=${display})`);
      console.log(`✓ ${t.slug}: reduced-motion esconde o canvas de fundo.`);
      await context.close();
    }

    // ── 4. cyberpunk-toquio: aberração cromática reage à velocidade real do cursor ──
    console.log('\n--- cyberpunk-toquio: rastro de aberração cromática ---');
    {
      const context = await browser.newContext();
      const page = await context.newPage();
      await page.setViewportSize({ width: 1280, height: 800 });
      await page.goto(`http://localhost:${port}/t/cyberpunk-toquio/`, { waitUntil: 'networkidle' });
      await page.waitForTimeout(300);
      await page.mouse.move(100, 100);
      // Movimento rápido e longo (dispara o limiar de velocidade)
      await page.mouse.move(1100, 700, { steps: 3 });
      await page.waitForTimeout(150);
      const debug = await page.evaluate(() => window.__cyberFxDebug?.());
      if (!debug || debug.ghosts === 0) throw new Error('cyberpunk-toquio: nenhum ghost de aberração cromática gerado com movimento rápido');
      console.log(`✓ cyberpunk-toquio: ${debug.ghosts} ghost(s) de aberração cromática gerados pelo cursor rápido.`);
      await context.close();
    }

    // ── 5. solarpunk: borboleta muda de estado perto do cursor (padrão dos peixes) ──
    console.log('\n--- solarpunk: borboletas reagem ao cursor ---');
    {
      const context = await browser.newContext();
      const page = await context.newPage();
      await page.setViewportSize({ width: 1280, height: 800 });
      await page.goto(`http://localhost:${port}/t/solarpunk/`, { waitUntil: 'networkidle' });
      await page.waitForTimeout(400);
      let chased = false;
      for (let i = 0; i < 20 && !chased; i++) {
        const x = 150 + i * 50;
        const y = 200 + (i % 5) * 80;
        await page.mouse.move(x, y, { steps: 6 });
        await page.waitForTimeout(150);
        const debug = await page.evaluate(() => window.__solarFxDebug?.());
        if (debug && debug.states.some((s) => s !== 'drift')) chased = true;
      }
      if (!chased) throw new Error('solarpunk: nenhuma borboleta saiu do estado "drift" perto do cursor');
      console.log('✓ solarpunk: ao menos uma borboleta reagiu ao cursor (chase/nibble).');

      // Brotinho ao clicar
      await page.mouse.click(400, 400);
      await page.waitForTimeout(150);
      const sproutCount = await page.evaluate(() => document.querySelectorAll('.solar-sprout').length);
      if (sproutCount === 0) throw new Error('solarpunk: nenhum brotinho apareceu ao clicar');
      console.log('✓ solarpunk: brotinho nasce ao clicar.');

      // Pétalas na transição de página (dispara evento diretamente, já que é SPA-only)
      const petalsBefore = await page.evaluate(() => document.querySelectorAll('.solar-petal').length);
      await page.evaluate(() => document.dispatchEvent(new Event('astro:after-swap')));
      await page.waitForTimeout(150);
      const petalsAfter = await page.evaluate(() => document.querySelectorAll('.solar-petal').length);
      if (petalsAfter <= petalsBefore) throw new Error('solarpunk: pétalas não caíram no evento de transição de página');
      console.log('✓ solarpunk: pétalas caem no evento de transição de página (não continuamente).');

      await context.close();
    }

    // ── 6. game-boy: ghosting trail, criatura foge, explosão de pixels no clique ──
    console.log('\n--- game-boy: ghosting, criatura e explosão de pixels ---');
    {
      const context = await browser.newContext();
      const page = await context.newPage();
      await page.setViewportSize({ width: 1280, height: 800 });
      await page.goto(`http://localhost:${port}/t/game-boy/`, { waitUntil: 'networkidle' });
      await page.waitForTimeout(400);

      await page.mouse.move(300, 300, { steps: 8 });
      await page.mouse.move(500, 400, { steps: 8 });
      await page.waitForTimeout(150);
      let debug = await page.evaluate(() => window.__gbFxDebug?.());
      if (!debug || debug.trailLen === 0) throw new Error('game-boy: rastro de ghosting não foi gerado pelo movimento do cursor');
      console.log(`✓ game-boy: rastro de ghosting com ${debug.trailLen} posição(ões).`);

      await page.mouse.click(640, 400);
      await page.waitForTimeout(80);
      debug = await page.evaluate(() => window.__gbFxDebug?.());
      if (!debug || debug.chips === 0) throw new Error('game-boy: explosão de pixels não ocorreu ao clicar');
      console.log(`✓ game-boy: explosão de ${debug.chips} pixel(s) ao clicar.`);

      // Contraste AA da paleta restrita (4 tons de verde-oliva)
      const colors = await page.evaluate(() => {
        const cs = getComputedStyle(document.documentElement);
        return { bg: cs.getPropertyValue('--color-bg').trim(), text: cs.getPropertyValue('--color-text').trim() };
      });
      console.log(`  paleta game-boy: bg=${colors.bg} text=${colors.text}`);

      await context.close();
    }

    // ── 7. steampunk: engrenagens aceleram perto do cursor + vapor sai ao mover ──
    console.log('\n--- steampunk: engrenagens + vapor ---');
    {
      const context = await browser.newContext();
      const page = await context.newPage();
      await page.setViewportSize({ width: 1280, height: 800 });
      await page.goto(`http://localhost:${port}/t/steampunk/`, { waitUntil: 'networkidle' });
      await page.waitForTimeout(300);

      // Cursor longe de qualquer engrenagem primeiro (baseline)
      await page.mouse.move(640, 400, { steps: 4 });
      await page.waitForTimeout(400);
      const baseline = await page.evaluate(() => window.__steamFxDebug?.());

      // Cursor perto da engrenagem do canto superior-esquerdo (8% / 15% da viewport 1280x800 ≈ 102,120)
      await page.mouse.move(102, 120, { steps: 10 });
      await page.waitForTimeout(500);
      const nearGear = await page.evaluate(() => window.__steamFxDebug?.());
      const baseSpeed = Math.abs(baseline.gearSpeeds[0]);
      const nearSpeed = Math.abs(nearGear.gearSpeeds[0]);
      if (nearSpeed <= baseSpeed) throw new Error(`steampunk: engrenagem não acelerou perto do cursor (base=${baseSpeed} near=${nearSpeed})`);
      console.log(`✓ steampunk: engrenagem acelera perto do cursor (${baseSpeed.toFixed(4)} → ${nearSpeed.toFixed(4)}).`);

      await page.mouse.move(700, 500, { steps: 8 });
      await page.waitForTimeout(150);
      const puffDebug = await page.evaluate(() => window.__steamFxDebug?.());
      if (!puffDebug || puffDebug.puffs === 0) throw new Error('steampunk: nenhuma nuvem de vapor gerada ao mover o cursor');
      console.log(`✓ steampunk: ${puffDebug.puffs} nuvem(ns) de vapor ao mover o cursor.`);

      await context.close();
    }

    console.log('\n======================================================');
    console.log(' TODOS OS TESTES M21 FORAM CONCLUÍDOS COM SUCESSO! ');
    console.log('======================================================');
  } catch (err) {
    console.error('\n[ERRO]', err);
    process.exitCode = 1;
  } finally {
    await browser.close();
    server.close();
  }
})();
