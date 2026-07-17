import axios from 'axios'
import type { LoginRequest, LoginResponse } from '@/types/pokemon'

// FakeStoreAPI è usata solo per l'autenticazione.
// Credenziali demo: username "johnd", password "m38rmF$"
const AUTH_URL = 'https://fakestoreapi.com/auth/login'

/**
 * Autentica l'utente tramite FakeStoreAPI e restituisce un token JWT.
 * Lancia un AxiosError in caso di credenziali errate (HTTP 401) o errore di rete.
 */
export async function login(credentials: LoginRequest): Promise<LoginResponse> {
  const { data } = await axios.post<LoginResponse>(AUTH_URL, credentials, {
    timeout: 10_000,
  })
  return data
}
