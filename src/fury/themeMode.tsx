'use client';

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import {flushSync} from 'react-dom';
import {Theme} from '@astryxdesign/core/theme';
import {neutralTheme} from '@astryxdesign/theme-neutral/built';

export type FuryMode = 'dark' | 'light';

const STORAGE_KEY = 'fury-mode';
/** Duração da onda que espalha a cor do botão até a página inteira. */
export const MODE_REVEAL_MS = 760;

type ThemeModeContextValue = {
  mode: FuryMode;
  /**
   * Alterna o modo. `origin` é o elemento de onde a nova cor se espalha
   * (o botão clicado); sem ele, a onda parte do centro da tela.
   */
  toggleMode: (origin?: HTMLElement | null) => void;
};

const ThemeModeContext = createContext<ThemeModeContextValue>({
  mode: 'dark',
  toggleMode: () => {},
});

export function useThemeMode(): ThemeModeContextValue {
  return useContext(ThemeModeContext);
}

function readStoredMode(): FuryMode {
  try {
    return localStorage.getItem(STORAGE_KEY) === 'light' ? 'light' : 'dark';
  } catch {
    return 'dark';
  }
}

type RevealDocument = Document & {
  startViewTransition?: (update: () => void) => {finished: Promise<void>};
};

/**
 * Faz a troca de tema com a View Transitions API: a tela nova entra por um
 * círculo que cresce a partir de `origin` até cobrir a janela inteira
 * (keyframes em fury.css). Sem suporte, ou com movimento reduzido, troca direto.
 */
function revealMode(origin: HTMLElement | null | undefined, apply: () => void) {
  const doc = document as RevealDocument;
  const reduceMotion = window.matchMedia(
    '(prefers-reduced-motion: reduce)',
  ).matches;

  if (!doc.startViewTransition || reduceMotion) {
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
  const [mode, setMode] = useState<FuryMode>(readStoredMode);

  const toggleMode = useCallback(
    (origin?: HTMLElement | null) => {
      const next: FuryMode = mode === 'dark' ? 'light' : 'dark';
      revealMode(origin, () => {
        setMode(next);
        try {
          localStorage.setItem(STORAGE_KEY, next);
        } catch {
          // Sem armazenamento disponível; o modo vale só nesta sessão.
        }
      });
    },
    [mode],
  );

  const value = useMemo(() => ({mode, toggleMode}), [mode, toggleMode]);

  return (
    <ThemeModeContext value={value}>
      <Theme theme={neutralTheme} mode={mode}>
        {children}
      </Theme>
    </ThemeModeContext>
  );
}
