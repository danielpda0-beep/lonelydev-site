import fs from 'node:fs';
import path from 'node:path';

const themesDir = path.resolve('src/themes');

// Lista de padrões de conteúdo proibidos de serem hardcodados em src/themes/
// (Devem vir obrigatoriamente de Content Collections ou de src/data/homeContent.ts)
const FORBIDDEN_CONTENT_PATTERNS = [
  { label: 'Preço em Reais hardcoded', regex: /R\$\s*\d+/i },
  { label: 'Tagline do hero hardcoded', regex: /Resolvo seu problema/i },
  { label: 'Tagline parte 2 hardcoded', regex: /materializo sua ideia/i },
  { label: 'Lead do hero hardcoded', regex: /Projeto com come[çc]o, meio e fim/i },
  { label: 'Garantia sem lock-in hardcoded', regex: /Sem mensalidade,\s*sem lock-in/i },
  { label: 'Serviço hardcoded: Landing page', regex: /Landing page r[áa]pida/i },
  { label: 'Serviço hardcoded: Vídeo IA', regex: /V[íi]deo IA curto/i },
  { label: 'Serviço hardcoded: Bot/monitor', regex: /Bot\/monitor de portal/i },
  { label: 'Serviço hardcoded: Extrator de dados', regex: /Extrator de dados/i },
  { label: 'Serviço hardcoded: App mobile', regex: /App mobile simples/i },
  { label: 'Serviço hardcoded: Integrações de IA', regex: /Integra[çc][õo]es de IA/i },
  { label: 'Serviço hardcoded: Desktop apps', regex: /Desktop apps/i },
  { label: 'Passo hardcoded: Briefing texto', regex: /Voc[êe] conta o problema\.\s*Eu devolvo/i },
  { label: 'Passo hardcoded: Orçamento texto', regex: /Pre[çc]o [úu]nico,\s*prazo definido/i },
  { label: 'Passo hardcoded: Entrega texto', regex: /Voc[êe] recebe o projeto funcionando/i },
  { label: 'CTA Final hardcoded', regex: /Tem um problema pontual\?/i },
  { label: 'CTA Final lead hardcoded', regex: /Conta o que voc[êe] precisa\.\s*Eu respondo em at[ée] 1 dia/i },
];

const REQUIRED_THEME_FILES = [
  'Home.astro',
  'ThemeCard.astro',
  'theme.json'
];

let hasErrors = false;

// 1. Validar que diretórios de tema contêm todos os arquivos do contrato
const themeFolders = fs.readdirSync(themesDir, { withFileTypes: true })
  .filter(d => d.isDirectory())
  .map(d => d.name);

console.log(`[Regra 10.9] Verificando ${themeFolders.length} temas em src/themes/...`);

for (const folder of themeFolders) {
  const folderPath = path.join(themesDir, folder);
  for (const reqFile of REQUIRED_THEME_FILES) {
    const filePath = path.join(folderPath, reqFile);
    if (!fs.existsSync(filePath)) {
      console.error(`[ERRO CONTRATO] Tema '${folder}' não implementou '${reqFile}' obrigatório.`);
      hasErrors = true;
    }
  }
}

// 2. Varrer recursivamente src/themes/ procurando por conteúdo hardcoded
// e por acesso direto a Content Collections (M16 complemento: data-prep é centralizado)
const GET_COLLECTION_PATTERN = /getCollection\s*\(/;

function scanDir(dir) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      scanDir(fullPath);
    } else if (entry.isFile() && (entry.name.endsWith('.astro') || entry.name.endsWith('.ts'))) {
      const relativePath = path.relative(process.cwd(), fullPath);
      // Ignora arquivos de dados centrais ou registro se estiverem fora
      if (entry.name === 'index.ts') continue;

      const content = fs.readFileSync(fullPath, 'utf8');
      const lines = content.split('\n');

      lines.forEach((line, index) => {
        // Ignora comentários no código
        const trimmed = line.trim();
        if (trimmed.startsWith('//') || trimmed.startsWith('/*') || trimmed.startsWith('*')) return;

        for (const pattern of FORBIDDEN_CONTENT_PATTERNS) {
          if (pattern.regex.test(line)) {
            console.error(`[VIOLAÇÃO REGRA 10.9] ${relativePath}:${index + 1} - ${pattern.label}`);
            console.error(`  > Linha: ${trimmed}`);
            hasErrors = true;
          }
        }

        if (GET_COLLECTION_PATTERN.test(line)) {
          console.error(`[VIOLAÇÃO REGRA 10.9] ${relativePath}:${index + 1} - Tema chama getCollection direto (data-prep deve vir de src/data/homeContent.ts)`);
          console.error(`  > Linha: ${trimmed}`);
          hasErrors = true;
        }
      });
    }
  }
}

scanDir(themesDir);

if (hasErrors) {
  console.error('\n[FALHA] Validação da regra 10.9 reprovou. Há conteúdo hardcoded ou arquivos de contrato ausentes.');
  process.exit(1);
} else {
  console.log('\n[SUCESSO] Regra 10.9 validada: Nenhum texto de conteúdo hardcoded encontrado em src/themes/. Todos os temas consomem coleções e modelos centrais.');
  process.exit(0);
}
