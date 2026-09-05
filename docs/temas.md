# Temas — Contrato, Tokens CSS e Layouts Bespoke (M14 + M16)

Este documento estabelece o **contrato formal de temas** do Lonely Dev, atualizado no milestone **M16** para suportar **layouts bespoke por tema** mantendo a **regra dura de conteúdo único (Decisão 10.9)**.

---

## 1. Arquitetura do Sistema de Temas

O Lonely Dev possui um **motor de temas com layouts bespoke**, onde cada tema tem liberdade total de reorganização visual na Home e na vitrine `/temas`, enquanto preserva rigorosamente a integridade do catálogo de serviços e o conteúdo do site.

- **Layout Base Unificado (`Layout.astro`):** Provê cabeçalho sticky com wordmark, gaveta lateral de seleção de temas, botão de áudio persistente, transições de página nativas (`ClientRouter` / View Transitions) e rodapé compartilhado.
- **Home Bespoke (`src/themes/<slug>/Home.astro`):** Cada tema tem sua própria composição estrutural e espacial para a Home (Decisão 10.5 e 10.13).
- **Cartão do Tema (`src/themes/<slug>/ThemeCard.astro`):** Componente de apresentação fornecido pelo tema para compor o catálogo na página `/temas` (M17).
- **7 Páginas Internas Vestidas (Decisão 10.13):** As 7 páginas internas (*Serviços, Automação & IA, Como funciona, Sobre, Contato, FAQ, Privacidade*) mantêm **uma estrutura comum única**, que herda paleta de tokens, tipografia, fundo animado/estático e microanimações do tema ativo. Elas **não** ganham layout próprio por tema.
- **Geração Estática (SSG) & SEO:** Rotas pré-renderizadas em `/t/<slug>/` e rotas canônicas padrão. O tema padrão do visitante novo é sempre o `matrix` (Decisão 10.10). Script bloqueante no `<head>` aplica `data-theme` do `localStorage` para eliminar *FOUC*.
- **Acessibilidade & Kill-Switch:** Respeito absoluto a `prefers-reduced-motion: reduce` (neutraliza toda e qualquer animação) e contraste AA obrigatório em todos os temas.

---

## 2. O que CADA Tema é Obrigado a Fornecer

Ao criar uma pasta em `src/themes/<slug>/`, o desenvolvedor deve obrigatoriamente fornecer:

1. **`Home.astro` (Layout Bespoke da Home):**
   - Estrutura visual própria e exclusiva do tema.
   - **Obrigatório:** Consumir os dados exclusivamente das Content Collections (`getCollection('servicos')`) e do modelo compartilhado `src/data/homeContent.ts`.
2. **`ThemeCard.astro` (Cartão de Vitrine para `/temas`):**
   - Miniatura/preview visual da estética do tema.
   - Nome, raciocínio de design e botão de navegação para `/t/<slug>/`.
3. **`theme.json` (Metadados do Tema):**
   - `id` (slug correspondente à pasta).
   - `name` (nome legível de exibição).
   - `tagline` (chamada rápida da estética).
   - `description` (2-3 linhas explicando a decisão de design por trás do tema).
   - `palette` (`primary`, `background`, `text` para swatches de interface).
4. **Bloco de Tokens CSS em `src/styles/global.css`:**
   - Declaração estrita em `[data-theme="<slug>"]` contendo todas as variáveis do contrato de tokens (Cores base, Cores de estado, Tipografia e Tokens auxiliares).
5. **Fundo do Tema (Background):**
   - Textura, gradiente, ou canvas interativo leve (ex.: chuva Matrix permanente no tema base; no futuro, cáusticas do fundo do mar, starfield do espaço, etc.).
   - Deve desativar ou congelar quando perder foco (`visibilitychange`) e respeitar o kill-switch de movimento reduzido.
6. **Fontes & Tipografia:**
   - Fontes de sistema ou fontes livres auto-hospedadas com subset (SIL/OFL), no máximo 2 famílias por tema.
   - **Zero dependência externa:** Nenhuma requisição a CDNs de terceiros (Google Fonts, etc.) é permitida, honrando a política de privacidade (M9).
7. **Ambiente Sonoro (M18):**
   - Slot de 1 loop de ambiente CC0/licença livre (10-20s) a ser plugado pelo kit de áudio no M18 (mudo por padrão).

---

## 3. O que um Tema NÃO PODE Ter (A Regra Dura 10.9)

A **Regra 10.9** é uma lei arquitetural de sobrevivência: **o conteúdo é escrito uma vez só**. Um tema que viole qualquer regra abaixo é considerado **bug**, não estilo:

- 🚫 **PROIBIDO texto próprio de conteúdo hardcoded:** Nenhum parágrafo descritivo, resumo de serviço ou texto institucional pode ser digitado dentro de `src/themes/<slug>/`.
- 🚫 **PROIBIDO dados de serviço, preço ou prazo hardcoded:** Valores como `R$ 900`, prazos como `7 dias` e nomes de serviço devem vir unicamente de `getCollection('servicos')`. Se um serviço novo ou alteração de preço entrar na collection, ela aparece nos 18 temas sem ninguém editar 18 arquivos.
- 🚫 **PROIBIDO quebrar contraste AA:** Todo tema deve atingir razão mínima de contraste de 4.5:1 para texto normal e 3:1 para texto grande.
- 🚫 **PROIBIDO bibliotecas externas ou chamadas a APIs terceiras:** O tema deve ser autossuficiente e respeitar o orçamento de performance (≤ 60KB CSS, ≤ 40KB JS por tema).

