# Temas — Contrato e Tokens CSS (Motor M14+)

Este documento estabelece o contrato visual para a criação e aplicação de temas no Lonely Dev, implementado na Fase Temas (M14). 

## 1. Arquitetura

- **Um único arquivo de Layout** (`Layout.astro`) com prop `theme`.
- **CSS global** centralizado em `global.css`, com reset, responsividade e declarações estritas de variáveis CSS por `[data-theme]`.
- **Geração Estática (SSG):** o Astro pre-renderiza as versões temáticas em caminhos como `/t/<theme>/` e as rotas padrão, e um script bloqueante no `<head>` aplica `data-theme` do `localStorage` para prevenir *FOUC* (Flash Of Unstyled Content).
- **View Transitions:** nativo do Astro permite a troca fluida de temas. A transição é na verdade uma navegação para a URL do tema correspondente, persistindo apenas estados marcados ou localStorage.

## 2. Contrato de Tokens (Obrigatório)

Para implementar um novo tema, basta criar um bloco CSS em `global.css` seguindo **todos** os tokens abaixo. **Nunca utilize hardcoded hex ou rgba em componentes UI.**

### 2.1 Cores Base
```css
  --color-bg: #...;            /* Fundo principal da página */
  --color-bg-secondary: #...;  /* Fundo de cabeçalhos, rodapés, e sub-seções */
  --color-text: #...;          /* Texto padrão legível */
  --color-text-muted: #...;    /* Texto secundário / placeholder */
  --color-accent: #...;        /* Cor de destaque principal (botões primários, links ativos) */
  --color-accent-hover: #...;  /* Cor do accent ao focar/hover */
  --color-border: #...;        /* Bordas de cartões e separadores visíveis */
  --color-on-accent: #...;     /* Cor do texto DENTRO de botões/badges do accent (para contraste) */
```

### 2.2 Cores de Estado
```css
  --color-success: #...;       
  --color-success-text: #...;  
  --color-error: #...;         
  --color-error-text: #...;    
  --color-error-danger: #...;  
```

### 2.3 Tipografia
```css
  --font-sans: ...;            /* Font stack padrão sem serifa */
  --font-mono: ...;            /* Font stack monoespaçada */
```

### 2.4 Tokens Auxiliares
Derivados das cores base e de estado. Idealmente usando `rgba` ou o novo `color-mix`.
```css
  --color-bg-alt: #...;
  --color-bg-overlay: rgba(...);
  --color-border-subtle: rgba(...);
  --color-danger-bg: #...;
  --color-danger-border: #...;
  --color-danger-text: #...;
  --color-text-secondary: #...;
```

## 3. Tokens Fixos (Marca / Layout)
Esses tokens não pertencem a nenhum tema e permanecem globais:
- Brand do WhatsApp (`--color-whatsapp-bg`, etc). O verde do WhatsApp não vira ciano só porque estamos no Matrix.
- Espaçamentos e Breakpoints.

## 4. Kill-Switch
Todo movimento e animação deve respeitar `prefers-reduced-motion: reduce`. Na raíz de `global.css` há o kill-switch absoluto para neutralizar durações.

## 5. Implementação de um Novo Tema (ex: Dark/Light)
1. Adicione a rota no array de param em **todas as pages base**, ou envolva na geração do wrapper em `/t/[theme]/`.
2. Inclua o botão na `theme-drawer` em `Layout.astro`.
3. Defina as variáveis `[data-theme="meunovo"] { ... }` no `global.css`.
