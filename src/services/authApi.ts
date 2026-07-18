import axios from 'axios'
import type { LoginRequest, LoginResponse } from '@/types/pokemon'
import { getApiErrorMessage } from '@/utils/apiError'

// FakeStoreAPI è usata solo per l'autenticazione.
// Credenziali demo: username "johnd", password "m38rmF$"
const AUTH_URL = 'https://fakestoreapi.com/auth/login'

/**
 * Autentica l'utente tramite FakeStoreAPI e restituisce un token JWT.
 * Lancia un errore con messaggio leggibile in caso di credenziali errate o errore di rete.
 */
export async function login(credentials: LoginRequest): Promise<LoginResponse> {
  try {
    const { data } = await axios.post<LoginResponse>(AUTH_URL, credentials, {
      timeout: 10_000,
    })
    return data
  } catch (error) {
    throw new Error(getApiErrorMessage(error))
  }
}
