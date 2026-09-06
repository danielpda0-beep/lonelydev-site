# Créditos de Fontes e Licenças (M19)

Este documento registra a procedência, autoria e licenças das fontes auto-hospedadas dos 4 temas
entregues no M19 (`arcade`, `vintage`, `fundo-do-mar`, `espaco-sideral`), em cumprimento à
**Decisão 10.18** de `Site Lonely Dev - Temas & Cinematografia.md` e à seção 2.6 de `docs/temas.md`.

## 1. Princípios

- **100% licença livre (SIL Open Font License 1.1)**: nenhuma fonte de licença comercial restrita.
- **Auto-hospedadas, zero CDN de terceiro**: todos os arquivos `.woff2` vivem em `public/fonts/<slug>/`
  e são servidos pelo próprio domínio do site — nenhuma requisição a Google Fonts ou qualquer CDN externo.
- **Subset já aplicado**: os arquivos usados são o subset `latin` publicado oficialmente pelo projeto
  Fontsource (fontsource.org), que reempacota as mesmas fontes do Google Fonts em arquivos `.woff2`
  auto-hospedáveis, sem alterar a licença original.
- **Máximo 2 famílias por tema** (limite do contrato de tema), respeitado nos 4 temas.

## 2. Tabela de Arquivos e Procedência

| Tema | Arquivo no Projeto | Família | Autor original | Licença | Uso |
|---|---|---|---|---|---|
| `arcade` | `public/fonts/arcade/press-start-2p-latin-400-normal.woff2` | Press Start 2P | Cody "CodyMan38" Boisclair | [SIL OFL 1.1](https://openfontlicense.org/) | Fonte de destaque (headings, wordmark, badges) |
| `arcade` | `public/fonts/arcade/vt323-latin-400-normal.woff2` | VT323 | Peter Hull | [SIL OFL 1.1](https://openfontlicense.org/) | Fonte de corpo (parágrafos, listas) |
| `vintage` | `public/fonts/vintage/special-elite-latin-400-normal.woff2` | Special Elite | Astigmatic (Brian J. Bonislawsky) | [SIL OFL 1.1](https://openfontlicense.org/) | Única família do tema — máquina de escrever, headings e corpo |
| `fundo-do-mar` | `public/fonts/fundo-do-mar/comfortaa-latin-700-normal.woff2` | Comfortaa | Johan Aakerlund | [SIL OFL 1.1](https://openfontlicense.org/) | Fonte de destaque (headings, wordmark) |
| `fundo-do-mar` | `public/fonts/fundo-do-mar/inter-latin-400-normal.woff2` | Inter | Rasmus Andersson | [SIL OFL 1.1](https://openfontlicense.org/) | Fonte de corpo |
| `espaco-sideral` | `public/fonts/espaco-sideral/orbitron-latin-700-normal.woff2` | Orbitron | Matt McInerney | [SIL OFL 1.1](https://openfontlicense.org/) | Fonte de destaque (headings, wordmark) |
| `espaco-sideral` | `public/fonts/espaco-sideral/inter-latin-400-normal.woff2` | Inter | Rasmus Andersson | [SIL OFL 1.1](https://openfontlicense.org/) | Fonte de corpo |

## 3. Orçamento de performance (Decisão de defaults técnicos)

Peso combinado (não comprimido) dos `.woff2` por tema, dentro do limite de 60KB de fontes por rota:

| Tema | Peso combinado |
|---|---|
| `arcade` | ~30KB (12,5KB + 17,9KB) |
| `vintage` | ~53KB (única família) |
| `fundo-do-mar` | ~37KB (13,4KB + 23,7KB) |
| `espaco-sideral` | ~30KB (6,5KB + 23,7KB) |

`Inter` é reaproveitado (mesmo arquivo `latin-400-normal`) entre `fundo-do-mar` e `espaco-sideral`, mas
cada rota carrega apenas o arquivo do próprio diretório `public/fonts/<slug>/` — nenhum tema baixa fonte
de outro tema.

## 4. Texto completo da licença

O texto integral da SIL Open Font License 1.1 está disponível em
[openfontlicense.org](https://openfontlicense.org/) e permite uso, modificação, subsetting e
redistribuição embutida (incluindo em produtos comerciais), desde que a fonte não seja vendida
isoladamente — condição respeitada aqui, já que os arquivos servem exclusivamente para renderizar
o site Lonely Dev.
