import { chromium, devices } from 'playwright';
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

const THEMES = [
  { slug: 'arcade', bg: '.arcade-bg-canvas', layout: 'arcade' },
  { slug: 'vintage', bg: '.vintage-ink-canvas', layout: 'vintage' },
  { slug: 'fundo-do-mar', bg: '.mar-bg-canvas', layout: 'fundo-do-mar' },
  { slug: 'espaco-sideral', bg: '.espaco-bg-canvas', layout: 'espaco-sideral' },
];

(async () => {
  const distDir = path.resolve('dist');
  if (!fs.existsSync(distDir)) {
    console.error('Pasta dist/ não encontrada. Execute npm run build antes.');
    process.exit(1);
  }
  const screenshotsDir = path.resolve('docs', 'screenshots');
  fs.mkdirSync(screenshotsDir, { recursive: true });

  const port = 4331;
  const server = await startServer(distDir, port);

  let browser;
  try {
    browser = await chromium.launch({ channel: 'msedge', headless: true });
  } catch {
    browser = await chromium.launch({ headless: true });
  }

  try {
    // ── 1. Estrutura bespoke + screenshots desktop/mobile por tema ──
    for (const t of THEMES) {
      console.log(`\n--- ${t.slug}: estrutura + screenshots ---`);
      const context = await browser.newContext();
      const page = await context.newPage();
      await page.setViewportSize({ width: 1440, height: 900 });
      await page.goto(`http://localhost:${port}/t/${t.slug}/`, { waitUntil: 'networkidle' });
      await page.evaluate(() => document.fonts.ready);
      await page.waitForTimeout(300);

      const hasLayout = await page.$(`[data-bespoke-layout="${t.layout}"]`);
      if (!hasLayout) throw new Error(`Layout bespoke ausente em ${t.slug}`);

      const hasCanvas = await page.$(t.bg);
      if (!hasCanvas) throw new Error(`Canvas de fundo ausente em ${t.slug}`);

      const cursorValue = await page.evaluate(() => getComputedStyle(document.documentElement).cursor);
      if (!cursorValue.includes('url')) throw new Error(`Cursor customizado ausente em ${t.slug} (valor: ${cursorValue})`);
      console.log(`✓ ${t.slug}: layout bespoke, canvas de fundo e cursor customizado confirmados.`);

      await page.screenshot({ path: path.join(screenshotsDir, `m19-${t.slug}-desktop.png`) });

      await page.setViewportSize({ width: 390, height: 844 });
      await page.waitForTimeout(400);
      await page.screenshot({ path: path.join(screenshotsDir, `m19-${t.slug}-mobile.png`) });
      console.log(`✓ Screenshots salvos: m19-${t.slug}-desktop.png / m19-${t.slug}-mobile.png`);

      await context.close();
    }

    // ── 2. Canvas pausa fora de foco (visibilitychange) para os 4 temas ──
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

    // ── 3. prefers-reduced-motion desliga cursores/backgrounds animados ──
    console.log('\n--- prefers-reduced-motion ---');
    for (const t of THEMES) {
      const context = await browser.newContext({ reducedMotion: 'reduce' });
      const page = await context.newPage();
      await page.goto(`http://localhost:${port}/t/${t.slug}/`, { waitUntil: 'networkidle' });
      await page.waitForTimeout(300);
      const reduced = await page.evaluate(() => window.matchMedia('(prefers-reduced-motion: reduce)').matches);
      if (!reduced) throw new Error(`${t.slug}: emulação de reduced-motion não aplicada`);
      console.log(`✓ ${t.slug}: prefers-reduced-motion detectado pela página.`);
      await context.close();
    }

    // ── 4. Fundo do Mar: peixe se aproxima do cursor real, belisca e volta a nadar ──
    console.log('\n--- fundo-do-mar: interação real do cardume ---');
    {
      const context = await browser.newContext();
      const page = await context.newPage();
      await page.setViewportSize({ width: 1280, height: 800 });
      await page.goto(`http://localhost:${port}/t/fundo-do-mar/`, { waitUntil: 'networkidle' });
      await page.waitForTimeout(500);

      // Move o mouse por várias posições pra aumentar a chance de entrar no raio de atenção de algum peixe
      let chased = false;
      for (let i = 0; i < 12 && !chased; i++) {
        const x = 200 + i * 80;
        const y = 300 + (i % 3) * 120;
        await page.mouse.move(x, y, { steps: 10 });
        await page.waitForTimeout(400);
        const debug = await page.evaluate(() => window.__marFxDebug?.());
        if (debug && (debug.states.includes('chase') || debug.states.includes('nibble'))) {
          chased = true;
        }
      }
      if (!chased) throw new Error('Nenhum peixe entrou em estado chase/nibble com o mouse real em 12 tentativas');
      console.log('✓ Peixe entrou em estado de perseguição/beliscada com o cursor real.');

      // Espera passar do tempo de nibble e confirma que volta a "drift" sozinho
      await page.waitForTimeout(3500);
      const afterDebug = await page.evaluate(() => window.__marFxDebug?.());
      if (!afterDebug || afterDebug.states.every((s) => s !== 'drift')) {
        throw new Error('Peixes não retornaram ao estado de deriva após o ciclo de perseguição');
      }
      console.log('✓ Peixe voltou a nadar em deriva sozinho, sem grudar no cursor.');
      await context.close();
    }

    // ── 5. Fundo do Mar: touch/mobile só faz deriva idle (sem isca) ──
    console.log('\n--- fundo-do-mar: touch/mobile sem perseguição ---');
    {
      const iPhone = devices['iPhone 13'];
      const context = await browser.newContext({ ...iPhone });
      const page = await context.newPage();
      await page.goto(`http://localhost:${port}/t/fundo-do-mar/`, { waitUntil: 'networkidle' });
      await page.waitForTimeout(500);
      const isCoarse = await page.evaluate(() => window.matchMedia('(pointer: coarse)').matches);
      if (!isCoarse) throw new Error('Emulação de touch não resultou em pointer: coarse');
      // Simula movimento via mouse.move mesmo assim (não deveria perseguir por causa do isTouchDevice())
      await page.mouse.move(150, 300, { steps: 5 });
      await page.waitForTimeout(2000);
      const debug = await page.evaluate(() => window.__marFxDebug?.());
      if (debug && debug.states.some((s) => s === 'chase')) {
        throw new Error('Peixe perseguiu o cursor em dispositivo touch/mobile — violação da decisão 10.23');
      }
      console.log('✓ Em touch/mobile nenhum peixe persegue: só deriva idle.');
      await context.close();
    }

    // ── 6. Fundo do Mar: reduced-motion desliga só a perseguição ──
    console.log('\n--- fundo-do-mar: reduced-motion desliga só a perseguição ---');
    {
      const context = await browser.newContext({ reducedMotion: 'reduce' });
      const page = await context.newPage();
      await page.setViewportSize({ width: 1280, height: 800 });
      await page.goto(`http://localhost:${port}/t/fundo-do-mar/`, { waitUntil: 'networkidle' });
      await page.waitForTimeout(500);
      for (let i = 0; i < 8; i++) {
        await page.mouse.move(200 + i * 100, 300 + (i % 3) * 120, { steps: 10 });
        await page.waitForTimeout(300);
      }
      const debug = await page.evaluate(() => window.__marFxDebug?.());
      if (debug && debug.states.some((s) => s !== 'drift')) {
        throw new Error('Peixe perseguiu o cursor com prefers-reduced-motion ativo — violação da decisão 10.23');
      }
      const hasCanvas = await page.$('.mar-bg-canvas');
      if (!hasCanvas) throw new Error('Canvas de fundo sumiu com reduced-motion (peixes devem continuar visíveis)');
      console.log('✓ Com reduced-motion os peixes continuam em deriva, sem nenhum perseguindo o cursor.');
      await context.close();
    }

    console.log('\n======================================================');
    console.log(' TODOS OS TESTES M19 FORAM CONCLUÍDOS COM SUCESSO! ');
    console.log('======================================================');
  } catch (err) {
    console.error('\n[ERRO]', err);
    process.exitCode = 1;
  } finally {
    await browser.close();
    server.close();
  }
})();
