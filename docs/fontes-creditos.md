# Créditos de Fontes e Licenças (M19 + M20 + M21)

Este documento registra a procedência, autoria e licenças das fontes auto-hospedadas dos temas
entregues no M19 (`arcade`, `vintage`, `fundo-do-mar`, `espaco-sideral`), no M20 (`fisica-quantica`,
`papel-e-tinta`, `blueprint`, `noir`) e no M21 (`cyberpunk-toquio`, `solarpunk`, `game-boy`, `steampunk`),
em cumprimento à **Decisão 10.18** de `Site Lonely Dev - Temas & Cinematografia.md` e à seção 2.6 de
`docs/temas.md`.

## 1. Princípios

- **100% licença livre (SIL Open Font License 1.1)**: nenhuma fonte de licença comercial restrita.
- **Auto-hospedadas, zero CDN de terceiro**: todos os arquivos `.woff2` vivem em `public/fonts/<slug>/`
  e são servidos pelo próprio domínio do site — nenhuma requisição a Google Fonts ou qualquer CDN externo.
- **Subset já aplicado**: os arquivos usados são o subset `latin` publicado oficialmente pelo projeto
  Fontsource (fontsource.org), que reempacota as mesmas fontes do Google Fonts em arquivos `.woff2`
  auto-hospedáveis, sem alterar a licença original. Os 8 arquivos do M21 vieram por um caminho
  equivalente — a API pública do `gwfh.mranftl.com` (Google Webfonts Helper), que serve os mesmos
  arquivos `.woff2` subset `latin` hospedados em `fonts.gstatic.com` sob a mesma licença — baixados só
  pra copiar pra `public/fonts/<slug>/` e nunca referenciados por URL externa em produção.
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
| `fisica-quantica` | `public/fonts/fisica-quantica/outfit-latin-400-normal.woff2` | Outfit | Rodrigo Fuenzalida | [SIL OFL 1.1](https://openfontlicense.org/) | Fonte de corpo |
| `fisica-quantica` | `public/fonts/fisica-quantica/outfit-latin-700-normal.woff2` | Outfit | Rodrigo Fuenzalida | [SIL OFL 1.1](https://openfontlicense.org/) | Peso negrito (hero, botões) |
| `fisica-quantica` | `public/fonts/fisica-quantica/ibm-plex-mono-latin-400-normal.woff2` | IBM Plex Mono | IBM / Mike Abbink, Bold Monday | [SIL OFL 1.1](https://openfontlicense.org/) | Fonte de destaque (headings, leituras técnicas/HUD) |
| `papel-e-tinta` | `public/fonts/papel-e-tinta/lora-latin-400-normal.woff2` | Lora | Cyreal | [SIL OFL 1.1](https://openfontlicense.org/) | Fonte de corpo (serifada, leitura longa) |
| `papel-e-tinta` | `public/fonts/papel-e-tinta/playfair-display-latin-700-normal.woff2` | Playfair Display | Claus Eggers Sørensen | [SIL OFL 1.1](https://openfontlicense.org/) | Fonte de destaque (headings editoriais) |
| `blueprint` | `public/fonts/blueprint/inter-latin-400-normal.woff2` | Inter | Rasmus Andersson | [SIL OFL 1.1](https://openfontlicense.org/) | Fonte de corpo |
| `blueprint` | `public/fonts/blueprint/jetbrains-mono-latin-400-normal.woff2` | JetBrains Mono | JetBrains | [SIL OFL 1.1](https://openfontlicense.org/) | Fonte de destaque (headings, anotações técnicas/CAD) |
| `noir` | `public/fonts/noir/inter-latin-400-normal.woff2` | Inter | Rasmus Andersson | [SIL OFL 1.1](https://openfontlicense.org/) | Fonte de corpo |
| `noir` | `public/fonts/noir/cinzel-latin-700-normal.woff2` | Cinzel | Natanael Gama | [SIL OFL 1.1](https://openfontlicense.org/) | Fonte de destaque (headings dramáticos, cartelas) |
| `cyberpunk-toquio` | `public/fonts/cyberpunk-toquio/share-tech-mono-latin-400-normal.woff2` | Share Tech Mono | Carrois Type Design (Ralph du Carrois) | [SIL OFL 1.1](https://openfontlicense.org/) | Fonte de corpo (monoespaçada, terminal) |
| `cyberpunk-toquio` | `public/fonts/cyberpunk-toquio/audiowide-latin-400-normal.woff2` | Audiowide | Astigmatic (Brian J. Bonislawsky) | [SIL OFL 1.1](https://openfontlicense.org/) | Fonte de destaque (headings, letreiro de neon) |
| `solarpunk` | `public/fonts/solarpunk/karla-latin-400-normal.woff2` | Karla | Jonathan Pierini | [SIL OFL 1.1](https://openfontlicense.org/) | Fonte de corpo |
| `solarpunk` | `public/fonts/solarpunk/quicksand-latin-700-normal.woff2` | Quicksand | Andrew Paglinawan | [SIL OFL 1.1](https://openfontlicense.org/) | Fonte de destaque (headings arredondados) |
| `game-boy` | `public/fonts/game-boy/vt323-latin-400-normal.woff2` | VT323 | Peter Hull | [SIL OFL 1.1](https://openfontlicense.org/) | Fonte de corpo (pixel legível) |
| `game-boy` | `public/fonts/game-boy/silkscreen-latin-700-normal.woff2` | Silkscreen | Jason Kottke | [SIL OFL 1.1](https://openfontlicense.org/) | Fonte de destaque (headings, tela de LCD) |
| `steampunk` | `public/fonts/steampunk/eb-garamond-latin-400-normal.woff2` | EB Garamond | Georg Duffner | [SIL OFL 1.1](https://openfontlicense.org/) | Fonte de corpo (serifada, livro vitoriano) |
| `steampunk` | `public/fonts/steampunk/cinzel-latin-700-normal.woff2` | Cinzel | Natanael Gama | [SIL OFL 1.1](https://openfontlicense.org/) | Fonte de destaque (headings, placas de latão) |

## 3. Orçamento de performance (Decisão de defaults técnicos)

Peso combinado (não comprimido) dos `.woff2` por tema, dentro do limite de 60KB de fontes por rota:

| Tema | Peso combinado |
|---|---|
| `arcade` | ~30KB (12,5KB + 17,9KB) |
| `vintage` | ~53KB (única família) |
| `fundo-do-mar` | ~37KB (13,4KB + 23,7KB) |
| `espaco-sideral` | ~30KB (6,5KB + 23,7KB) |
| `fisica-quantica` | ~41,8KB (Outfit 400: 13,7KB + Outfit 700: 13,7KB + IBM Plex Mono 400: 14,4KB) |
| `papel-e-tinta` | ~43,3KB (Lora 400: 20,7KB + Playfair Display 700: 22,7KB — peso 600 da Lora cortado do plano original pra caber no orçamento) |
| `blueprint` | ~43,8KB (Inter 400: 23,1KB + JetBrains Mono 400: 20,7KB — peso 700 do Inter cortado do plano original; negrito sintético do navegador cobre o caso) |
| `noir` | ~37,9KB (Inter 400: 23,1KB + Cinzel 700: 14,8KB) |
| `cyberpunk-toquio` | ~27,1KB (Share Tech Mono 400: 13,2KB + Audiowide 400: 13,8KB) |
| `solarpunk` | ~27,4KB (Karla 400: 12,8KB + Quicksand 700: 14,8KB) |
| `game-boy` | ~24,7KB (VT323 400: 17,5KB + Silkscreen 700: 7,3KB) |
| `steampunk` | ~38,1KB (EB Garamond 400: 23,3KB + Cinzel 700: 14,8KB) |

`Inter` é reaproveitado (mesmo arquivo `latin-400-normal`) entre `fundo-do-mar`, `espaco-sideral`,
`blueprint` e `noir`; `Cinzel` (`latin-700-normal`) entre `noir` e `steampunk`. Em ambos os casos cada
rota carrega apenas o arquivo do próprio diretório `public/fonts/<slug>/` — nenhum tema baixa fonte de
outro tema.

## 4. Texto completo da licença

O texto integral da SIL Open Font License 1.1 está disponível em
[openfontlicense.org](https://openfontlicense.org/) e permite uso, modificação, subsetting e
redistribuição embutida (incluindo em produtos comerciais), desde que a fonte não seja vendida
isoladamente — condição respeitada aqui, já que os arquivos servem exclusivamente para renderizar
o site Lonely Dev.
