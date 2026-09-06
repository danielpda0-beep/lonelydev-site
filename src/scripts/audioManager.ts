// src/scripts/audioManager.ts
// Motor de Áudio — Site Lonely Dev (M18)
// Cumpre Decisões 10.8 (mudo por padrão), 10.15 (1 ambiente por tema + kit UI filtrado) e 10.20 (CC0)
// Lazy-loading absoluto: ZERO bytes de áudio baixados antes do primeiro clique em ligar som.

export interface ThemeAudioConfig {
  ambientUrl: string | null;
  filterType: BiquadFilterType;
  filterFreq: number;
  filterQ: number;
}

export const THEME_AUDIO_CONFIGS: Record<string, ThemeAudioConfig> = {
  matrix: {
    ambientUrl: '/audio/ambient/matrix.mp3',
    filterType: 'highpass',
    filterFreq: 600,
    filterQ: 1.2,
  },
  business: {
    ambientUrl: '/audio/ambient/business.mp3',
    filterType: 'lowpass',
    filterFreq: 2200,
    filterQ: 0.7,
  },
  // Decisão 10.15: Temas editoriais terão silêncio deliberado no loop de ambiente
  'papel-e-tinta': {
    ambientUrl: null,
    filterType: 'lowpass',
    filterFreq: 2500,
    filterQ: 0.5,
  },
  'texto-puro': {
    ambientUrl: null,
    filterType: 'lowpass',
    filterFreq: 2500,
    filterQ: 0.5,
  },
};

const DEFAULT_AMBIENT_VOLUME = 0.25; // 25% (dentro do requisito de 20-30%)
const DEFAULT_UI_VOLUME = 0.35;

class AudioManager {
  private ctx: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private uiGain: GainNode | null = null;
  private currentAmbientGain: GainNode | null = null;
  private currentAmbientSource: AudioBufferSourceNode | null = null;
  private currentAmbientUrl: string | null = null;

  private bufferCache = new Map<string, AudioBuffer>();
  private activeTheme = 'matrix';
  private isInitialized = false;
  private isPendingLoad = false;
  private lastHoverTime = 0;
  private listenersAttached = false;

  constructor() {
    // Zero carregamento no construtor
  }

  public isEnabled(): boolean {
    if (typeof window === 'undefined') return false;
    return localStorage.getItem('ld-som') === 'true';
  }

  public getActiveTheme(): string {
    if (typeof document === 'undefined') return 'matrix';
    return document.documentElement.getAttribute('data-theme') || 'matrix';
  }

  private async ensureAudioContext(): Promise<AudioContext | null> {
    if (typeof window === 'undefined') return null;

    if (!this.ctx) {
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioContextClass) return null;
      this.ctx = new AudioContextClass();

      this.masterGain = this.ctx.createGain();
      this.masterGain.gain.setValueAtTime(1.0, this.ctx.currentTime);
      this.masterGain.connect(this.ctx.destination);

      this.uiGain = this.ctx.createGain();
      this.uiGain.gain.setValueAtTime(DEFAULT_UI_VOLUME, this.ctx.currentTime);
      this.uiGain.connect(this.masterGain);
    }

    if (this.ctx.state === 'suspended') {
      try {
        await this.ctx.resume();
      } catch (e) {
        console.warn('[AudioManager] Falha ao resumir AudioContext:', e);
      }
    }

