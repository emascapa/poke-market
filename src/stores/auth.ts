import { ref, computed } from 'vue'
import { defineStore } from 'pinia'
import { login as loginApi } from '@/services/authApi'
import type { LoginRequest } from '@/types/pokemon'

// Chiavi usate per persistere le credenziali nel localStorage
const TOKEN_KEY = 'poke_market_token'
const USERNAME_KEY = 'poke_market_user'

export const useAuthStore = defineStore('auth', () => {
  // Stato inizializzato dal localStorage se l'utente aveva già una sessione attiva
  const token = ref<string | null>(localStorage.getItem(TOKEN_KEY))
  const username = ref<string | null>(localStorage.getItem(USERNAME_KEY))

  /** true se l'utente è autenticato (token presente) */
  const isAuthenticated = computed(() => token.value !== null)

  /**
   * Chiama FakeStoreAPI, salva il token restituito in memoria e localStorage.
   * Lancia eccezione in caso di credenziali errate o errore di rete.
   */
  async function login(credentials: LoginRequest): Promise<void> {
    const response = await loginApi(credentials)
    token.value = response.token
    username.value = credentials.username
    localStorage.setItem(TOKEN_KEY, response.token)
    localStorage.setItem(USERNAME_KEY, credentials.username)
  }

  /** Cancella sessione dalla memoria e dal localStorage. */
  function logout(): void {
    token.value = null
    username.value = null
    localStorage.removeItem(TOKEN_KEY)
    localStorage.removeItem(USERNAME_KEY)
  }

  return { token, username, isAuthenticated, login, logout }
})
