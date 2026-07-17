import type { FlavorTextEntry, Pokemon, PokemonStat } from '@/types/pokemon'

/**
 * Estrae l'ID numerico dall'URL di una risorsa PokeAPI.
 * Es. "https://pokeapi.co/api/v2/pokemon/25/" → 25
 */
export function extractPokemonIdFromUrl(url: string): number {
  const parts = url.split('/').filter(Boolean)
  return parseInt(parts[parts.length - 1] ?? '0', 10)
}

/**
 * Calcola il prezzo di vendita di un pokemon a partire dalle sue stat base.
 *
 * Formula: round(totalBaseStats × 0.15)
 * Range tipici:
 *   - Pokemon deboli  (~300 totale) → ~$45
 *   - Nella media     (~450 totale) → ~$68
 *   - Leggendari      (~700 totale) → ~$105+
 */
export function calculatePrice(stats: PokemonStat[]): number {
  const total = stats.reduce((sum, s) => sum + s.base_stat, 0)
  return Math.round(total * 0.15)
}

/**
 * Restituisce il miglior URL immagine disponibile per un pokemon.
 * Preferisce l'artwork ufficiale; fallback allo sprite frontale, poi a un placeholder.
 */
export function getPokemonImage(sprites: Pokemon['sprites']): string {
  return (
    sprites.other['official-artwork'].front_default ??
    sprites.front_default ??
    '/img/placeholder-pokemon.png'
  )
}

/**
 * Trova il flavor text più recente in inglese per una specie pokemon
 * e normalizza i caratteri di spaziatura anomali presenti nei dati grezzi del gioco.
 */
export function getEnglishFlavorText(entries: FlavorTextEntry[]): string {
  // reverse().find() restituisce l'entry più recente in inglese
  const match = [...entries].reverse().find((e) => e.language.name === 'en')
  return match
    ? match.flavor_text.replace(/\f|\n|\r/g, ' ').replace(/\s{2,}/g, ' ').trim()
    : 'No description available.'
}