    return this.ctx;
  }

  private async loadBuffer(url: string): Promise<AudioBuffer | null> {
    if (this.bufferCache.has(url)) {
      return this.bufferCache.get(url)!;
    }
    const ctx = await this.ensureAudioContext();
    if (!ctx) return null;

    try {
      const resp = await fetch(url);
      if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
      const arrayBuf = await resp.arrayBuffer();
      const audioBuf = await ctx.decodeAudioData(arrayBuf);
      this.bufferCache.set(url, audioBuf);
      return audioBuf;
    } catch (err) {
      console.warn(`[AudioManager] Falha ao carregar áudio ${url}:`, err);
      return null;
    }
  }

  public async preloadKit(): Promise<void> {
    if (this.isPendingLoad) return;
    this.isPendingLoad = true;

    // Carrega em paralelo os sons compartilhados de UI e o ambiente do tema ativo
    const uiUrls = [
      '/audio/ui/click.mp3',
      '/audio/ui/hover.mp3',
      '/audio/ui/theme-switch.mp3',
    ];

    const currentTheme = this.getActiveTheme();
    const config = THEME_AUDIO_CONFIGS[currentTheme] || THEME_AUDIO_CONFIGS.matrix;
    if (config.ambientUrl) {
      uiUrls.push(config.ambientUrl);
    }

    await Promise.all(uiUrls.map((u) => this.loadBuffer(u)));
    this.isInitialized = true;
    this.isPendingLoad = false;
  }

  public async enableSound(): Promise<void> {
    localStorage.setItem('ld-som', 'true');
    await this.ensureAudioContext();
    await this.preloadKit();
    this.playUI('click');
    await this.setTheme(this.getActiveTheme(), 1.2);
    this.updateToggleButton();
  }

  public disableSound(): void {
    localStorage.setItem('ld-som', 'false');
    this.playUI('click');
    this.stopAmbient(0.6);
    this.updateToggleButton();
  }

  public async toggle(): Promise<void> {
    if (this.isEnabled()) {
      this.disableSound();
    } else {
      await this.enableSound();
    }
  }

  public async setTheme(themeSlug: string, fadeDuration = 1.0): Promise<void> {
    this.activeTheme = themeSlug;
    if (!this.isEnabled()) return;

    const config = THEME_AUDIO_CONFIGS[themeSlug] || THEME_AUDIO_CONFIGS.matrix;
    const targetAmbientUrl = config.ambientUrl;

    if (this.currentAmbientUrl === targetAmbientUrl && this.currentAmbientSource) {
      return; // Já está tocando o ambiente correto
    }

    // Se o tema tiver silêncio deliberado (targetAmbientUrl === null)
    if (!targetAmbientUrl) {
      this.stopAmbient(fadeDuration);
      this.currentAmbientUrl = null;
      return;
    }

    const ctx = await this.ensureAudioContext();
    if (!ctx || !this.masterGain) return;

    const audioBuf = await this.loadBuffer(targetAmbientUrl);
    if (!audioBuf) return;

    // Fade out suave da trilha anterior
    this.stopAmbient(fadeDuration);

    // Cria nova fonte em loop perfeito
    const newSource = ctx.createBufferSource();
    newSource.buffer = audioBuf;
    newSource.loop = true;
    newSource.loopStart = 0;
    newSource.loopEnd = audioBuf.duration;

    const newGain = ctx.createGain();
    const now = ctx.currentTime;
    newGain.gain.setValueAtTime(0.0001, now);
    newGain.gain.linearRampToValueAtTime(DEFAULT_AMBIENT_VOLUME, now + fadeDuration);

    newSource.connect(newGain);
    newGain.connect(this.masterGain);

    newSource.start(0);

    this.currentAmbientSource = newSource;
    this.currentAmbientGain = newGain;
    this.currentAmbientUrl = targetAmbientUrl;
  }

  private stopAmbient(fadeDuration = 0.6): void {
    if (!this.ctx || !this.currentAmbientGain || !this.currentAmbientSource) {
      return;
    }

    const now = this.ctx.currentTime;
    const gainNode = this.currentAmbientGain;
    const sourceNode = this.currentAmbientSource;

    try {
      gainNode.gain.cancelScheduledValues(now);
      gainNode.gain.setValueAtTime(gainNode.gain.value, now);
      gainNode.gain.linearRampToValueAtTime(0.0001, now + fadeDuration);
      setTimeout(() => {
        try {
          sourceNode.stop();
          sourceNode.disconnect();
          gainNode.disconnect();
        } catch (e) {}
      }, fadeDuration * 1000 + 50);
    } catch (e) {
      try {
        sourceNode.stop();
      } catch (err) {}
    }

    this.currentAmbientSource = null;
    this.currentAmbientGain = null;
    this.currentAmbientUrl = null;
  }

  public playUI(type: 'click' | 'hover' | 'theme-switch'): void {
    if (!this.isEnabled() || !this.ctx || this.ctx.state !== 'running' || !this.uiGain) {
      return;
    }

    if (type === 'hover') {
      const now = performance.now();
      if (now - this.lastHoverTime < 60) return; // Throttle de 60ms
      this.lastHoverTime = now;
    }

    const url = `/audio/ui/${type}.mp3`;
    const buffer = this.bufferCache.get(url);
    if (!buffer) return;

    try {
      const source = this.ctx.createBufferSource();
      source.buffer = buffer;

      // Filtro dinâmico por tema (Decisão 10.15)
      const config = THEME_AUDIO_CONFIGS[this.activeTheme] || THEME_AUDIO_CONFIGS.matrix;
      const filter = this.ctx.createBiquadFilter();
      filter.type = config.filterType;
      filter.frequency.setValueAtTime(config.filterFreq, this.ctx.currentTime);
      filter.Q.setValueAtTime(config.filterQ, this.ctx.currentTime);

      source.connect(filter);
      filter.connect(this.uiGain);
      source.start(0);
    } catch (err) {
      console.warn(`[AudioManager] Erro ao tocar UI sound ${type}:`, err);
    }
  }

  public updateToggleButton(): void {
    if (typeof document === 'undefined') return;
    const btn = document.getElementById('sound-toggle');
    if (!btn) return;

    const soundOff = btn.querySelector('.icon-sound-off') as HTMLElement;
    const soundOn = btn.querySelector('.icon-sound-on') as HTMLElement;
    const enabled = this.isEnabled();

    if (enabled) {
      soundOff && (soundOff.style.display = 'none');
      soundOn && (soundOn.style.display = 'block');
      btn.setAttribute('aria-label', 'Desligar som');
      btn.classList.add('is-active');
    } else {
      soundOff && (soundOff.style.display = 'block');
      soundOn && (soundOn.style.display = 'none');
      btn.setAttribute('aria-label', 'Ligar som');
      btn.classList.remove('is-active');
    }
  }

  public setupEventListeners(): void {
    if (typeof window === 'undefined') return;

    // Atualiza estado do botão ao carregar a página (o botão é recriado a cada navegação)
    this.updateToggleButton();

    // Os listeners em `document` sobrevivem às navegações do ClientRouter (mesmo `document`,
    // sem reload) — anexar de novo a cada `astro:page-load` duplicaria os sons de UI.
    if (this.listenersAttached) return;
    this.listenersAttached = true;

    // Se o estado já era 'true' anteriormente (persistência), não faz autoplay direto,
    // mas aguarda o primeiro gesto do usuário para ativar sem violar a política de autoplay
    if (this.isEnabled() && !this.isInitialized) {
      const handleFirstGesture = async () => {
        window.removeEventListener('pointerdown', handleFirstGesture);
        window.removeEventListener('keydown', handleFirstGesture);
        if (this.isEnabled()) {
          await this.ensureAudioContext();
          await this.preloadKit();
          await this.setTheme(this.getActiveTheme(), 1.2);
        }
      };
      window.addEventListener('pointerdown', handleFirstGesture, { once: true });
      window.addEventListener('keydown', handleFirstGesture, { once: true });
    }

    // Delegação global de cliques para feedback de UI
    document.addEventListener(
      'click',
      (e) => {
        const target = e.target as HTMLElement | null;
        if (!target) return;

        // Se clicou no botão de som, o toggle() trata
        if (target.closest('#sound-toggle')) {
          return;
        }

        // Se clicou no botão de tema ou opção de tema
        if (target.closest('#theme-toggle, .theme-option, #drawer-close')) {
          this.playUI('theme-switch');
          return;
        }

        // Se clicou em qualquer link ou botão
        if (target.closest('a, button, [role="button"], input[type="submit"]')) {
          this.playUI('click');
        }
      },
      { passive: true }
    );

    // Delegação global de hover para feedback sutil
    document.addEventListener(
      'pointerover',
      (e) => {
        const target = e.target as HTMLElement | null;
        if (!target) return;
        if (target.closest('a, button, [role="button"], .theme-option, input[type="submit"]')) {
          this.playUI('hover');
        }
      },
      { passive: true }
    );
  }
}

// Singleton anexado ao objeto window para persistir em trocas de rota ClientRouter
declare global {
  interface Window {
    __LD_AUDIO_MANAGER__?: AudioManager;
  }
}

export function getAudioManager(): AudioManager {
  if (typeof window === 'undefined') {
    return new AudioManager();
  }
  if (!window.__LD_AUDIO_MANAGER__) {
    window.__LD_AUDIO_MANAGER__ = new AudioManager();
  }
  return window.__LD_AUDIO_MANAGER__;
}
