import { chromium } from 'playwright';
import path from 'path';
import fs from 'fs';

(async () => {
  const screenshotsDir = path.resolve('docs', 'screenshots');
  if (!fs.existsSync(screenshotsDir)) {
    fs.mkdirSync(screenshotsDir, { recursive: true });
  }

  console.log('Iniciando Edge via Playwright...');
  const browser = await chromium.launch({ channel: 'msedge', headless: true });
  const context = await browser.newContext({
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36 Edg/121.0.0.0'
  });
  const page = await context.newPage();

  console.log('Navegando...');
  await page.goto('https://lonelydev-site.lonelydevdev.workers.dev/contato/', { waitUntil: 'networkidle' });

  await page.fill('input[name="nome"]', 'Teste Planner (Edge)');
  await page.fill('input[name="contato"]', 'lonelydevdev@gmail.com');
  await page.fill('textarea[name="mensagem"]', 'Este é um teste de fumaça do site em produção (Prompt 8 via Edge).');
  
  await page.screenshot({ path: path.join(screenshotsDir, 'm8-contato-producao-preenchido.png'), fullPage: true });

  await page.click('button[type="submit"]');

  const statusDiv = page.locator('#form-status');
  await statusDiv.waitFor({ state: 'visible', timeout: 15000 });

  const statusText = await statusDiv.textContent();
  console.log(`Texto: ${statusText}`);

  if (!statusText.includes('Erro')) {
    await page.screenshot({ path: path.join(screenshotsDir, 'm8-contato-producao-confirmacao.png'), fullPage: true });
  } else {
    console.error('Falha no envio.');
  }

  await browser.close();
})();
