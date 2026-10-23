'use client';

import {
  createContext,
  useCallback,
  useContext,
  useLayoutEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import {flushSync} from 'react-dom';
import {Theme} from '@astryxdesign/core/theme';
import {neutralTheme} from '@astryxdesign/theme-neutral/built';

export type FuryMode = 'dark' | 'light';
/** Preferência gravada: claro, escuro ou o tema do sistema operacional. */
export type FuryScheme = FuryMode | 'system';
export type FuryVision =
  | 'typical'
  | 'protanopia'
  | 'protanomaly'
  | 'deuteranopia'
  | 'deuteranomaly'
  | 'tritanopia'
  | 'tritanomaly'
  | 'achromatopsia';
/** Família aplicada em menus, rótulos e texto. */
export type FuryFont = 'system' | 'serif' | 'mono';

const STORAGE_KEY = 'fury-mode';
const VISION_KEY = 'fury-vision';
const FONT_KEY = 'fury-font';
const MOTION_KEY = 'fury-reduce-motion';
/** Duração da onda que espalha a cor do botão até a página inteira. */
export const MODE_REVEAL_MS = 760;

type ThemeModeContextValue = {
  /** Modo efetivo aplicado na tela, já resolvido quando a preferência é o sistema. */
  mode: FuryMode;
  /** O que a pessoa escolheu em Aparência: claro, escuro ou sistema. */
  preference: FuryScheme;
  vision: FuryVision;
  font: FuryFont;
  reduceMotion: boolean;
  /**
   * Alterna o modo. `origin` é o elemento de onde a nova cor se espalha
   * (o botão clicado); sem ele, a onda parte do centro da tela.
   */
  toggleMode: (origin?: HTMLElement | null) => void;
  setPreference: (next: FuryScheme, origin?: HTMLElement | null) => void;
  setVision: (next: FuryVision) => void;
  setFont: (next: FuryFont) => void;
  setReduceMotion: (next: boolean) => void;
};

const ThemeModeContext = createContext<ThemeModeContextValue>({
  mode: 'dark',
  preference: 'dark',
  vision: 'typical',
  font: 'system',
  reduceMotion: false,
  toggleMode: () => {},
  setPreference: () => {},
  setVision: () => {},
  setFont: () => {},
  setReduceMotion: () => {},
});

export function useThemeMode(): ThemeModeContextValue {
  return useContext(ThemeModeContext);
}

function readStoredScheme(): FuryScheme {
  try {
    const value = localStorage.getItem(STORAGE_KEY);
    if (value === 'light' || value === 'dark' || value === 'system') {
      return value;
    }
  } catch {
    // Sem armazenamento: segue o padrão escuro.
  }
  return 'dark';
}

function systemMode(): FuryMode {
  if (typeof window === 'undefined') return 'dark';
  return window.matchMedia('(prefers-color-scheme: dark)').matches
    ? 'dark'
    : 'light';
}

function resolveScheme(scheme: FuryScheme): FuryMode {
  return scheme === 'system' ? systemMode() : scheme;
}

const VISIONS: FuryVision[] = [
  'typical',
  'protanopia',
  'protanomaly',
  'deuteranopia',
  'deuteranomaly',
  'tritanopia',
  'tritanomaly',
  'achromatopsia',
];

function readStoredVision(): FuryVision {
  try {
    const value = localStorage.getItem(VISION_KEY);
    if (value && VISIONS.includes(value as FuryVision)) {
      return value as FuryVision;
    }
  } catch {
    // Sem armazenamento: visão típica.
  }
  return 'typical';
}

const FONTS: FuryFont[] = ['system', 'serif', 'mono'];

function readStoredFont(): FuryFont {
  try {
    const value = localStorage.getItem(FONT_KEY);
    if (value && FONTS.includes(value as FuryFont)) return value as FuryFont;
  } catch {
    // Sem armazenamento: a fonte do sistema.
  }
  return 'system';
}

function readStoredMotion(): boolean {
  try {
    return localStorage.getItem(MOTION_KEY) === 'on';
  } catch {
    return false;
  }
}

type RevealDocument = Document & {
  startViewTransition?: (update: () => void) => {finished: Promise<void>};
};

/** Verdadeiro quando a pessoa pediu menos movimento, ou o sistema já pede. */
export function furyMotionReduced(): boolean {
  if (typeof document === 'undefined') return false;
  if (document.documentElement.dataset.furyReduceMotion === 'on') return true;
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

/**
 * Faz a troca de tema com a View Transitions API: a tela nova entra por um
 * círculo que cresce a partir de `origin` até cobrir a janela inteira
 * (keyframes em fury.css). Sem suporte, ou com movimento reduzido, troca direto.
 */
function revealMode(origin: HTMLElement | null | undefined, apply: () => void) {
  const doc = document as RevealDocument;

  if (!doc.startViewTransition || furyMotionReduced()) {
    apply();
    return;
  }

  const rect = origin?.getBoundingClientRect();
  const x = rect ? rect.left + rect.width / 2 : window.innerWidth / 2;
  const y = rect ? rect.top + rect.height / 2 : window.innerHeight / 2;
  const radius = Math.hypot(
    Math.max(x, window.innerWidth - x),
    Math.max(y, window.innerHeight - y),
  );

  const root = document.documentElement;
  root.style.setProperty('--fury-reveal-x', `${x}px`);
  root.style.setProperty('--fury-reveal-y', `${y}px`);
  root.style.setProperty('--fury-reveal-r', `${Math.ceil(radius)}px`);
  root.setAttribute('data-fury-reveal', '');

  const transition = doc.startViewTransition(() => {
    flushSync(apply);
  });
  transition.finished.finally(() => {
    root.removeAttribute('data-fury-reveal');
  });
}

export function FuryThemeProvider({children}: {children: ReactNode}) {
  const [preference, setPreferenceState] = useState<FuryScheme>(readStoredScheme);
  const [mode, setMode] = useState<FuryMode>(() => resolveScheme(readStoredScheme()));
  const [vision, setVisionState] = useState<FuryVision>(readStoredVision);
  const [font, setFontState] = useState<FuryFont>(readStoredFont);
  const [reduceMotion, setReduceMotionState] = useState(readStoredMotion);

  const setPreference = useCallback(
    (next: FuryScheme, origin?: HTMLElement | null) => {
      revealMode(origin, () => {
        setPreferenceState(next);
        setMode(resolveScheme(next));
        try {
          localStorage.setItem(STORAGE_KEY, next);
        } catch {
          // Sem armazenamento disponível; o modo vale só nesta sessão.
        }
      });
    },
    [],
  );

  const toggleMode = useCallback(
    (origin?: HTMLElement | null) => {
      setPreference(mode === 'dark' ? 'light' : 'dark', origin);
    },
    [mode, setPreference],
  );

  const setVision = useCallback((next: FuryVision) => {
    setVisionState(next);
    try {
      localStorage.setItem(VISION_KEY, next);
    } catch {
      // Sem armazenamento disponível; a correção vale só nesta sessão.
    }
  }, []);

  const setFont = useCallback((next: FuryFont) => {
    setFontState(next);
    try {
      localStorage.setItem(FONT_KEY, next);
    } catch {
      // Sem armazenamento disponível; a fonte vale só nesta sessão.
    }
  }, []);

  const setReduceMotion = useCallback((next: boolean) => {
    setReduceMotionState(next);
    try {
      localStorage.setItem(MOTION_KEY, next ? 'on' : 'off');
    } catch {
      // Sem armazenamento disponível; vale só nesta sessão.
    }
  }, []);

  useLayoutEffect(() => {
    if (preference !== 'system') return;
    const media = window.matchMedia('(prefers-color-scheme: dark)');
    const apply = () => setMode(media.matches ? 'dark' : 'light');
    apply();
    media.addEventListener('change', apply);
    return () => media.removeEventListener('change', apply);
  }, [preference]);

  useLayoutEffect(() => {
    const root = document.documentElement;
    if (vision === 'typical') root.removeAttribute('data-fury-vision');
    else root.setAttribute('data-fury-vision', vision);
  }, [vision]);

  useLayoutEffect(() => {
    const root = document.documentElement;
    if (font === 'system') root.removeAttribute('data-fury-font');
    else root.setAttribute('data-fury-font', font);
  }, [font]);

  useLayoutEffect(() => {
    const root = document.documentElement;
    if (reduceMotion) root.dataset.furyReduceMotion = 'on';
    else delete root.dataset.furyReduceMotion;
  }, [reduceMotion]);

  const value = useMemo(
    () => ({
      mode,
      preference,
      vision,
      font,
      reduceMotion,
      toggleMode,
      setPreference,
      setVision,
      setFont,
      setReduceMotion,
    }),
    [
      mode,
      preference,
      vision,
      font,
      reduceMotion,
      toggleMode,
      setPreference,
      setVision,
      setFont,
      setReduceMotion,
    ],
  );

  return (
    <ThemeModeContext value={value}>
      <Theme theme={neutralTheme} mode={mode}>
        {children}
      </Theme>
    </ThemeModeContext>
  );
}
