import { chromium } from 'playwright';
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const distDir = path.join(__dirname, '..', 'dist');

function startServer(port = 4332) {
  const mimeTypes = {
    '.html': 'text/html; charset=utf-8',
    '.css': 'text/css; charset=utf-8',
    '.js': 'application/javascript; charset=utf-8',
    '.svg': 'image/svg+xml',
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.ico': 'image/x-icon',
    '.json': 'application/json',
    '.mp3': 'audio/mpeg',
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
      console.log(`Servidor de teste M18 rodando em http://localhost:${port}`);
      resolve(server);
    });
  });
}

let failures = 0;
function check(label, cond) {
  if (cond) {
    console.log(`  OK  ${label}`);
  } else {
    console.log(`  FAIL ${label}`);
    failures++;
  }
}

async function main() {
  const port = 4332;
  const server = await startServer(port);
  const browser = await chromium.launch();

  try {
    const page = await browser.newPage();
    const audioRequests = [];
    page.on('request', (req) => {
      if (req.url().includes('/audio/')) audioRequests.push(req.url());
    });

    console.log('\n[1] Carga inicial (som desligado por padrão) — /t/matrix/');
    await page.goto(`http://localhost:${port}/t/matrix/`, { waitUntil: 'networkidle' });
    await page.waitForTimeout(500);
    check('nenhum request de /audio/ antes de qualquer clique', audioRequests.length === 0);
    const soundOnDefault = await page.evaluate(() => localStorage.getItem('ld-som'));
    check('ld-som não está true por padrão', soundOnDefault !== 'true');

    console.log('\n[2] Clique no botão de som liga o áudio');
    await page.click('#sound-toggle');
    await page.waitForTimeout(800);
    check('ld-som virou true após o clique', await page.evaluate(() => localStorage.getItem('ld-som')) === 'true');
    check('pelo menos 1 request de /audio/ aconteceu após o clique', audioRequests.length > 0);
    check('ambient do matrix foi baixado', audioRequests.some((u) => u.includes('/audio/ambient/matrix.mp3')));

    const audioState1 = await page.evaluate(() => {
      const mgr = window.__LD_AUDIO_MANAGER__;
      return {
        hasCtx: !!mgr && mgr.isEnabled(),
        contextState: mgr && mgr['ctx'] ? mgr['ctx'].state : null,
        ambientUrl: mgr ? mgr['currentAmbientUrl'] : null,
      };
    });
    check('AudioManager reporta isEnabled() = true', audioState1.hasCtx === true);
    check('AudioContext está running', audioState1.contextState === 'running');
    check('ambiente ativo é o do matrix', audioState1.ambientUrl && audioState1.ambientUrl.includes('matrix'));

    console.log('\n[3] Trocar de tema (matrix -> business) crossfada o ambiente');
    const requestsBeforeSwitch = audioRequests.length;
    await page.click('#theme-toggle');
    await page.waitForTimeout(200);
    await page.click('.theme-option[data-theme-id="business"]');
    await page.waitForTimeout(1500);
    check('business.mp3 foi baixado ao trocar de tema', audioRequests.some((u) => u.includes('/audio/ambient/business.mp3')));
    check('houve pelo menos 1 novo request de áudio na troca', audioRequests.length > requestsBeforeSwitch);

    const audioState2 = await page.evaluate(() => {
      const mgr = window.__LD_AUDIO_MANAGER__;
      return { ambientUrl: mgr ? mgr['currentAmbientUrl'] : null };
    });
    check('ambiente ativo agora é o do business', audioState2.ambientUrl && audioState2.ambientUrl.includes('business'));
    check('localStorage ld-tema = business', await page.evaluate(() => localStorage.getItem('ld-tema')) === 'business');

    console.log('\n[4] Desligar o som para de tocar (fade out)');
    await page.click('#sound-toggle');
    await page.waitForTimeout(800);
    check('ld-som voltou para false', await page.evaluate(() => localStorage.getItem('ld-som')) === 'false');

    console.log('\n[5] Reload com ld-som=true persistido: não baixa áudio até um novo gesto');
    const audioRequests2 = [];
    const page2 = await browser.newPage();
    page2.on('request', (req) => {
      if (req.url().includes('/audio/')) audioRequests2.push(req.url());
    });
    await page2.goto(`http://localhost:${port}/t/business/`, { waitUntil: 'networkidle' });
    await page2.evaluate(() => localStorage.setItem('ld-som', 'true'));
    await page2.reload({ waitUntil: 'networkidle' });
    await page2.waitForTimeout(500);
    check('nenhum áudio baixado só de recarregar com ld-som=true (sem gesto novo)', audioRequests2.length === 0);
    check('botão de som já aparece "ligado" (ícone) mesmo antes do gesto', await page2.evaluate(() => {
      const btn = document.getElementById('sound-toggle');
      return btn ? btn.getAttribute('aria-label') === 'Desligar som' : false;
    }));
    await page2.mouse.click(5, 5); // gesto genérico (pointerdown) em qualquer lugar da página
    await page2.waitForTimeout(800);
    check('após o primeiro gesto pós-reload, o ambiente persistido volta a tocar', audioRequests2.some((u) => u.includes('/audio/ambient/business.mp3')));

    console.log(`\n${failures === 0 ? 'TODOS OS TESTES PASSARAM' : `${failures} TESTE(S) FALHARAM`}`);
    process.exitCode = failures === 0 ? 0 : 1;
  } finally {
    await browser.close();
    server.close();
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
