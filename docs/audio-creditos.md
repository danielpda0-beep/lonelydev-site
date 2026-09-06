# Créditos de Áudio e Licenças (M18)

Este documento registra a procedência, autoria, links originais e licenças de todos os arquivos de áudio integrados ao **Site Lonely Dev**, em estrito cumprimento às **Decisões 10.8, 10.15 e 10.20** de `Site Lonely Dev - Temas & Cinematografia.md`.

---

## 1. Princípios e Políticas de Áudio do Projeto

- **Mudo por Padrão (Decisão 10.8):** Nenhum som toca automaticamente ao carregar qualquer página. O áudio só é inicializado e executado após interação deliberada no botão de som.
- **Lazy Loading Estrito:** **Nenhum byte** de arquivo de áudio é baixado pela rede do navegador antes do clique do usuário para ligar o som. Com som desligado, a requisição de rede de áudio é rigorosamente zero.
- **Licenciamento 100% Livre (Decisão 10.20):** Todos os ativos de áudio são de domínio público / Creative Commons Zero (CC0 1.0 Universal). Nenhum arquivo com direitos autorais restritivos, trilhas comerciais ou geração por IA duvidosa foi utilizado nesta etapa.
- **Kit de UI Compartilhado & Filtrado (Decisão 10.15):** 1 kit de UI comum (hover, click, theme-switch) processado via nós de filtragem Web Audio API (`BiquadFilterNode`) com assinaturas espectrais distintas para cada tema.
- **Silêncio Deliberado:** Temas editoriais minimalistas (`papel-e-tinta`, `texto-puro`, etc.) contam com suporte arquitetural a silêncio deliberado (`ambient: null`), priorizando concentração e legibilidade sem poluição sonora.

---

## 2. Tabela de Arquivos e Procedência

