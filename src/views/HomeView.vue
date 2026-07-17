<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { usePokemonStore } from '@/stores/pokemon'
import type { Pokemon } from '@/types/pokemon'
import PokemonGrid from '@/components/pokemon/PokemonGrid.vue'
import PokemonTypeFilter from '@/components/pokemon/PokemonTypeFilter.vue'
import PokemonPagination from '@/components/pokemon/PokemonPagination.vue'
import ErrorMessage from '@/components/ui/ErrorMessage.vue'

const route = useRoute()
const router = useRouter()
const store = usePokemonStore()

/* Pokemon con dettagli completi pronti per PokemonGrid */
const loadedPokemons = ref<Pokemon[]>([])
/* Caricamento secondario: fetch dei dettagli di ciascun pokemon nella pagina */
const isFetchingDetails = ref(false)

const activeType = computed(() =>
  typeof route.query.category === 'string' ? route.query.category : null,
)

/* Estrae l'ID numerico dall'URL PokeAPI (es. ".../pokemon/25/") */
function extractId(url: string): number {
  const parts = url.split('/').filter(Boolean)
  return parseInt(parts[parts.length - 1] ?? '0', 10)
}

/* Carica la lista paginata, poi recupera i dettagli di ogni pokemon */
async function fetchPage(page: number, typeName: string | null) {
  loadedPokemons.value = []
  await store.loadPokemonList(page, typeName)

  if (store.error) return

  /* Fetch parallelo dei dettagli: usa la cache dello store per i pokemon già scaricati */
  isFetchingDetails.value = true
  try {
    const results = await Promise.all(
      store.pokemonList.map((item) => store.loadPokemon(extractId(item.url))),
    )
    loadedPokemons.value = results.filter((p): p is Pokemon => p !== null)
  } finally {
    isFetchingDetails.value = false
  }
}

const isLoading = computed(() => store.isLoading || isFetchingDetails.value)

/* Quando cambia il filtro tipo aggiorna l'URL e torna a pagina 0 */
function onTypeChange(type: string | null) {
  router.push({
    name: 'home',
    query: type ? { category: type } : {},
  })
}

/* Quando l'utente cambia pagina */
function onPageChange(page: number) {
  fetchPage(page, activeType.value)
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

/* Reagisce ai cambiamenti dell'URL (deep link e navigazione) */
watch(
  () => route.query.category,
  () => fetchPage(0, activeType.value),
)

onMounted(async () => {
  /* Carica i tipi per il filtro se non sono già stati caricati */
  await store.loadTypes()
  fetchPage(0, activeType.value)
})
</script>

<template>
  <div class="home-view">
    <div class="home-view__container">
      <!-- Filtro per tipo (categorie) -->
      <PokemonTypeFilter
        :types="store.types"
        :active-type="activeType"
        @update:active-type="onTypeChange"
      />

      <!-- Griglia pokemon o messaggio di errore -->
      <ErrorMessage
        v-if="store.error && !isLoading"
        :message="store.error"
        @retry="fetchPage(store.currentPage, activeType)"
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
