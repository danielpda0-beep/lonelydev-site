// src/themes/index.ts
// Registro de Temas — Motor M14 e Layouts Bespoke M16
// Cada tema fornece seu layout de Home, seu cartão para /temas e seus metadados.

import BusinessHome from './business/Home.astro';
import BusinessCard from './business/ThemeCard.astro';
import businessMeta from './business/theme.json';

import MatrixHome from './matrix/Home.astro';
import MatrixCard from './matrix/ThemeCard.astro';
import matrixMeta from './matrix/theme.json';

import ArcadeHome from './arcade/Home.astro';
import ArcadeCard from './arcade/ThemeCard.astro';
import arcadeMeta from './arcade/theme.json';

import VintageHome from './vintage/Home.astro';
import VintageCard from './vintage/ThemeCard.astro';
import vintageMeta from './vintage/theme.json';

import FundoDoMarHome from './fundo-do-mar/Home.astro';
import FundoDoMarCard from './fundo-do-mar/ThemeCard.astro';
import fundoDoMarMeta from './fundo-do-mar/theme.json';

import EspacoSideralHome from './espaco-sideral/Home.astro';
import EspacoSideralCard from './espaco-sideral/ThemeCard.astro';
import espacoSideralMeta from './espaco-sideral/theme.json';

import FisicaQuanticaHome from './fisica-quantica/Home.astro';
import FisicaQuanticaCard from './fisica-quantica/ThemeCard.astro';
import fisicaQuanticaMeta from './fisica-quantica/theme.json';

import PapelETintaHome from './papel-e-tinta/Home.astro';
import PapelETintaCard from './papel-e-tinta/ThemeCard.astro';
import papelETintaMeta from './papel-e-tinta/theme.json';

import BlueprintHome from './blueprint/Home.astro';
import BlueprintCard from './blueprint/ThemeCard.astro';
import blueprintMeta from './blueprint/theme.json';

import NoirHome from './noir/Home.astro';
import NoirCard from './noir/ThemeCard.astro';
import noirMeta from './noir/theme.json';

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
  arcade: {
    ...arcadeMeta,
    Home: ArcadeHome,
    Card: ArcadeCard,
  },
  vintage: {
    ...vintageMeta,
    Home: VintageHome,
    Card: VintageCard,
  },
  'fundo-do-mar': {
    ...fundoDoMarMeta,
    Home: FundoDoMarHome,
    Card: FundoDoMarCard,
  },
  'espaco-sideral': {
    ...espacoSideralMeta,
    Home: EspacoSideralHome,
    Card: EspacoSideralCard,
  },
  'fisica-quantica': {
    ...fisicaQuanticaMeta,
    Home: FisicaQuanticaHome,
    Card: FisicaQuanticaCard,
  },
  'papel-e-tinta': {
    ...papelETintaMeta,
    Home: PapelETintaHome,
    Card: PapelETintaCard,
  },
  blueprint: {
    ...blueprintMeta,
    Home: BlueprintHome,
    Card: BlueprintCard,
  },
  noir: {
    ...noirMeta,
    Home: NoirHome,
    Card: NoirCard,
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
