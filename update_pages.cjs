const fs = require('fs');
const path = require('path');

const pages = [
  'src/pages/index.astro',
  'src/pages/como-funciona.astro',
  'src/pages/contato.astro',
  'src/pages/faq.astro',
  'src/pages/privacidade.astro',
  'src/pages/servicos.astro',
  'src/pages/sobre.astro',
  'src/pages/servicos/automacao-e-ia.astro'
];

pages.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');

  // Layout injection
  content = content.replace(/<Layout title="([^"]+)">/g, '<Layout title="$1" theme={theme}>');
  
  if (content.includes("import Layout from '../layouts/Layout.astro';")) {
    content = content.replace("import Layout from '../layouts/Layout.astro';", "import Layout from '../layouts/Layout.astro';\n\nconst { theme = Astro.params.theme || 'business' } = Astro.props;");
  } else if (content.includes("import Layout from '../../layouts/Layout.astro';")) {
    content = content.replace("import Layout from '../../layouts/Layout.astro';", "import Layout from '../../layouts/Layout.astro';\n\nconst { theme = Astro.params.theme || 'business' } = Astro.props;");
  }

  // Color replacements
  content = content.replace(/color:\s*#1a1a1e;/g, 'color: var(--color-on-accent);');
  content = content.replace(/border-color:\s*#1a1a1e;/g, 'border-color: var(--color-on-accent);'); // just in case
  
  content = content.replace(/rgba\(\s*245\s*,\s*166\s*,\s*35\s*,\s*0\s*\)/g, 'transparent');
  content = content.replace(/rgba\(\s*245\s*,\s*166\s*,\s*35\s*,\s*0\.03\s*\)/g, 'color-mix(in srgb, var(--color-accent) 3%, transparent)');
  content = content.replace(/rgba\(\s*245\s*,\s*166\s*,\s*35\s*,\s*0\.04\s*\)/g, 'color-mix(in srgb, var(--color-accent) 4%, transparent)');
  content = content.replace(/rgba\(\s*245\s*,\s*166\s*,\s*35\s*,\s*0\.05\s*\)/g, 'color-mix(in srgb, var(--color-accent) 5%, transparent)');
  content = content.replace(/rgba\(\s*245\s*,\s*166\s*,\s*35\s*,\s*0\.06\s*\)/g, 'color-mix(in srgb, var(--color-accent) 6%, transparent)');
  content = content.replace(/rgba\(\s*245\s*,\s*166\s*,\s*35\s*,\s*0\.1\s*\)/g, 'color-mix(in srgb, var(--color-accent) 10%, transparent)');
  content = content.replace(/rgba\(\s*245\s*,\s*166\s*,\s*35\s*,\s*0\.15\s*\)/g, 'color-mix(in srgb, var(--color-accent) 15%, transparent)');
  content = content.replace(/rgba\(\s*245\s*,\s*166\s*,\s*35\s*,\s*0\.25\s*\)/g, 'color-mix(in srgb, var(--color-accent) 25%, transparent)');
  content = content.replace(/rgba\(\s*245\s*,\s*166\s*,\s*35\s*,\s*0\.3\s*\)/g, 'color-mix(in srgb, var(--color-accent) 30%, transparent)');
  content = content.replace(/rgba\(\s*245\s*,\s*166\s*,\s*35\s*,\s*0\.4\s*\)/g, 'color-mix(in srgb, var(--color-accent) 40%, transparent)');
  
  content = content.replace(/rgba\(\s*0\s*,\s*0\s*,\s*0\s*,\s*0\.2\s*\)/g, 'var(--color-bg-overlay)');
  content = content.replace(/rgba\(\s*0\s*,\s*0\s*,\s*0\s*,\s*0\.25\s*\)/g, 'var(--color-bg-overlay)');
  content = content.replace(/rgba\(\s*255\s*,\s*255\s*,\s*255\s*,\s*0\.04\s*\)/g, 'var(--color-border-subtle)');
  content = content.replace(/rgba\(\s*255\s*,\s*255\s*,\s*255\s*,\s*0\.05\s*\)/g, 'var(--color-border-subtle)');
  content = content.replace(/rgba\(\s*255\s*,\s*255\s*,\s*255\s*,\s*0\.06\s*\)/g, 'var(--color-border-subtle)');
  
  content = content.replace(/#1e1e24/g, 'var(--color-bg-alt)');
  
  content = content.replace(/rgba\(\s*235\s*,\s*87\s*,\s*87\s*,\s*0\.12\s*\)/g, 'color-mix(in srgb, var(--color-error) 12%, transparent)');
  content = content.replace(/rgba\(\s*235\s*,\s*87\s*,\s*87\s*,\s*0\.15\s*\)/g, 'color-mix(in srgb, var(--color-error) 15%, transparent)');
  content = content.replace(/rgba\(\s*235\s*,\s*87\s*,\s*87\s*,\s*0\.3\s*\)/g, 'color-mix(in srgb, var(--color-error) 30%, transparent)');
  content = content.replace(/rgba\(\s*235\s*,\s*87\s*,\s*87\s*,\s*0\.4\s*\)/g, 'color-mix(in srgb, var(--color-error) 40%, transparent)');
  
  content = content.replace(/#211c1d/g, 'var(--color-danger-bg)');
  content = content.replace(/#4a2c2c/g, 'var(--color-danger-border)');
  content = content.replace(/#f0c0c0/g, 'var(--color-danger-text)');
  content = content.replace(/#ff7b72/g, 'var(--color-error-danger)');
  content = content.replace(/#ff9e99/g, 'var(--color-error-text)');
  
  content = content.replace(/rgba\(\s*37\s*,\s*211\s*,\s*102\s*,\s*0\.12\s*\)/g, 'color-mix(in srgb, var(--color-success) 12%, transparent)');
  content = content.replace(/rgba\(\s*37\s*,\s*211\s*,\s*102\s*,\s*0\.4\s*\)/g, 'color-mix(in srgb, var(--color-success) 40%, transparent)');
  content = content.replace(/#72f09d/g, 'var(--color-success-text)');
  
  content = content.replace(/rgba\(\s*160\s*,\s*160\s*,\s*160\s*,\s*0\.15\s*\)/g, 'color-mix(in srgb, var(--color-text-muted) 15%, transparent)');
  content = content.replace(/#d0d0d5/g, 'var(--color-text-secondary)');
  
  content = content.replace(/#25d366/g, 'var(--color-whatsapp-bg)');
  content = content.replace(/#2ee672/g, 'var(--color-whatsapp-bg-hover)');
  content = content.replace(/#112a1a/g, 'var(--color-whatsapp-text)');
  content = content.replace(/#0d2215/g, 'var(--color-whatsapp-text-hover)');

  fs.writeFileSync(file, content, 'utf8');
});