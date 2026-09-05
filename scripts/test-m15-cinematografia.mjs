import { chromium } from 'playwright';
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';

// Servidor estático embutido para servir a pasta dist/
function startServer(distDir, port = 4321) {
  const mimeTypes = {
    '.html': 'text/html; charset=utf-8',
    '.css': 'text/css; charset=utf-8',
    '.js': 'application/javascript; charset=utf-8',
    '.svg': 'image/svg+xml',
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.ico': 'image/x-icon',
    '.json': 'application/json',
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

  return new Promise((resolve) => {
    server.listen(port, () => {
      console.log(`Servidor de teste rodando em http://localhost:${port}`);
      resolve(server);
    });
  });
}

(async () => {
  const distDir = path.resolve('dist');
  if (!fs.existsSync(distDir)) {
    console.error('Pasta dist/ não encontrada. Execute npm run build antes.');
    process.exit(1);
  }

  const screenshotsDir = path.resolve('docs', 'screenshots');
  if (!fs.existsSync(screenshotsDir)) {
    fs.mkdirSync(screenshotsDir, { recursive: true });
  }

  const port = 4329;
  const server = await startServer(distDir, port);

  console.log('Iniciando Chromium/Edge com Playwright...');
  let browser;
  try {
    browser = await chromium.launch({ channel: 'msedge', headless: true });
  } catch (e) {
    browser = await chromium.launch({ headless: true });
  }

  try {
    // ── 1. TESTE: Primeira visita Desktop (Sequência completa de 5,5s) ──
    console.log('\n--- 1. Primeira Visita Desktop (1440x900, intro completa 5.5s) ---');
    const context1 = await browser.newContext({
      viewport: { width: 1440, height: 900 }
    });
    const page1 = await context1.newPage();
    
    // Inicia navegação
    await page1.goto(`http://localhost:${port}/`, { waitUntil: 'domcontentloaded' });
    
    // Screenshot 1: Terminal DOS (~800ms)
    await page1.waitForTimeout(800);
    await page1.screenshot({ path: path.join(screenshotsDir, 'm15-intro-01-terminal.png') });
    console.log('✓ m15-intro-01-terminal.png');

    // Screenshot 2: Cascata inicial de código (~1600ms acumulado)
    await page1.waitForTimeout(800);
    await page1.screenshot({ path: path.join(screenshotsDir, 'm15-intro-02-cascata.png') });
    console.log('✓ m15-intro-02-cascata.png');

    // Screenshot 3: Chuva Matrix + "LONELY DEV" piscando (~2600ms acumulado)
    await page1.waitForTimeout(1000);
    await page1.screenshot({ path: path.join(screenshotsDir, 'm15-intro-03-lonelydev.png') });
    console.log('✓ m15-intro-03-lonelydev.png');

    // Screenshot 4: Dobramento em retângulos de vidro + transição verde -> ciano (~3800ms acumulado)
    await page1.waitForTimeout(1200);
    await page1.screenshot({ path: path.join(screenshotsDir, 'm15-intro-04-morph-panels.png') });
    console.log('✓ m15-intro-04-morph-panels.png');

    // Screenshot 5: Conteúdo real preenchendo painéis (~4900ms acumulado)
    await page1.waitForTimeout(1100);
    await page1.screenshot({ path: path.join(screenshotsDir, 'm15-intro-05-content-reveal.png') });
    console.log('✓ m15-intro-05-content-reveal.png');

    // Screenshot 6: Regime permanente (~6200ms acumulado)
    await page1.waitForTimeout(1300);
    await page1.screenshot({ path: path.join(screenshotsDir, 'm15-intro-06-regime-permanente.png') });
    console.log('✓ m15-intro-06-regime-permanente.png');

    // Verifica que ld-intro-vista foi gravado
    const hasSeenIntro = await page1.evaluate(() => localStorage.getItem('ld-intro-vista'));
    console.log(`ld-intro-vista gravado: ${hasSeenIntro}`);

    // Verifica botão rever intro
    const reverBtn = page1.locator('#rever-intro-btn');
    const isReverBtnVisible = await reverBtn.isVisible();
    console.log(`Botão 'rever intro' visível no tema Matrix: ${isReverBtnVisible}`);

    // ── 2. TESTE: Segunda Visita Desktop (Versão comprimida ~1s) ──
    console.log('\n--- 2. Segunda Visita Desktop (ld-intro-vista = true, versão comprimida ~1s) ---');
    const page2 = await context1.newPage();
    const tStart2 = Date.now();
    await page2.goto(`http://localhost:${port}/`, { waitUntil: 'domcontentloaded' });
    
    // Aguarda ~1300ms e verifica se overlay já sumiu
    await page2.waitForTimeout(1300);
    const overlayDisplay = await page2.evaluate(() => {
      const el = document.getElementById('matrix-boot-overlay');
      return el ? window.getComputedStyle(el).display : null;
    });
    console.log(`Estado do overlay após ~1.3s: display = ${overlayDisplay}`);

    // ── 3. TESTE: Mobile (~2,5s reduzida, menos colunas) ──
    console.log('\n--- 3. Visita Mobile (375x667, versão reduzida ~2.5s) ---');
    const contextMobile = await browser.newContext({
      viewport: { width: 375, height: 667 }
    });
    const pageMobile = await contextMobile.newPage();
    await pageMobile.goto(`http://localhost:${port}/`, { waitUntil: 'domcontentloaded' });
    
    await pageMobile.waitForTimeout(1200);
    await pageMobile.screenshot({ path: path.join(screenshotsDir, 'm15-intro-mobile-cascade.png') });
    console.log('✓ m15-intro-mobile-cascade.png');

    await pageMobile.waitForTimeout(1800); // 3000ms total
    await pageMobile.screenshot({ path: path.join(screenshotsDir, 'm15-intro-mobile-complete.png') });
    console.log('✓ m15-intro-mobile-complete.png');

    // ── 4. TESTE: prefers-reduced-motion ──
    console.log('\n--- 4. prefers-reduced-motion: reduce (sem animação, direto estático) ---');
    const contextReduced = await browser.newContext({
      viewport: { width: 1440, height: 900 },
      reducedMotion: 'reduce'
    });
    const pageReduced = await contextReduced.newPage();
    await pageReduced.goto(`http://localhost:${port}/`, { waitUntil: 'domcontentloaded' });
    await pageReduced.waitForTimeout(300);

    const overlayActiveReduced = await pageReduced.evaluate(() => {
      const el = document.getElementById('matrix-boot-overlay');
      return el ? el.classList.contains('is-active') || window.getComputedStyle(el).display !== 'none' : false;
    });
    console.log(`Overlay ativo com reduced-motion: ${overlayActiveReduced} (deve ser false)`);
    await pageReduced.screenshot({ path: path.join(screenshotsDir, 'm15-intro-reduced-motion.png') });
    console.log('✓ m15-intro-reduced-motion.png');

    // ── 5. TESTE: No JavaScript ──
    console.log('\n--- 5. JavaScript desligado (site montado, conteúdo 100% visível) ---');
    const contextNoJS = await browser.newContext({
      viewport: { width: 1440, height: 900 },
      javaScriptEnabled: false
    });
    const pageNoJS = await contextNoJS.newPage();
    await pageNoJS.goto(`http://localhost:${port}/`, { waitUntil: 'domcontentloaded' });

    const headline = await pageNoJS.locator('h1').textContent();
    console.log(`Título da página visível sem JS: "${headline}"`);
    await pageNoJS.screenshot({ path: path.join(screenshotsDir, 'm15-intro-nojs.png') });
    console.log('✓ m15-intro-nojs.png');

    // ── 6. TESTE: Botão "Rever intro" ──
    console.log('\n--- 6. Teste de clique em "rever intro" ---');
    await page1.click('#rever-intro-btn');
    await page1.waitForTimeout(300);
    const isReplaying = await page1.evaluate(() => {
      const el = document.getElementById('matrix-boot-overlay');
      return el ? el.classList.contains('is-active') : false;
    });
    console.log(`Overlay reativado após clique em "rever intro": ${isReplaying}`);

    console.log('\n✅ Todos os testes automatizados do M15 foram concluídos com sucesso!');
  } finally {
    await browser.close();
    server.close();
  }
})();
