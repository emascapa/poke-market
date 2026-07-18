<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { usePokemonStore } from '@/stores/pokemon'
import type { Pokemon } from '@/types/pokemon'
import PokemonGrid from '@/components/pokemon/PokemonGrid.vue'
import PokemonTypeFilter from '@/components/pokemon/PokemonTypeFilter.vue'
import PokemonPagination from '@/components/pokemon/PokemonPagination.vue'
import ErrorMessage from '@/components/ui/ErrorMessage.vue'
import { extractPokemonIdFromUrl } from '@/utils/priceCalculator'

const route = useRoute()
const router = useRouter()
const store = usePokemonStore()

/* Pokemon con dettagli completi pronti per PokemonGrid */
const loadedPokemons = ref<Pokemon[]>([])
/* Caricamento secondario: fetch dei dettagli di ciascun pokemon nella pagina */
const isFetchingDetails = ref(false)

/**
 * Legge ?category=fire oppure ?category=fire,water e restituisce un array.
 * Compatibile con i link dell'header che usano ?category=fire (tipo singolo).
 */
const activeTypes = computed<string[]>(() => {
  const raw = route.query.category
  if (typeof raw !== 'string' || !raw) return []
  return raw.split(',').filter(Boolean)
})

/* Carica la lista paginata, poi recupera i dettagli di ogni pokemon */
async function fetchPage(page: number, types: string[]) {
  loadedPokemons.value = []
  await store.loadPokemonList(page, types)

  if (store.error) return

  /* Fetch parallelo dei dettagli: usa la cache dello store per i pokemon già scaricati */
  isFetchingDetails.value = true
  try {
    const results = await Promise.all(
      store.pokemonList.map((item) => store.loadPokemon(extractPokemonIdFromUrl(item.url))),
    )
    loadedPokemons.value = results.filter((p): p is Pokemon => p !== null)
  } finally {
    isFetchingDetails.value = false
  }
}

const isLoading = computed(() => store.isLoading || isFetchingDetails.value)

/**
 * Aggiorna l'URL quando l'utente cambia i tipi selezionati.
 * 0 tipi → rimuove il parametro; 1-2 tipi → ?category=fire oppure ?category=fire,water
 */
function onTypesChange(types: string[]) {
  router.push({
    name: 'home',
    query: types.length > 0 ? { category: types.join(',') } : {},
  })
}

/* Quando l'utente cambia pagina */
function onPageChange(page: number) {
  fetchPage(page, activeTypes.value)
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

/* Reagisce ai cambiamenti dell'URL (deep link e navigazione) */
watch(
  () => route.query.category,
  () => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
    fetchPage(0, activeTypes.value)
  },
)

onMounted(async () => {
  /* Carica i tipi per il filtro se non sono già stati caricati */
  await store.loadTypes()
  fetchPage(0, activeTypes.value)
})
</script>

<template>
  <div class="home-view">
    <div class="home-view__container">
      <!-- Filtro per tipo (categorie) -->
      <PokemonTypeFilter
        :types="store.types"
        :active-types="activeTypes"
        @update:active-types="onTypesChange"
      />

      <!-- Griglia pokemon o messaggio di errore -->
      <ErrorMessage
        v-if="store.error && !isLoading"
        :message="store.error"
        @retry="fetchPage(store.currentPage, activeTypes)"
      />

      <template v-else>
        <PokemonGrid :pokemons="loadedPokemons" :is-loading="isLoading" />

        <!-- Paginazione -->
        <PokemonPagination
          :current-page="store.currentPage"
          :total-pages="store.totalPages"
          :is-loading="isLoading"
          @update:page="onPageChange"
        />
      </template>
    </div>
  </div>
</template>

<style scoped lang="scss">
@use '@/assets/styles/variables' as *;

.home-view {
  background-color: var(--color-bg);

  &__container {
    max-width: $max-width;
    margin: 0 auto;
    padding: $space-5;
  }
}
</style>
