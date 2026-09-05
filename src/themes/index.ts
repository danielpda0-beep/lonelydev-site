// src/themes/index.ts
// Registro de Temas — Motor M14 e Layouts Bespoke M16
// Cada tema fornece seu layout de Home, seu cartão para /temas e seus metadados.

import BusinessHome from './business/Home.astro';
import BusinessCard from './business/ThemeCard.astro';
import businessMeta from './business/theme.json';

import MatrixHome from './matrix/Home.astro';
import MatrixCard from './matrix/ThemeCard.astro';
import matrixMeta from './matrix/theme.json';

export interface ThemeDefinition {
  id: string;
  name: string;
  tagline: string;
  description: string;
  palette: {
    primary: string;
    background: string;
    text: string;
  };
  Home: any;
  Card: any;
}

export const themes: Record<string, ThemeDefinition> = {
  business: {
    ...businessMeta,
    Home: BusinessHome,
    Card: BusinessCard,
  },
  matrix: {
    ...matrixMeta,
    Home: MatrixHome,
    Card: MatrixCard,
  },
};

export const DEFAULT_THEME = 'matrix';

export function getTheme(slug?: string): ThemeDefinition {
  if (slug && themes[slug]) {
    return themes[slug];
  }
  return themes[DEFAULT_THEME];
}

export function getThemeHome(slug?: string) {
  return getTheme(slug).Home;
}

export function getThemeCard(slug?: string) {
  return getTheme(slug).Card;
}

export function getAllThemes(): ThemeDefinition[] {
  return Object.values(themes);
}
