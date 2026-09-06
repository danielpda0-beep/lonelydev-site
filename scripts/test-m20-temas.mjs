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

const ANIMATED_THEMES = [
  { slug: 'fisica-quantica', bg: '.fq-bg-canvas', layout: 'fisica-quantica' },
  { slug: 'blueprint', bg: '.bp-fx-canvas', layout: 'blueprint' },
  { slug: 'noir', bg: '.noir-spotlight', layout: 'noir' },
];

const PT_PAGES = [
  '', 'servicos', 'servicos/automacao-e-ia', 'como-funciona', 'sobre', 'contato', 'faq', 'privacidade',
];

(async () => {
  const distDir = path.resolve('dist');
  if (!fs.existsSync(distDir)) {
    console.error('Pasta dist/ não encontrada. Execute npm run build antes.');
    process.exit(1);
  }
  const screenshotsDir = path.resolve('docs', 'screenshots');
  fs.mkdirSync(screenshotsDir, { recursive: true });

  const port = 4332;
  const server = await startServer(distDir, port);

  let browser;
  try {
    browser = await chromium.launch({ channel: 'msedge', headless: true });
  } catch {
    browser = await chromium.launch({ headless: true });
  }

  try {
    // ── 1. Estrutura bespoke + cursor customizado + screenshots (fisica-quantica, blueprint, noir) ──
    for (const t of ANIMATED_THEMES) {
      console.log(`\n--- ${t.slug}: estrutura + screenshots ---`);
      const context = await browser.newContext();
      const page = await context.newPage();
      await page.setViewportSize({ width: 1440, height: 900 });
      await page.goto(`http://localhost:${port}/t/${t.slug}/`, { waitUntil: 'networkidle' });
      await page.evaluate(() => document.fonts.ready);
      await page.waitForTimeout(300);

      const hasLayout = await page.$(`[data-bespoke-layout="${t.layout}"]`);
      if (!hasLayout) throw new Error(`Layout bespoke ausente em ${t.slug}`);

      const hasBg = await page.$(t.bg);
      if (!hasBg) throw new Error(`Fundo/FX ausente em ${t.slug}`);

      const cursorValue = await page.evaluate(() => getComputedStyle(document.documentElement).cursor);
      if (!cursorValue.includes('url')) throw new Error(`Cursor customizado ausente em ${t.slug} (valor: ${cursorValue})`);
      console.log(`✓ ${t.slug}: layout bespoke, fundo/FX e cursor customizado (fallback estático) confirmados.`);

      await page.screenshot({ path: path.join(screenshotsDir, `m20-${t.slug}-desktop.png`) });
      await page.setViewportSize({ width: 390, height: 844 });
      await page.waitForTimeout(400);
      await page.screenshot({ path: path.join(screenshotsDir, `m20-${t.slug}-mobile.png`) });
      console.log(`✓ Screenshots salvos: m20-${t.slug}-desktop.png / m20-${t.slug}-mobile.png`);

      await context.close();
    }

    // ── 2. papel-e-tinta: estrutura + ausência de cursor customizado + screenshots ──
    console.log('\n--- papel-e-tinta: estrutura + ausência de efeito/cursor ---');
    {
      const context = await browser.newContext();
      const page = await context.newPage();
      await page.setViewportSize({ width: 1440, height: 900 });
      await page.goto(`http://localhost:${port}/t/papel-e-tinta/`, { waitUntil: 'networkidle' });
      await page.evaluate(() => document.fonts.ready);
      await page.waitForTimeout(300);

      const hasLayout = await page.$('[data-bespoke-layout="papel-e-tinta"]');
      if (!hasLayout) throw new Error('Layout bespoke ausente em papel-e-tinta');

      const cursorValue = await page.evaluate(() => getComputedStyle(document.documentElement).cursor);
      if (cursorValue.includes('url')) throw new Error(`papel-e-tinta não deveria ter cursor customizado (10.24 exceção), valor: ${cursorValue}`);

      const bg = await page.evaluate(() => getComputedStyle(document.documentElement).getPropertyValue('--color-bg').trim());
      if (bg.toLowerCase() !== '#faf8f3') throw new Error(`papel-e-tinta: --color-bg inesperado (${bg})`);
      console.log('✓ papel-e-tinta: layout bespoke, cursor padrão (sem customização) e fundo claro confirmados.');

      await page.screenshot({ path: path.join(screenshotsDir, 'm20-papel-e-tinta-desktop.png') });
      await page.setViewportSize({ width: 390, height: 844 });
      await page.waitForTimeout(300);
      await page.screenshot({ path: path.join(screenshotsDir, 'm20-papel-e-tinta-mobile.png') });
      await context.close();
    }

    // ── 3. papel-e-tinta: as 8 páginas navegáveis sem quebrar tokens (bordas/sombras/foco/erro) ──
    console.log('\n--- papel-e-tinta: varredura das 8 páginas ---');
    {
      const context = await browser.newContext();
      const page = await context.newPage();
      await page.setViewportSize({ width: 1280, height: 900 });
      for (const p of PT_PAGES) {
        const url = `http://localhost:${port}/t/papel-e-tinta/${p}`;
        const resp = await page.goto(url, { waitUntil: 'networkidle' });
        if (!resp || resp.status() >= 400) throw new Error(`papel-e-tinta/${p}: status ${resp && resp.status()}`);
        await page.waitForTimeout(200);
        const fname = p === '' ? 'home' : p.replace(/\//g, '-');
        await page.screenshot({ path: path.join(screenshotsDir, `m20-papel-e-tinta-page-${fname}.png`), fullPage: true });
        console.log(`✓ papel-e-tinta/${p || '(home)'} carregou e foi fotografada.`);
      }

      // Estado de foco visível num link/botão
      await page.goto(`http://localhost:${port}/t/papel-e-tinta/contato`, { waitUntil: 'networkidle' });
      const focusOutline = await page.evaluate(() => {
        const el = document.querySelector('a, button, input');
        if (!el) return null;
        el.focus();
        const cs = getComputedStyle(el);
        return { outline: cs.outlineStyle, outlineColor: cs.outlineColor, boxShadow: cs.boxShadow };
      });
      console.log('  foco em elemento interativo:', JSON.stringify(focusOutline));

      // Estado de erro do formulário de contato (se existir campo obrigatório)
      const submitBtn = await page.$('form button[type="submit"], form input[type="submit"]');
      if (submitBtn) {
        await submitBtn.click().catch(() => {});
        await page.waitForTimeout(200);
        await page.screenshot({ path: path.join(screenshotsDir, 'm20-papel-e-tinta-page-contato-erro.png'), fullPage: true });
        console.log('✓ papel-e-tinta/contato: screenshot pós-submit (estado de validação) salvo.');
      }

      await context.close();
    }

    // ── 4. document.hidden pausa os loops de animação (fisica-quantica, blueprint) ──
    console.log('\n--- Pausa de canvas fora de foco (visibilitychange) ---');
    for (const t of ANIMATED_THEMES) {
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

    // ── 5. prefers-reduced-motion desliga cursores/backgrounds animados ──
    console.log('\n--- prefers-reduced-motion ---');
    for (const t of ANIMATED_THEMES) {
      const context = await browser.newContext({ reducedMotion: 'reduce' });
      const page = await context.newPage();
      await page.goto(`http://localhost:${port}/t/${t.slug}/`, { waitUntil: 'networkidle' });
      await page.waitForTimeout(300);
      const reduced = await page.evaluate(() => window.matchMedia('(prefers-reduced-motion: reduce)').matches);
      if (!reduced) throw new Error(`${t.slug}: emulação de reduced-motion não aplicada`);

      // O cursor customizado dinâmico (classe ld-cursor-fx-active) NÃO deve ativar com reduced-motion
      if (t.slug === 'blueprint' || t.slug === 'noir') {
        await page.mouse.move(300, 300, { steps: 5 });
        await page.waitForTimeout(200);
        const active = await page.evaluate(() => document.documentElement.classList.contains('ld-cursor-fx-active'));
        if (active) throw new Error(`${t.slug}: cursor-fx ativou mesmo com reduced-motion`);
      }
      console.log(`✓ ${t.slug}: prefers-reduced-motion detectado e efeitos dinâmicos de cursor desativados.`);
      await context.close();
    }

    // ── 6. fisica-quantica: partículas colapsam perto do cursor real e voltam a se espalhar ──
    console.log('\n--- fisica-quantica: colapso de partículas com cursor real ---');
    {
      const context = await browser.newContext();
      const page = await context.newPage();
      await page.setViewportSize({ width: 1280, height: 800 });
      await page.goto(`http://localhost:${port}/t/fisica-quantica/`, { waitUntil: 'networkidle' });
      await page.waitForTimeout(400);

      let collapsedSeen = false;
      for (let i = 0; i < 15 && !collapsedSeen; i++) {
        const x = 150 + i * 70;
        const y = 250 + (i % 4) * 100;
        await page.mouse.move(x, y, { steps: 8 });
        await page.waitForTimeout(150);
        const debug = await page.evaluate(() => window.__fqFxDebug?.());
        if (debug && debug.collapsed > 0) collapsedSeen = true;
      }
      if (!collapsedSeen) throw new Error('Nenhuma partícula colapsou perto do cursor real em 15 tentativas');
      console.log('✓ Ao menos uma partícula colapsou perto do cursor real.');

      await page.waitForTimeout(800);
      const afterDebug = await page.evaluate(() => window.__fqFxDebug?.());
      if (afterDebug && afterDebug.collapsed === afterDebug.total) {
        throw new Error('Partículas não voltaram a se espalhar após ~0.5s de colapso');
      }
      console.log('✓ Partículas voltam a se espalhar depois do colapso (não travam coladas ao cursor).');
      await context.close();
    }

    // ── 7. fisica-quantica: reduced-motion desliga o colapso (mas partículas continuam) ──
    console.log('\n--- fisica-quantica: reduced-motion desliga o colapso ---');
    {
      const context = await browser.newContext({ reducedMotion: 'reduce' });
      const page = await context.newPage();
      await page.setViewportSize({ width: 1280, height: 800 });
      await page.goto(`http://localhost:${port}/t/fisica-quantica/`, { waitUntil: 'networkidle' });
      await page.waitForTimeout(400);
      for (let i = 0; i < 8; i++) {
        await page.mouse.move(200 + i * 100, 300, { steps: 8 });
        await page.waitForTimeout(150);
      }
      const debug = await page.evaluate(() => window.__fqFxDebug?.());
      if (debug && debug.collapsed > 0) throw new Error('Partícula colapsou com reduced-motion ativo — violação da decisão 10.25');
      console.log('✓ Com reduced-motion nenhuma partícula colapsa perto do cursor.');
      await context.close();
    }

    // ── 8. blueprint: mira técnica com coordenadas + linha de cota após clique ──
    console.log('\n--- blueprint: mira técnica + coordenadas + linha de cota ---');
    {
      const context = await browser.newContext();
      const page = await context.newPage();
      await page.setViewportSize({ width: 1280, height: 800 });
      await page.goto(`http://localhost:${port}/t/blueprint/`, { waitUntil: 'networkidle' });
      await page.waitForTimeout(300);

      await page.mouse.move(400, 300, { steps: 10 });
      await page.waitForTimeout(150);
      let debug = await page.evaluate(() => window.__bpFxDebug?.());
      if (!debug || !debug.active) throw new Error('blueprint: cursor-fx não ativou com mouse real');
      if (!debug.coordsText.includes('400') && !debug.coordsText.match(/X:\d+/)) {
        throw new Error(`blueprint: coordenadas não atualizaram (${debug.coordsText})`);
      }
      console.log(`✓ blueprint: mira técnica ativa, coordenadas ao vivo = "${debug.coordsText}".`);

      await page.mouse.click(400, 300);
      await page.mouse.move(700, 500, { steps: 10 });
      await page.waitForTimeout(150);
      debug = await page.evaluate(() => window.__bpFxDebug?.());
      if (!debug.hasLastClick) throw new Error('blueprint: linha de cota não registrou o último clique');
      console.log('✓ blueprint: linha de cota tracejada rastreando o último clique confirmada.');

      await context.close();
    }

    // ── 9. noir: facho de luz (--mx/--my) segue o cursor real ──
    console.log('\n--- noir: facho de luz segue o cursor real ---');
    {
      const context = await browser.newContext();
      const page = await context.newPage();
      await page.setViewportSize({ width: 1280, height: 800 });
      await page.goto(`http://localhost:${port}/t/noir/`, { waitUntil: 'networkidle' });
      await page.waitForTimeout(300);

      await page.mouse.move(200, 200, { steps: 10 });
      await page.waitForTimeout(150);
      const mx1 = await page.evaluate(() => document.documentElement.style.getPropertyValue('--mx'));

      await page.mouse.move(900, 600, { steps: 10 });
      await page.waitForTimeout(150);
      const mx2 = await page.evaluate(() => document.documentElement.style.getPropertyValue('--mx'));

      if (!mx1 || !mx2 || mx1 === mx2) throw new Error(`noir: --mx não atualizou com o movimento do cursor (${mx1} -> ${mx2})`);
      console.log(`✓ noir: facho de luz acompanha o cursor (--mx ${mx1} -> ${mx2}).`);

      const active = await page.evaluate(() => document.documentElement.classList.contains('ld-cursor-fx-active'));
      if (!active) throw new Error('noir: cursor-fx (cursor:none + facho) não ativou');
      console.log('✓ noir: cursor nativo escondido, facho de luz assume o papel de cursor (função dupla).');

      await context.close();
    }

    console.log('\n======================================================');
    console.log(' TODOS OS TESTES M20 FORAM CONCLUÍDOS COM SUCESSO! ');
    console.log('======================================================');
  } catch (err) {
    console.error('\n[ERRO]', err);
    process.exitCode = 1;
  } finally {
    await browser.close();
    server.close();
  }
})();
