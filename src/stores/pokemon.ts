import { ref, computed } from 'vue'
import { defineStore } from 'pinia'
import {
  fetchPokemon,
  fetchPokemonByType,
  fetchPokemonList,
  fetchTypes,
} from '@/services/pokeApi'
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
  const currentType = ref<string | null>(null)

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
   * Se viene passato un tipo, filtra per quel tipo (paginazione lato client).
   * Altrimenti usa la paginazione nativa dell'API.
   */
  async function loadPokemonList(page = 0, typeName: string | null = null): Promise<void> {
    isLoading.value = true
    error.value = null
    currentPage.value = page
    currentType.value = typeName

    try {
      if (typeName) {
        // Il tipo restituisce tutti i pokemon associati: impaginiamo lato client
        const typeDetail = await fetchPokemonByType(typeName)
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
      error.value = 'Errore durante il caricamento dei Pokémon. Riprova più tardi.'
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
    currentType,
    isLoading,
    error,
    totalPages,
    loadTypes,
    loadPokemonList,
    loadPokemon,
  }
})
