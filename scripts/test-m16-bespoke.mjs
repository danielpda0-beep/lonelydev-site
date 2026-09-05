import { chromium } from 'playwright';
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';

// Servidor estático para a pasta dist/
function startServer(distDir, port = 4330) {
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

  const port = 4330;
  const server = await startServer(distDir, port);

  console.log('Iniciando navegador com Playwright...');
  let browser;
  try {
    browser = await chromium.launch({
      channel: 'msedge',
      headless: true
    });
  } catch (e) {
    console.log('Edge não encontrado, tentando Chromium padrão...');
    browser = await chromium.launch({ headless: true });
  }

  try {
    const context = await browser.newContext();

    // 1. Testar Home Matrix (Desktop 1440x900)
    console.log('\n--- 1. Testando Home Matrix (Desktop) ---');
    const pageMatrix = await context.newPage();
    await pageMatrix.setViewportSize({ width: 1440, height: 900 });
    // Define flag para pular intro cinematográfica longa durante testes visuais
    await pageMatrix.addInitScript(() => {
      localStorage.setItem('ld-tema', 'matrix');
      localStorage.setItem('ld-intro-vista', 'true');
    });

    await pageMatrix.goto(`http://localhost:${port}/t/matrix/`, { waitUntil: 'networkidle' });
    await pageMatrix.waitForTimeout(500);

    const hasMatrixLayout = await pageMatrix.$('[data-bespoke-layout="matrix"]');
    const hasCockpitGrid = await pageMatrix.$('.matrix-cockpit-grid');
    const hasTelemetryPod = await pageMatrix.$('.matrix-telemetry-pod');
    const hasHudStatus = await pageMatrix.$('.hud-status-strip');

    if (!hasMatrixLayout || !hasCockpitGrid || !hasTelemetryPod || !hasHudStatus) {
      throw new Error('Falha na estrutura bespoke da Home Matrix!');
    }
    console.log('✓ Home Matrix: Estrutura bespoke (cockpit, telemetria, HUD) confirmada.');

    await pageMatrix.screenshot({
      path: path.join(screenshotsDir, 'm16-home-matrix-desktop.png'),
      fullPage: false
    });
    console.log('✓ Screenshot salvo: m16-home-matrix-desktop.png');

    // 2. Testar Home Matrix (Mobile 375x667)
    console.log('\n--- 2. Testando Home Matrix (Mobile) ---');
    await pageMatrix.setViewportSize({ width: 375, height: 667 });
    await pageMatrix.waitForTimeout(300);
    await pageMatrix.screenshot({
      path: path.join(screenshotsDir, 'm16-home-matrix-mobile.png'),
      fullPage: false
    });
    console.log('✓ Screenshot salvo: m16-home-matrix-mobile.png');
    await pageMatrix.close();

    // 3. Testar Home Business (Desktop 1440x900)
    console.log('\n--- 3. Testando Home Business (Desktop) ---');
    const pageBiz = await context.newPage();
    await pageBiz.setViewportSize({ width: 1440, height: 900 });
    await pageBiz.addInitScript(() => {
      localStorage.setItem('ld-tema', 'business');
    });

    await pageBiz.goto(`http://localhost:${port}/t/business/`, { waitUntil: 'networkidle' });
    await pageBiz.waitForTimeout(500);

    const hasBizLayout = await pageBiz.$('[data-bespoke-layout="business"]');
    const hasBizHero = await pageBiz.$('.biz-hero');
    const hasBizPilares = await pageBiz.$('.biz-pilares-grid');
    const matrixClassesInBiz = await pageBiz.$('.matrix-cockpit-grid');

    if (!hasBizLayout || !hasBizHero || !hasBizPilares) {
      throw new Error('Falha na estrutura bespoke da Home Business!');
    }
    if (matrixClassesInBiz) {
      throw new Error('Classes do tema Matrix encontradas no tema Business!');
    }
    console.log('✓ Home Business: Estrutura executiva sóbria confirmada.');

    await pageBiz.screenshot({
      path: path.join(screenshotsDir, 'm16-home-business-desktop.png'),
      fullPage: false
    });
    console.log('✓ Screenshot salvo: m16-home-business-desktop.png');

    // 4. Testar Home Business (Mobile 375x667)
    console.log('\n--- 4. Testando Home Business (Mobile) ---');
    await pageBiz.setViewportSize({ width: 375, height: 667 });
    await pageBiz.waitForTimeout(300);
    await pageBiz.screenshot({
      path: path.join(screenshotsDir, 'm16-home-business-mobile.png'),
      fullPage: false
    });
    console.log('✓ Screenshot salvo: m16-home-business-mobile.png');
    await pageBiz.close();

    // 5. Testar Páginas Internas Vestidas (Serviços em Matrix e Business)
    console.log('\n--- 5. Testando Páginas Internas Vestidas (/servicos) ---');
    const pageInternal = await context.newPage();
    await pageInternal.setViewportSize({ width: 1440, height: 900 });

    // Serviços no Matrix
    await pageInternal.addInitScript(() => {
      localStorage.setItem('ld-tema', 'matrix');
      localStorage.setItem('ld-intro-vista', 'true');
    });
    await pageInternal.goto(`http://localhost:${port}/t/matrix/servicos`, { waitUntil: 'networkidle' });
    await pageInternal.waitForTimeout(1600);

    // Validação da vestimenta: data-theme=matrix no html
    const themeAttrMatrix = await pageInternal.$eval('html', el => el.getAttribute('data-theme'));
    if (themeAttrMatrix !== 'matrix') {
      throw new Error(`Tema esperado 'matrix' em /t/matrix/servicos, obtido: '${themeAttrMatrix}'`);
    }

    await pageInternal.screenshot({
      path: path.join(screenshotsDir, 'm16-interna-servicos-matrix.png'),
      fullPage: false
    });
    console.log('✓ Screenshot salvo: m16-interna-servicos-matrix.png (vestida de ciano/matrix)');

    // Serviços no Business
    await pageInternal.goto(`http://localhost:${port}/t/business/servicos`, { waitUntil: 'networkidle' });
    await pageInternal.waitForTimeout(400);

    const themeAttrBiz = await pageInternal.$eval('html', el => el.getAttribute('data-theme'));
    if (themeAttrBiz !== 'business') {
      throw new Error(`Tema esperado 'business' em /t/business/servicos, obtido: '${themeAttrBiz}'`);
    }

    await pageInternal.screenshot({
      path: path.join(screenshotsDir, 'm16-interna-servicos-business.png'),
      fullPage: false
    });
    console.log('✓ Screenshot salvo: m16-interna-servicos-business.png (vestida de grafite/âmbar)');
    await pageInternal.close();

    console.log('\n======================================================');
    console.log(' TODOS OS TESTES M16 FORAM CONCLUÍDOS COM SUCESSO! ');
    console.log('======================================================');

  } catch (err) {
    console.error('\n[ERRO]', err);
    process.exitCode = 1;
  } finally {
    if (browser) await browser.close();
    server.close();
  }
})();
