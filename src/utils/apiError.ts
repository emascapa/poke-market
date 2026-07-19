import axios from 'axios'

/**
 * Converte un errore Axios in un messaggio leggibile dall'utente.
 * Copre i casi più comuni: timeout, assenza di rete, risposte HTTP di errore.
 */
export function getApiErrorMessage(error: unknown): string {
  if (axios.isAxiosError(error)) {
    /* Timeout della richiesta */
    if (error.code === 'ECONNABORTED') {
      return 'Request timed out. Please check your connection and try again.'
    }

    /* Nessuna connessione di rete */
    if (error.code === 'ERR_NETWORK' || !error.response) {
      return 'Network error. Please check your internet connection and try again.'
    }

    /* Errori HTTP specifici */
    const status = error.response.status
    if (status === 401) return 'Invalid credentials. Please try again.'
    if (status === 404) return 'The requested resource was not found.'
    if (status === 429) return 'Too many requests. Please wait a moment and try again.'
    if (status >= 500) return 'Server error. Please try again later.'
  }

  /* Fallback generico per errori non-Axios */
  return 'An unexpected error occurred. Please try again.'
}
