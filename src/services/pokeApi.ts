import axios from 'axios'
import type {
  Pokemon,
  PokemonListResponse,
  PokemonSpecies,
  PokemonTypeDetail,
  PokemonTypeListResponse,
} from '@/types/pokemon'

const client = axios.create({
  baseURL: 'https://pokeapi.co/api/v2',
  timeout: 10_000,
})

// PokeAPI restituisce alcuni tipi non standard (es. shadow, unknown) che non
// sono tipi di battaglia reali. Li escludiamo per non inquinare la navigazione.
const EXCLUDED_TYPES = new Set(['shadow', 'unknown'])

/**
 * Lista paginata di pokemon (solo nome e URL).
 */
export async function fetchPokemonList(limit = 20, offset = 0): Promise<PokemonListResponse> {
  const { data } = await client.get<PokemonListResponse>('/pokemon', {
    params: { limit, offset },
  })
  return data
}

/**
 * Dettaglio completo di un pokemon: sprites, stat e tipi.
 */
export async function fetchPokemon(idOrName: number | string): Promise<Pokemon> {
  const { data } = await client.get<Pokemon>(`/pokemon/${idOrName}`)
  return data
}

/**
 * Tutti i tipi di pokemon (categorie). Esclude i tipi non standard.
 */
export async function fetchTypes(): Promise<PokemonTypeListResponse> {
  const { data } = await client.get<PokemonTypeListResponse>('/type', {
    params: { limit: 100 },
  })
  data.results = data.results.filter((t) => !EXCLUDED_TYPES.has(t.name))
  return data
}

/**
 * Tutti i pokemon appartenenti a un determinato tipo.
 * Restituisce un PokemonTypeDetail (l'array pokemon usa NamedAPIResource).
 */
export async function fetchPokemonByType(typeName: string): Promise<PokemonTypeDetail> {
  const { data } = await client.get<PokemonTypeDetail>(`/type/${typeName}`)
  return data
}

/**
 * Dettaglio della specie, usato per recuperare la descrizione in italiano/inglese.
 */
export async function fetchPokemonSpecies(idOrName: number | string): Promise<PokemonSpecies> {
  const { data } = await client.get<PokemonSpecies>(`/pokemon-species/${idOrName}`)
  return data
}
