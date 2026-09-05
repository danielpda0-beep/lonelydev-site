import { chromium } from 'playwright';
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';

function startServer(distDir, port = 4331) {
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
      console.log(`Servidor de teste M17 rodando em http://localhost:${port}`);
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

  const port = 4331;
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

  let passed = true;

  try {
    const context = await browser.newContext();

    // 1. Testar /temas Desktop (1440x900)
    console.log('\n--- 1. Testando /temas Desktop ---');
    const pageDesktop = await context.newPage();
    await pageDesktop.setViewportSize({ width: 1440, height: 900 });
    await pageDesktop.addInitScript(() => {
      localStorage.setItem('ld-intro-vista', 'true');
    });

    const startTime = Date.now();
    await pageDesktop.goto(`http://localhost:${port}/temas`, { waitUntil: 'domcontentloaded' });
    const loadTime = Date.now() - startTime;
    console.log(`Tempo de carregamento /temas (Desktop): ${loadTime}ms (meta < 3000ms)`);
    if (loadTime > 3000) {
      console.warn(`[AVISO] Tempo de carregamento ultrapassou 3000ms: ${loadTime}ms`);
    } else {
      console.log('✓ Carregamento dentro da meta < 3s');
    }

    await pageDesktop.waitForSelector('.theme-card');
    const cardsCount = await pageDesktop.locator('.theme-card').count();
    console.log(`Temas encontrados na vitrine: ${cardsCount}`);
    if (cardsCount < 2) {
      console.error(`[ERRO] Esperado pelo menos 2 temas na vitrine, encontrado ${cardsCount}`);
      passed = false;
    } else {
      console.log('✓ Pelo menos 2 temas renderizados');
    }

    const iframeWrapDisplay = await pageDesktop.evaluate(() => {
      const el = document.querySelector('.theme-iframe-wrap');
      return el ? window.getComputedStyle(el).display : 'null';
    });
    const staticWrapDisplay = await pageDesktop.evaluate(() => {
      const el = document.querySelector('.theme-static-wrap');
      return el ? window.getComputedStyle(el).display : 'null';
    });

    console.log(`Desktop styles: .theme-iframe-wrap display='${iframeWrapDisplay}', .theme-static-wrap display='${staticWrapDisplay}'`);
    if (iframeWrapDisplay === 'none' || staticWrapDisplay !== 'none') {
      console.error('[ERRO] No desktop, live iframes devem ser exibidos e static wrap oculto');
      passed = false;
    } else {
      console.log('✓ Desktop exibe iframes e oculta imagens estáticas');
    }

    const ctaHref = await pageDesktop.locator('.webdesign-cta-section a.btn-primary').getAttribute('href');
    console.log(`Banner CTA href: ${ctaHref}`);
    if (!ctaHref || !ctaHref.includes('servico=Sites%20%26%20landing%20pages')) {
      console.error(`[ERRO] CTA não contém o parâmetro esperado: ${ctaHref}`);
      passed = false;
    } else {
      console.log('✓ CTA do banner redireciona com parâmetro de serviço pre-fill');
    }

    await pageDesktop.waitForTimeout(500);
    await pageDesktop.screenshot({
      path: path.join(screenshotsDir, 'm17-temas-desktop.png'),
      fullPage: true,
    });
    console.log('✓ Screenshot capturado: docs/screenshots/m17-temas-desktop.png');
    await pageDesktop.close();

    // 2. Testar /temas Mobile (375x667)
    console.log('\n--- 2. Testando /temas Mobile (iPhone SE) ---');
    const pageMobile = await context.newPage();
    await pageMobile.setViewportSize({ width: 375, height: 667 });
    await pageMobile.addInitScript(() => {
      localStorage.setItem('ld-intro-vista', 'true');
    });

    await pageMobile.goto(`http://localhost:${port}/temas`, { waitUntil: 'domcontentloaded' });
    await pageMobile.waitForSelector('.theme-card');

    const mobileIframeDisplay = await pageMobile.evaluate(() => {
      const el = document.querySelector('.theme-iframe-wrap');
      return el ? window.getComputedStyle(el).display : 'null';
    });
    const mobileStaticDisplay = await pageMobile.evaluate(() => {
      const el = document.querySelector('.theme-static-wrap');
      return el ? window.getComputedStyle(el).display : 'null';
    });

    console.log(`Mobile styles: .theme-iframe-wrap display='${mobileIframeDisplay}', .theme-static-wrap display='${mobileStaticDisplay}'`);
    if (mobileIframeDisplay !== 'none' || mobileStaticDisplay === 'none') {
      console.error('[ERRO] No mobile, iframes devem estar ocultos (display: none) e static wrap visível');
      passed = false;
    } else {
      console.log('✓ Mobile exibe imagens estáticas e bloqueia iframes');
    }

    await pageMobile.screenshot({
      path: path.join(screenshotsDir, 'm17-temas-mobile.png'),
      fullPage: false,
    });
    console.log('✓ Screenshot capturado: docs/screenshots/m17-temas-mobile.png');
    await pageMobile.close();

    // 3. Testar Galeria dentro de /servicos (Desktop)
    console.log('\n--- 3. Testando Galeria dentro de /servicos ---');
    const pageServicos = await context.newPage();
    await pageServicos.setViewportSize({ width: 1440, height: 900 });
    await pageServicos.addInitScript(() => {
      localStorage.setItem('ld-intro-vista', 'true');
    });

    await pageServicos.goto(`http://localhost:${port}/servicos`, { waitUntil: 'domcontentloaded' });
    const galleryLocator = pageServicos.locator('.webdesign-temas-gallery');
    const galleryCount = await galleryLocator.count();
    if (galleryCount === 0) {
      console.error('[ERRO] .webdesign-temas-gallery não encontrada em /servicos');
      passed = false;
    } else {
      const galleryText = await galleryLocator.first().innerText();
      console.log(`Texto da galeria em /servicos: "${galleryText.trim().replace(/\s+/g, ' ')}"`);
      if (!galleryText.includes('Estes 18 estilos são deste site')) {
        console.error('[ERRO] Frase obrigatória da decisão 10.22 ausente na galeria');
        passed = false;
      } else {
        console.log('✓ Galeria de temas presente em /servicos com a frase obrigatória');
      }

      await galleryLocator.first().scrollIntoViewIfNeeded();
      await pageServicos.screenshot({
        path: path.join(screenshotsDir, 'm17-servicos-galeria.png'),
      });
      console.log('✓ Screenshot capturado: docs/screenshots/m17-servicos-galeria.png');
    }
    await pageServicos.close();

    // 4. Testar Teaser na Home
    console.log('\n--- 4. Testando Teaser de Temas na Home ---');
    const pageHome = await context.newPage();
    await pageHome.setViewportSize({ width: 1440, height: 900 });
    await pageHome.addInitScript(() => {
      localStorage.setItem('ld-tema', 'matrix');
      localStorage.setItem('ld-intro-vista', 'true');
    });

    await pageHome.goto(`http://localhost:${port}/`, { waitUntil: 'domcontentloaded' });
    const teaserLocator = pageHome.locator('a[href="/temas"]');
    const teaserCount = await teaserLocator.count();
    console.log(`Links para /temas encontrados na Home: ${teaserCount}`);
    if (teaserCount === 0) {
      console.error('[ERRO] Nenhum link para /temas encontrado na Home');
      passed = false;
    } else {
      console.log('✓ Teaser de temas presente e apontando para /temas');
    }

    await pageHome.screenshot({
      path: path.join(screenshotsDir, 'm17-home-teaser.png'),
      fullPage: false,
    });
    console.log('✓ Screenshot capturado: docs/screenshots/m17-home-teaser.png');
    await pageHome.close();

    // 5. Testar preenchimento automático em /contato
    console.log('\n--- 5. Testando /contato?servico=Sites%20%26%20landing%20pages ---');
    const pageContato = await context.newPage();
    await pageContato.setViewportSize({ width: 1440, height: 900 });
    await pageContato.addInitScript(() => {
      localStorage.setItem('ld-intro-vista', 'true');
    });

    await pageContato.goto(`http://localhost:${port}/contato?servico=Sites%20%26%20landing%20pages`, { waitUntil: 'domcontentloaded' });
    const msgVal = await pageContato.locator('#mensagem').inputValue();
    console.log(`Mensagem pré-preenchida no textarea: "${msgVal}"`);
    if (!msgVal.includes('Sites & landing pages')) {
      console.error('[ERRO] Textarea não foi pré-preenchido com o serviço');
      passed = false;
    } else {
      console.log('✓ Textarea de contato pré-preenchido com sucesso');
    }
    await pageContato.close();

  } catch (err) {
    console.error('Erro durante execução do teste Playwright:', err);
    passed = false;
  } finally {
    await browser.close();
    server.close();
  }

  if (passed) {
    console.log('\n========================================');
    console.log('🎉 TODOS OS TESTES DO M17 PASSARAM COM SUCESSO!');
    console.log('========================================\n');
    process.exit(0);
  } else {
    console.error('\n❌ ALGUNS TESTES DO M17 FALHARAM.');
    process.exit(1);
  }
})();
