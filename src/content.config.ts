import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

const servicos = defineCollection({
  loader: glob({ pattern: '*.md', base: './src/content' }),
  schema: z.object({
    nome: z.string(),
    pilar: z.enum(['automacao-ia', 'midia-ia', 'web-apps', 'jogos', 'modelagem-3d']),
    resumo: z.string(),
    entregavel: z.string(),
    prazo_tipico: z.string(),
    modelo_preco: z.enum(['pacote-fixo', 'a-partir-de', 'sob-consulta']),
    valor: z.string().optional(),
    cta: z.string(),
  }),
});

export const collections = { servicos };
