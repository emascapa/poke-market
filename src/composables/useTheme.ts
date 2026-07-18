import { ref, watchEffect } from 'vue'

type Theme = 'light' | 'dark'

const STORAGE_KEY = 'poke_market_theme'

/** Rileva la preferenza di tema del sistema operativo. */
function getSystemTheme(): Theme {
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
}

/**
 * Stato globale del tema — condiviso tra tutti i component che usano il composable.
 * Viene inizializzato dal localStorage o dalla preferenza di sistema.
 */
/* Il tema predefinito è sempre light; si usa il valore salvato se l'utente ha già espresso una preferenza */
const theme = ref<Theme>((localStorage.getItem(STORAGE_KEY) as Theme | null) ?? 'light')

/* Applica l'attributo data-theme sull'elemento root e persiste nel localStorage */
watchEffect(() => {
  document.documentElement.setAttribute('data-theme', theme.value)
  localStorage.setItem(STORAGE_KEY, theme.value)
})

export function useTheme() {
  /** Alterna il tema tra light e dark. */
  function toggleTheme(): void {
    theme.value = theme.value === 'light' ? 'dark' : 'light'
  }

  return { theme, toggleTheme }
}
