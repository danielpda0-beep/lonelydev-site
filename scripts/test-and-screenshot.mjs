import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { spawn } from 'node:child_process';

const distDir = path.resolve('dist');

// 1. Static file server
const mimeTypes = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
};

const server = http.createServer((req, res) => {
  let reqPath = req.url.split('?')[0].split('#')[0];
  if (reqPath === '/') reqPath = '/index.html';
  
  let filePath = path.join(distDir, reqPath);
  if (fs.existsSync(filePath) && fs.statSync(filePath).isDirectory()) {
    filePath = path.join(filePath, 'index.html');
  }

  if (fs.existsSync(filePath) && fs.statSync(filePath).isFile()) {
    const ext = path.extname(filePath);
    res.writeHead(200, { 'Content-Type': mimeTypes[ext] || 'application/octet-stream' });
    fs.createReadStream(filePath).pipe(res);
  } else {
    res.writeHead(404, { 'Content-Type': 'text/plain' });
    res.end('Not Found');
  }
});

server.listen(4321, async () => {
  console.log('Static preview server running on http://127.0.0.1:4321');

  try {
    // 2. Validate HTML anchors in /servicos
    const servicosHtml = fs.readFileSync(path.join(distDir, 'servicos', 'index.html'), 'utf-8');
    const requiredAnchors = [
      'bot-monitor-portal',
      'extrator-dados-relatorio',
      'integracoes-ia',
      'video-ia-curto',
      'imagem-ia',
      'landing-page-rapida',
      'web-apps-sistemas',
      'desktop-apps',
      'app-mobile-simples',
      'jogos-casual',
      'visual-novel',
    ];

    console.log('\n--- Verificando 11 âncoras na página /servicos ---');
    for (const anchor of requiredAnchors) {
      const idMatch = servicosHtml.includes(`id="${anchor}"`);
      const hrefMatch = servicosHtml.includes(`href="#${anchor}"`);
      console.log(`Âncora #${anchor}: Element ID: ${idMatch ? 'OK' : 'FAIL'} | Link href: ${hrefMatch ? 'OK' : 'FAIL'}`);
      if (!idMatch || !hrefMatch) {
        throw new Error(`Âncora #${anchor} inválida ou ausente.`);
      }
    }

    // 3. Validate /como-funciona page content
    console.log('\n--- Verificando conteúdo da página /como-funciona ---');
    const comoHtml = fs.readFileSync(path.join(distDir, 'como-funciona', 'index.html'), 'utf-8');
    const requiredComoItems = [
      'passo-01',
      'passo-02',
      'passo-03',
      'passo-04',
      'Briefing',
      'Orçamento Fechado',
      'Execução',
      'Desvencilhamento',
      'Relatório de Execução',
      'Sem mensalidade',
      'lock-in',
    ];
    const comoHtmlLower = comoHtml.toLowerCase();
    for (const item of requiredComoItems) {
      const exists = comoHtmlLower.includes(item.toLowerCase());
      console.log(`Verificação '${item}': ${exists ? 'OK' : 'FAIL'}`);
      if (!exists) {
        throw new Error(`Item obrigatório '${item}' ausente em /como-funciona.`);
      }
    }

    // 4. Validate /sobre page content
    console.log('\n--- Verificando conteúdo da página /sobre ---');
    const sobreHtml = fs.readFileSync(path.join(distDir, 'sobre', 'index.html'), 'utf-8');
    const requiredSobreItems = [
      'Feito por Daniel Piacentini',
      'Lonely Dev',
      'DP',
      'Transparência técnica',
      'Uso de Inteligência Artificial no processo',
      'ferramentas de inteligência artificial',
      'Direto ao ponto',
      'Escopo e preço fixos',
      'Desvencilhamento real',
    ];
    const sobreHtmlLower = sobreHtml.toLowerCase();
    for (const item of requiredSobreItems) {
      const exists = sobreHtmlLower.includes(item.toLowerCase());
      console.log(`Verificação '${item}': ${exists ? 'OK' : 'FAIL'}`);
      if (!exists) {
        throw new Error(`Item obrigatório '${item}' ausente em /sobre.`);
      }
    }

    // Negative check on /sobre: ensure NO mention of Banco do Brasil, CESUP, or employment
    const forbiddenTerms = ['banco do brasil', 'cesup'];
    for (const term of forbiddenTerms) {
      const found = sobreHtmlLower.includes(term);
      console.log(`Verificação negativa (sem '${term}'): ${!found ? 'OK (não presente)' : 'FAIL (presente!)'}`);
      if (found) {
        throw new Error(`Termo proibido '${term}' encontrado em /sobre.`);
      }
    }

    // 5. Validate /contato page content
    console.log('\n--- Verificando conteúdo da página /contato (M8) ---');
    const contatoHtml = fs.readFileSync(path.join(distDir, 'contato', 'index.html'), 'utf-8');
    const requiredContatoItems = [
      'https://wa.me/5541997577116',
      '5541997577116',
      'lonelydevdev@gmail.com',
      'Respondo em até 1 dia útil',
      'name="nome"',
      'name="contato"',
      'name="mensagem"',
      'name="prazo"',
      'name="orcamento"',
      'https://api.web3forms.com/submit',
      'access_key',
    ];
    const contatoHtmlLower = contatoHtml.toLowerCase();
    for (const item of requiredContatoItems) {
      const exists = contatoHtml.includes(item) || contatoHtmlLower.includes(item.toLowerCase());
      console.log(`Verificação /contato '${item}': ${exists ? 'OK' : 'FAIL'}`);
      if (!exists) {
        throw new Error(`Item obrigatório '${item}' ausente em /contato.`);
      }
    }

    // Negative check on /contato: ensure NO mention of Calendly or Banco do Brasil
    const forbiddenContatoTerms = ['banco do brasil', 'cesup', 'calendly'];
    for (const term of forbiddenContatoTerms) {
      const found = contatoHtmlLower.includes(term);
      console.log(`Verificação negativa /contato (sem '${term}'): ${!found ? 'OK (não presente)' : 'FAIL (presente!)'}`);
      if (found) {
        throw new Error(`Termo proibido '${term}' encontrado em /contato.`);
      }
    }

    // 6. Screenshots with Edge
    const edgePath = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
    const screenshotsDir = path.resolve('docs', 'screenshots');
    if (!fs.existsSync(screenshotsDir)) {
      fs.mkdirSync(screenshotsDir, { recursive: true });
    }

    const screenshotsToTake = [
      {
        url: 'http://127.0.0.1:4321/',
        out: path.join(screenshotsDir, 'm3-home-desktop.png'),
        width: 1440,
        height: 900,
        label: 'Home Desktop (1440px)'
      },
      {
        url: 'http://127.0.0.1:4321/',
        out: path.join(screenshotsDir, 'm3-home-mobile.png'),
        width: 375,
        height: 812,
        label: 'Home Mobile (375px)'
      },
      {
        url: 'http://127.0.0.1:4321/servicos',
        out: path.join(screenshotsDir, 'm4-servicos-desktop.png'),
        width: 1440,
        height: 900,
        label: 'Serviços Desktop (1440px)'
      },
      {
        url: 'http://127.0.0.1:4321/servicos',
        out: path.join(screenshotsDir, 'm4-servicos-mobile.png'),
        width: 375,
        height: 812,
        label: 'Serviços Mobile (375px)'
      },
      {
        url: 'http://127.0.0.1:4321/servicos/automacao-e-ia',
        out: path.join(screenshotsDir, 'm4-automacao-ia-desktop.png'),
        width: 1440,
        height: 900,
        label: 'Automação & IA Desktop (1440px)'
      },
      {
        url: 'http://127.0.0.1:4321/servicos/automacao-e-ia',
        out: path.join(screenshotsDir, 'm4-automacao-ia-mobile.png'),
        width: 375,
        height: 812,
        label: 'Automação & IA Mobile (375px)'
      },
      {
        url: 'http://127.0.0.1:4321/como-funciona',
        out: path.join(screenshotsDir, 'm5-como-funciona-desktop.png'),
        width: 1440,
        height: 900,
        label: 'Como Funciona Desktop (1440px)'
      },
      {
        url: 'http://127.0.0.1:4321/como-funciona',
        out: path.join(screenshotsDir, 'm5-como-funciona-mobile.png'),
        width: 375,
        height: 812,
        label: 'Como Funciona Mobile (375px)'
      },
      {
        url: 'http://127.0.0.1:4321/sobre',
        out: path.join(screenshotsDir, 'm7-sobre-desktop.png'),
        width: 1440,
        height: 900,
        label: 'Sobre Desktop (1440px)'
      },
      {
        url: 'http://127.0.0.1:4321/sobre',
        out: path.join(screenshotsDir, 'm7-sobre-mobile.png'),
        width: 375,
        height: 812,
        label: 'Sobre Mobile (375px)'
      },
      {
        url: 'http://127.0.0.1:4321/contato',
        out: path.join(screenshotsDir, 'm8-contato-desktop.png'),
        width: 1440,
        height: 900,
        label: 'Contato Desktop (1440px)'
      },
      {
        url: 'http://127.0.0.1:4321/contato',
        out: path.join(screenshotsDir, 'm8-contato-mobile.png'),
        width: 375,
        height: 812,
        label: 'Contato Mobile (375px)'
      },
    ];

    console.log('\n--- Capturando Screenshots ---');
    for (const item of screenshotsToTake) {
      console.log(`Gerando screenshot: ${item.label}...`);
      await new Promise((resolve, reject) => {
        const proc = spawn(edgePath, [
          '--headless=new',
          '--disable-gpu',
          `--window-size=${item.width},${item.height}`,
          `--screenshot=${item.out}`,
          item.url,
        ]);
        proc.on('close', (code) => {
          if (code === 0 && fs.existsSync(item.out)) {
            console.log(`✓ Salvo: ${path.relative(process.cwd(), item.out)} (${fs.statSync(item.out).size} bytes)`);
            resolve();
          } else {
            reject(new Error(`Falha ao gerar screenshot para ${item.url} (code ${code})`));
          }
        });
        proc.on('error', reject);
      });
    }

    console.log('\n✅ Todos os testes e screenshots concluídos com sucesso!');
  } catch (err) {
    console.error('Erro na validação:', err);
    process.exitCode = 1;
  } finally {
    server.close();
  }
});
