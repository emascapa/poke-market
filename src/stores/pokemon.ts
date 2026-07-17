import { ref, computed } from 'vue'
import { defineStore } from 'pinia'
import {
  fetchPokemon,
  fetchPokemonByType,
  fetchPokemonList,
  fetchTypes,
} from '@/services/pokeApi'
import { extractPokemonIdFromUrl } from '@/utils/priceCalculator'
import type { NamedAPIResource, Pokemon, PokemonListItem } from '@/types/pokemon'

const PAGINA_SIZE = 20

export const usePokemonStore = defineStore('pokemon', () => {
  // ----------------------------------------------------------------
  // Cache: id → Pokemon (evita di richiamare l'API per dati già scaricati)
  // ----------------------------------------------------------------
  const pokemonCache = ref(new Map<number, Pokemon>())

  // ----------------------------------------------------------------
  // Tipi (categorie) — caricati una sola volta
  // ----------------------------------------------------------------
  const types = ref<NamedAPIResource[]>([])
  const typesLoaded = ref(false)

  // ----------------------------------------------------------------
  // Lista corrente mostrata nella Home
  // ----------------------------------------------------------------
  const pokemonList = ref<PokemonListItem[]>([])
  const totalCount = ref(0)
  const currentPage = ref(0)
  const currentTypes = ref<string[]>([])

  // ----------------------------------------------------------------
  // Stato di caricamento e gestione errori
  // ----------------------------------------------------------------
  const isLoading = ref(false)
  const error = ref<string | null>(null)

  /** Numero totale di pagine in base al conteggio corrente. */
  const totalPages = computed(() => Math.ceil(totalCount.value / PAGINA_SIZE))

  // ----------------------------------------------------------------
  // Azioni
  // ----------------------------------------------------------------

  /**
   * Carica la lista dei tipi di pokemon usati come categorie.
   * La chiamata viene saltata se i tipi sono già stati caricati.
   */
  async function loadTypes(): Promise<void> {
    if (typesLoaded.value) return
    try {
      const response = await fetchTypes()
      types.value = response.results
      typesLoaded.value = true
    } catch (e) {
      console.error('Errore durante il caricamento dei tipi:', e)
    }
  }

  /**
   * Carica una pagina di pokemon.
   * - 0 tipi  → paginazione nativa API
   * - 1 tipo  → filtra per tipo (paginazione lato client)
   * - 2 tipi  → intersezione dei due tipi (fetch parallelo + paginazione lato client)
   */
  async function loadPokemonList(page = 0, types: string[] = []): Promise<void> {
    isLoading.value = true
    error.value = null
    currentPage.value = page
    currentTypes.value = types

    try {
      if (types.length === 2) {
        /* Fetch parallelo: recupera tutti i pokemon di entrambi i tipi */
        const [detail1, detail2] = await Promise.all([
          fetchPokemonByType(types[0]!),
          fetchPokemonByType(types[1]!),
        ])

        /* Calcola l'intersezione: pokemon che appartengono a ENTRAMBI i tipi */
        const type2Ids = new Set(
          detail2.pokemon.map((e) => extractPokemonIdFromUrl(e.pokemon.url)),
        )
        const intersection = detail1.pokemon.filter((e) =>
          type2Ids.has(extractPokemonIdFromUrl(e.pokemon.url)),
        )

        totalCount.value = intersection.length
        const start = page * PAGINA_SIZE
        pokemonList.value = intersection
          .slice(start, start + PAGINA_SIZE)
          .map((entry) => entry.pokemon)
      } else if (types.length === 1) {
        /* Il tipo restituisce tutti i pokemon associati: impaginiamo lato client */
        const typeDetail = await fetchPokemonByType(types[0]!)
        totalCount.value = typeDetail.pokemon.length
        const start = page * PAGINA_SIZE
        pokemonList.value = typeDetail.pokemon
          .slice(start, start + PAGINA_SIZE)
          .map((entry) => entry.pokemon)
      } else {
        const response = await fetchPokemonList(PAGINA_SIZE, page * PAGINA_SIZE)
        totalCount.value = response.count
        pokemonList.value = response.results
      }
    } catch (e) {
      error.value = 'Error loading Pokémon. Please try again.'
      console.error(e)
    } finally {
      isLoading.value = false
    }
  }

  /**
   * Restituisce il dettaglio di un pokemon per id.
   * Usa la cache se il pokemon è già stato scaricato in precedenza.
   */
  async function loadPokemon(id: number): Promise<Pokemon | null> {
    if (pokemonCache.value.has(id)) {
      return pokemonCache.value.get(id)!
    }
    try {
      const pokemon = await fetchPokemon(id)
      pokemonCache.value.set(id, pokemon)
      return pokemon
    } catch (e) {
      console.error(`Errore durante il caricamento del Pokémon #${id}:`, e)
      return null
    }
  }

  return {
    pokemonCache,
    types,
    typesLoaded,
    pokemonList,
    totalCount,
    currentPage,
    currentTypes,
    isLoading,
    error,
    totalPages,
    loadTypes,
    loadPokemonList,
    loadPokemon,
  }
})
