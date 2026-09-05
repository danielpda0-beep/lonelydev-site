const fs = require('fs');

const pages = [
  'index.astro',
  'como-funciona.astro',
  'contato.astro',
  'faq.astro',
  'privacidade.astro',
  'servicos.astro',
  'sobre.astro'
];

const wrapperTemplate = ---
import Page from '../../#PAGE#';

export function getStaticPaths() {
  return [
    { params: { theme: 'business' } },
    { params: { theme: 'matrix' } }
  ];
}
---
<Page theme={Astro.params.theme} />
;

pages.forEach(page => {
  fs.writeFileSync('src/pages/t/[theme]/' + page, wrapperTemplate.replace('#PAGE#', page));
});

const automacaoWrapper = ---
import Page from '../../../servicos/automacao-e-ia.astro';

export function getStaticPaths() {
  return [
    { params: { theme: 'business' } },
    { params: { theme: 'matrix' } }
  ];
}
---
<Page theme={Astro.params.theme} />
;
fs.writeFileSync('src/pages/t/[theme]/servicos/automacao-e-ia.astro', automacaoWrapper);