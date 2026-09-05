import fs from 'fs';

async function run() {
  const html = await fetch('https://lonelydev-site.lonelydevdev.workers.dev/contato/').then(r => r.text());
  const match = html.match(/name="access_key" id="access_key" value="([^"]+)"/);
  if (!match) {
    console.log('Chave nao encontrada.');
    return;
  }
  const key = match[1];
  console.log('Chave:', key);
  
  const formData = new FormData();
  formData.append('access_key', key);
  formData.append('nome', 'Teste Planner API');
  formData.append('contato', 'lonelydevdev@gmail.com');
  formData.append('mensagem', 'Este é um teste de fumaça do site em produção (Prompt 8 via API).');
  
  try {
    const res = await fetch('https://api.web3forms.com/submit', {
      method: 'POST',
      body: formData
    });
    console.log('Status:', res.status);
    console.log('Body:', await res.text());
  } catch(e) {
    console.error('Error:', e);
  }
}
run();
