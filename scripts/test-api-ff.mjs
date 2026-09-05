import { firefox } from 'playwright';
import path from 'path';

(async () => {
  console.log('Iniciando Firefox...');
  const browser = await firefox.launch({ headless: true });
  const context = await browser.newContext({
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:109.0) Gecko/20100101 Firefox/115.0',
    viewport: { width: 1280, height: 720 }
  });
  const page = await context.newPage();

  page.on('response', response => {
    if (response.url().includes('web3forms')) {
      console.log('WEB3FORMS RESP:', response.status(), response.url());
    }
  });

  console.log('Navegando...');
  await page.goto('https://lonelydev-site.lonelydevdev.workers.dev/contato/', { waitUntil: 'networkidle' });

  await page.fill('input[name="nome"]', 'Teste Planner API');
  await page.fill('input[name="contato"]', 'lonelydevdev@gmail.com');
  await page.fill('textarea[name="mensagem"]', 'Este é um teste de fumaça do site em produção (Prompt 8) via Firefox Playwright.');
  
  await page.click('button[type="submit"]');

  const statusDiv = page.locator('#form-status');
  await statusDiv.waitFor({ state: 'visible', timeout: 15000 });

  const statusText = await statusDiv.textContent();
  console.log(`Texto: ${statusText}`);

  await browser.close();
})();