| Arquivo no Projeto | Título Original | Autor | Origem / Repositório | Licença | Finalidade |
|---|---|---|---|---|---|
| `public/audio/ambient/matrix.mp3` | Server Room ATMOS.wav (ID 536529) | Smice_6 | [Freesound.org](https://freesound.org/people/Smice_6/sounds/536529/) | [CC0 1.0 Universal](https://creativecommons.org/publicdomain/zero/1.0/) | Loop de ambiente do tema Matrix (hum de servidor / data center) |
| `public/audio/ambient/business.mp3` | Office Ambience (ID 862604) | BeaconStudio | [Freesound.org](https://freesound.org/people/BeaconStudio/sounds/862604/) | [CC0 1.0 Universal](https://creativecommons.org/publicdomain/zero/1.0/) | Loop de ambiente do tema Business (climatização / sala corporativa suave) |
| `public/audio/ui/click.mp3` | click1.wav (UI SFX Set) | Kenney Vleugels (Kenney.nl) | [Kenney UI Audio](https://kenney.nl/assets/ui-audio) | [CC0 1.0 Universal](https://creativecommons.org/publicdomain/zero/1.0/) | Feedback sonoro de clique em botões e links interativos |
| `public/audio/ui/hover.mp3` | rollover2.wav (UI SFX Set) | Kenney Vleugels (Kenney.nl) | [Kenney UI Audio](https://kenney.nl/assets/ui-audio) | [CC0 1.0 Universal](https://creativecommons.org/publicdomain/zero/1.0/) | Micro-feedback sonoro ao passar o mouse em controles interativos |
| `public/audio/ui/theme-switch.mp3` | switch10.wav (UI SFX Set) | Kenney Vleugels (Kenney.nl) | [Kenney UI Audio](https://kenney.nl/assets/ui-audio) | [CC0 1.0 Universal](https://creativecommons.org/publicdomain/zero/1.0/) | Efeito sonoro de abertura de gaveta e transição entre temas |

---

## 3. Detalhes Técnicos de Processamento e Masterização

Todos os arquivos foram normalizados e processados localmente via `ffmpeg` para garantir alta fidelidade, baixo consumo de banda e laço contínuo sem emenda perceptível:

### 3.1 Loops de Ambiente (16 segundos contínuos)
- **`matrix.mp3` (188 KB):**
  - Segmento estável de 18.5s extraído de gravação em alta definição.
  - Crossfade de 2.5s (`acrossfade=d=2.5:c1=tri:c2=tri`) unindo o final ao início do laço, eliminando qualquer clique de descontinuidade de fase.
  - Normalizado para `-24 LUFS` (padrão de áudio ambiente não intrusivo) e codificado em MP3 estéreo 96 kbps.
- **`business.mp3` (188 KB):**
  - Segmento suave de 18.5s de climatização e ambiente acústico executivo.
  - Crossfade de 2.5s idêntico para garantir repetição contínua inaudível.
  - Normalizado para `-24 LUFS` e codificado em MP3 estéreo 96 kbps.

### 3.2 Kit de UI Compartilhado
- **`click.mp3` (2.7 KB):** Pulso mecânico tátil de 100ms, normalizado a `-20 LUFS`.
- **`hover.mp3` (1.9 KB):** Pipo sutil de 60ms, normalizado a `-22 LUFS` (executado com *throttle* de 40ms para evitar saturação ao mover o mouse rapidamente).
- **`theme-switch.mp3` (7.1 KB):** Chime suave de transição de 380ms, normalizado a `-20 LUFS`.

---

## 4. Filtragem Dinâmica por Tema (Web Audio API)

Conforme determinado na Decisão 10.15, o kit de UI não multiplica arquivos no disco. Uma única coleção de sons é adaptada pelo navegador via `BiquadFilterNode`:

- **Tema Matrix:**
  - Filtro: `highpass` (frequência de corte ~500Hz, Q ~1.2) conferindo brilho metálico, cibernético e digital aos cliques e hovers.
- **Tema Business:**
  - Filtro: `lowpass` (frequência de corte ~2200Hz, Q ~0.7) conferindo toque abafado, sóbrio, macio e tátil executivo.
- **Temas Futuros (M19-M22):**
  - Slots de filtros parametrizados prontos (ex.: passa-banda vintage/telefone para `vintage`, ressonância arcade para `arcade`).

---

## 5. Silêncio Deliberado nos Temas Editoriais (Decisão 10.15)

Dos 18 temas do catálogo, só **Business** e **Matrix** existem hoje (M14-M17); os outros 16 entram nos
lotes M19-M22. Avaliando com antecedência os 5 candidatos citados no prompt do M18:

- **Papel & Tinta** e **Texto Puro** são, por definição do próprio catálogo (item 10.7 de
  `Temas & Cinematografia.md`), os dois temas **editoriais puros** do site — "zero efeito" e "o oposto de
  tudo", respectivamente. Decisão: **silêncio deliberado**, sem loop de ambiente. Já implementado em
  `src/scripts/audioManager.ts` (`THEME_AUDIO_CONFIGS['papel-e-tinta']` e `['texto-puro']` com
  `ambientUrl: null`) — quando esses temas forem construídos no M20/M22, o motor de áudio já não toca
  ambiente neles, só resta ao executor daquele milestone confirmar que o slug bate.
- **Noir**, **Vintage** e **Blueprint** **não** são temas de silêncio: o catálogo já prevê identidade
  sonora própria para eles (paralaxe de veneziana + iluminação no Noir, máquina de escrever no Vintage,
  sala de desenho técnico no Blueprint), e nenhum dos três é listado como tema "sem efeito" na tabela de
  detalhe interativo (10.25). Decisão: **ganham loop de ambiente real** quando forem construídos (M19 para
  Vintage, M20 para Blueprint e Noir) — não herdam o tratamento de silêncio dos dois temas editoriais
  puros. Ficam fora do escopo deste M18 só porque os temas em si ainda não existem.