### Validação Automatizada da Regra 10.9
O repositório conta com um linter automatizado para garantir que a regra 10.9 não seja violada:
```bash
npm run validate:rule-10-9
```
O script varre todos os arquivos dentro de `src/themes/` e falha se encontrar textos literais de serviços, preços, taglines ou garantias que deveriam ser importados do catálogo central.

---

## 4. Contrato de Tokens CSS (src/styles/global.css)

Para cada tema adicionado, um bloco com **todos** os tokens abaixo deve ser definido:

### 4.1 Cores Base
```css
  --color-bg: #...;            /* Fundo principal da página */
  --color-bg-secondary: #...;  /* Fundo de cabeçalhos, rodapés, e sub-seções */
  --color-text: #...;          /* Texto padrão legível */
  --color-text-muted: #...;    /* Texto secundário / placeholder */
  --color-accent: #...;        /* Cor de destaque principal (botões primários, links ativos) */
  --color-accent-hover: #...;  /* Cor do accent ao focar/hover */
  --color-border: #...;        /* Bordas de cartões e separadores visíveis */
  --color-on-accent: #...;     /* Cor do texto DENTRO de botões/badges do accent */
```

### 4.2 Cores de Estado
```css
  --color-success: #...;       
  --color-success-text: #...;  
  --color-error: #...;         
  --color-error-text: #...;    
  --color-error-danger: #...;  
```

### 4.3 Tipografia
```css
  --font-sans: ...;            /* Font stack padrão sem serifa */
  --font-mono: ...;            /* Font stack monoespaçada */
```

### 4.4 Tokens Auxiliares
```css
  --color-bg-alt: #...;
  --color-bg-overlay: rgba(...);
  --color-border-subtle: rgba(...);
  --color-danger-bg: #...;
  --color-danger-border: #...;
  --color-danger-text: #...;
  --color-text-secondary: #...;
```

---

## 5. Layouts Bespoke de Referência (M16)

O sistema entrega dois layouts de referência completamente distintos na Home:

### 5.1 Tema `business` (Sóbrio / Executivo)
- **Conceito:** Estética sóbria, linear e corporativa em grafite escuro (`#1a1a1e`) e âmbar (`#f5a623`).
- **Estrutura:** Hero minimalista e focado em conversão, grid 2x2 executivo para pilares (com destaque de largura total para o Carro-chefe Automação & IA), esteira linear de 3 passos, cards corporativos de pacotes fixos e chamada formal.
- **Efeitos visuais:** Zero distração, superfícies sólidas, bordas limpas e foco absoluto em clareza de proposta.

### 5.2 Tema `matrix` (Holográfico Minority Report — Decisão 10.21)
- **Conceito:** Cockpit holográfico e terminal futurista em ciano (`#22d3ee`) sobre azul-noite profundo (`#0a1420`).
- **Estrutura:** Interface assimétrica tipo HUD com ticker de telemetria superior, hero de comando com painel principal e pod lateral de especificação técnica (árvore de protocolo), matriz de sistemas modulares (`MOD_01` a `MOD_04`), esteira de nós conectados (`FASE_01` a `FASE_03`) e células de implementação com displays digitais luminosos.
- **Superfície Translúcida (Decisão 10.21):** Fundo semitransparente (`rgba(10, 20, 32, 0.65)`), desfoque de fundo (`backdrop-filter: blur(12px)`), borda fina luminosa em ciano com cantoneiras técnicas, sombra de flutuação projetada e a chuva de código do M15 visível caindo esmaecida atrás dos painéis.
- **Fallback AA:** Onde `backdrop-filter` não for suportado, recebe fundo sólido semitransparente (`rgba(10, 20, 32, 0.94)`), garantindo legibilidade e conformidade total com acessibilidade WCAG AA.

---

## 6. As 7 Páginas Internas Vestidas (Decisão 10.13)

As páginas internas:
1. `/servicos`
2. `/servicos/automacao-e-ia`
3. `/como-funciona`
4. `/sobre`
5. `/contato`
6. `/faq`
7. `/privacidade`

Compartilham a mesma estrutura HTML e os mesmos componentes semânticos. Elas se "vestem" do tema ativo através de:
- Troca de todos os tokens CSS (`--color-bg`, `--color-text`, `--color-accent`, etc.).
- Adoção das fontes tipográficas do tema.
- Fundo contínuo (no tema Matrix, o canvas permanente `matrix-bg-canvas` roda ao fundo de todas as páginas).
- Aplicação das superfícies translúcidas com `backdrop-filter: blur(10px)` nos cards e painéis (`global.css`).
- Microanimações de glitch sutil sem reflow (Decisão 10.11).

---

## 7. Como Criar um Novo Tema (Passo a Passo)

1. Crie a pasta `src/themes/<slug>/`.
2. Crie `theme.json` com id, nome, tagline, descrição (2-3 linhas) e paleta.
3. Crie `ThemeCard.astro` consumindo `theme.json` e exibindo o preview do tema.
4. Crie `Home.astro` construindo o layout bespoke do tema, consumindo `getCollection('servicos')` e `homeContent` (sem texto hardcoded!).
5. Registre o tema em `src/themes/index.ts`.
6. Adicione o bloco `[data-theme="<slug>"]` em `src/styles/global.css` com todos os tokens obrigatórios.
7. Adicione a rota em `src/pages/t/[theme]/*` (ou no gerador de caminhos estáticos).
8. Adicione a opção na gaveta de seleção em `src/layouts/Layout.astro`.
9. Valide a regra 10.9 rodando: `npm run validate:rule-10-9`.
10. Valide o build: `npm run build`.
