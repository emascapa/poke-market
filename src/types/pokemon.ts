// ============================================================
// Tipi primitivi condivisi da PokeAPI
// ============================================================

export interface NamedAPIResource {
  name: string
  url: string
}

export interface APIResource {
  url: string
}

// ============================================================
// Lista Pokemon  (GET /pokemon?limit=&offset=)
// ============================================================

export type PokemonListItem = NamedAPIResource

export interface PokemonListResponse {
  count: number
  next: string | null
  previous: string | null
  results: PokemonListItem[]
}

// ============================================================
// Dettaglio Pokemon  (GET /pokemon/{id})
// ============================================================

export interface PokemonSprites {
  front_default: string | null
  front_shiny: string | null
  back_default: string | null
  other: {
    'official-artwork': {
      front_default: string | null
      front_shiny: string | null
    }
    dream_world: {
      front_default: string | null
    }
  }
}

export interface PokemonStat {
  base_stat: number
  effort: number
  stat: NamedAPIResource
}

export interface PokemonTypeEntry {
  slot: number
  type: NamedAPIResource
}

export interface PokemonAbility {
  is_hidden: boolean
  slot: number
  ability: NamedAPIResource
}

export interface Pokemon {
  id: number
  name: string
  base_experience: number | null
  height: number
  weight: number
  is_default: boolean
  order: number
  sprites: PokemonSprites
  stats: PokemonStat[]
  types: PokemonTypeEntry[]
  abilities: PokemonAbility[]
  species: NamedAPIResource
}

// ============================================================
// Tipi Pokemon — Categorie  (GET /type/)
// ============================================================

export interface PokemonTypeListResponse {
  count: number
  results: NamedAPIResource[]
}

export interface TypePokemonEntry {
  slot: number
  pokemon: NamedAPIResource
}

export interface PokemonTypeDetail {
  id: number
  name: string
  pokemon: TypePokemonEntry[]
}

// ============================================================
// Specie Pokemon  (GET /pokemon-species/{id})
// ============================================================

export interface FlavorTextEntry {
  flavor_text: string
  language: NamedAPIResource
  version: NamedAPIResource
}

export interface GenusEntry {
  genus: string
  language: NamedAPIResource
}

export interface PokemonSpecies {
  id: number
  name: string
  is_baby: boolean
  is_legendary: boolean
  is_mythical: boolean
  capture_rate: number
  base_happiness: number | null
  flavor_text_entries: FlavorTextEntry[]
  genera: GenusEntry[]
}

// ============================================================
// Autenticazione  (POST https://fakestoreapi.com/auth/login)
// ============================================================

export interface LoginRequest {
  username: string
  password: string
}

export interface LoginResponse {
  token: string
}

// ============================================================
// Tipi di dominio dell'applicazione
// ============================================================

export interface CartItem {
  pokemon: Pokemon
  quantity: number
  price: number
}

export interface WishlistItem {
  pokemon: Pokemon
  price: number
}
