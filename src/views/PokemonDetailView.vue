<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { useRouter } from 'vue-router'
import { usePokemonStore } from '@/stores/pokemon'
import { useCartStore } from '@/stores/cart'
import { useWishlistStore } from '@/stores/wishlist'
import { useAuthStore } from '@/stores/auth'
import { fetchPokemonSpecies } from '@/services/pokeApi'
import { calculatePrice, getPokemonImage, getEnglishFlavorText } from '@/utils/priceCalculator'
import { getApiErrorMessage } from '@/utils/apiError'
import type { Pokemon, PokemonSpecies } from '@/types/pokemon'
import TypeBadge from '@/components/ui/TypeBadge.vue'
import LoadingSpinner from '@/components/ui/LoadingSpinner.vue'
import ErrorMessage from '@/components/ui/ErrorMessage.vue'

/* L'id viene iniettato come prop dal router (props: true nella route) */
const props = defineProps<{ id: string }>()

const router = useRouter()
const pokemonStore = usePokemonStore()
const cart = useCartStore()
const wishlist = useWishlistStore()
const auth = useAuthStore()

const pokemon = ref<Pokemon | null>(null)
const species = ref<PokemonSpecies | null>(null)
const isLoading = ref(false)
const error = ref<string | null>(null)

const price = computed(() => (pokemon.value ? calculatePrice(pokemon.value.stats) : 0))
const image = computed(() => (pokemon.value ? getPokemonImage(pokemon.value.sprites) : ''))
const description = computed(() =>
  species.value ? getEnglishFlavorText(species.value.flavor_text_entries) : '',
)
const inCart = computed(() =>
  pokemon.value ? cart.items.some((i) => i.pokemon.id === pokemon.value!.id) : false,
)
const wishlisted = computed(() =>
  pokemon.value ? wishlist.isWishlisted(pokemon.value.id) : false,
)

/* Mappa i nomi delle stat PokeAPI in etichette leggibili */
const STAT_LABELS: Record<string, string> = {
  hp: 'HP',
  attack: 'Attack',
  defense: 'Defense',
  'special-attack': 'Sp. Atk',
  'special-defense': 'Sp. Def',
  speed: 'Speed',
}

/* Mappa i nomi delle stat ai colori del design system */
const STAT_COLORS: Record<string, string> = {
  hp: '#43A047',
  attack: '#EF5350',
  defense: '#1E88E5',
  'special-attack': '#8E24AA',
  'special-defense': '#3949AB',
  speed: '#FFB300',
}

async function loadData() {
  isLoading.value = true
  error.value = null
  pokemon.value = null
  species.value = null

  try {
    const id = Number(props.id)
    /* Carica i dati del pokemon (usa la cache dello store se disponibili) */
    const p = await pokemonStore.loadPokemon(id)
    if (!p) {
      error.value = 'Pokémon not found.'
      return
    }
    pokemon.value = p

    /* Carica la specie per ottenere la descrizione testuale */
    try {
      species.value = await fetchPokemonSpecies(id)
    } catch {
      species.value = null
    }
  } catch (e) {
    error.value = getApiErrorMessage(e)
  } finally {
    isLoading.value = false
  }
}

function handleAddToCart() {
  if (!pokemon.value) return
  if (!auth.isAuthenticated) {
    router.push({ name: 'login', query: { redirect: `/pokemon/${props.id}` } })
    return
  }
  cart.addToCart(pokemon.value)
}

function handleToggleWishlist() {
  if (!pokemon.value) return
  if (!auth.isAuthenticated) {
    router.push({ name: 'login', query: { redirect: `/pokemon/${props.id}` } })
    return
  }
  wishlist.toggleWishlist(pokemon.value)
}

/* Ricarica quando cambia l'id (navigazione tra pokemon nel dettaglio) */
watch(() => props.id, loadData, { immediate: true })
</script>

<template>
  <div class="detail-view">
    <div class="detail-view__container">
      <!-- Pulsante torna indietro -->
      <button class="detail-view__back" @click="router.back()">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" aria-hidden="true">
          <polyline points="15 18 9 12 15 6" />
        </svg>
        Back
      </button>

      <!-- Stato: caricamento -->
      <div v-if="isLoading" class="detail-view__loading">
        <LoadingSpinner :size="56" />
      </div>

      <!-- Stato: errore -->
      <ErrorMessage
        v-else-if="error"
        :message="error"
        @retry="loadData"
      />

      <!-- Contenuto principale -->
      <article v-else-if="pokemon" class="detail-card">
        <!-- Colonna immagine -->
        <div class="detail-card__image-col">
          <div class="detail-card__image-wrap">
            <img
              :src="image"
              :alt="pokemon.name"
              class="detail-card__image"
              width="300"
              height="300"
            />
          </div>
          <!-- Badge tipi -->
          <div class="detail-card__types">
            <TypeBadge
              v-for="entry in pokemon.types"
              :key="entry.slot"
              :type="entry.type.name"
            />
          </div>
        </div>

        <!-- Colonna info -->
        <div class="detail-card__info-col">
          <span class="detail-card__id">#{{ String(pokemon.id).padStart(4, '0') }}</span>
          <h1 class="detail-card__name">{{ pokemon.name }}</h1>
          <p class="detail-card__price">€{{ price.toFixed(2) }}</p>

          <!-- Descrizione dalla specie -->
          <div class="detail-card__about">
            <h2 class="detail-card__about-title">About</h2>
            <p class="detail-card__description">{{ description || 'No info found' }}</p>
          </div>

          <!-- Dati fisici -->
          <div class="detail-card__meta">
            <div class="detail-card__meta-item">
              <span class="detail-card__meta-label">Height</span>
              <span class="detail-card__meta-value">{{ (pokemon.height / 10).toFixed(1) }} m</span>
            </div>
            <div class="detail-card__meta-item">
              <span class="detail-card__meta-label">Weight</span>
              <span class="detail-card__meta-value">{{ (pokemon.weight / 10).toFixed(1) }} kg</span>
            </div>
            <div class="detail-card__meta-item">
              <span class="detail-card__meta-label">Base Exp.</span>
              <span class="detail-card__meta-value">{{ pokemon.base_experience ?? '—' }}</span>
            </div>
          </div>

          <!-- Barre statistiche -->
          <div class="detail-card__stats">
            <h2 class="detail-card__stats-title">Base Stats</h2>
            <div
              v-for="stat in pokemon.stats"
              :key="stat.stat.name"
              class="detail-card__stat-row"
            >
              <span class="detail-card__stat-name">
                {{ STAT_LABELS[stat.stat.name] ?? stat.stat.name }}
              </span>
              <span class="detail-card__stat-value">{{ stat.base_stat }}</span>
              <div class="detail-card__stat-bar-bg">
                <div
                  class="detail-card__stat-bar"
                  :style="{
                    width: `${Math.min((stat.base_stat / 200) * 100, 100)}%`,
                    backgroundColor: STAT_COLORS[stat.stat.name] ?? 'var(--color-primary)',
                  }"
                  :aria-label="`${STAT_LABELS[stat.stat.name] ?? stat.stat.name}: ${stat.base_stat}`"
                  role="progressbar"
                  :aria-valuenow="stat.base_stat"
                  aria-valuemin="0"
                  aria-valuemax="200"
                />
              </div>
            </div>
          </div>

          <!-- Azioni -->
          <div class="detail-card__actions">
            <button
              class="detail-card__wishlist-btn"
              :class="{ 'detail-card__wishlist-btn--active': wishlisted }"
              :aria-pressed="wishlisted"
              :aria-label="wishlisted ? 'Remove from wishlist' : 'Add to wishlist'"
              @click="handleToggleWishlist"
            >
              <svg viewBox="0 0 24 24" stroke="currentColor" stroke-width="2" aria-hidden="true">
                <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
              </svg>
              {{ wishlisted ? 'Wishlisted ♥' : 'Wishlist' }}
            </button>

            <button
              class="detail-card__cart-btn"
              :aria-label="`Add ${pokemon.name} to cart`"
              @click="handleAddToCart"
            >
              Add to cart
            </button>
            <span v-if="inCart" class="detail-card__in-cart-badge">✓ In cart</span>
          </div>
        </div>
      </article>
    </div>
  </div>
</template>

<style scoped lang="scss">
@use '@/assets/styles/variables' as *;
@use '@/assets/styles/mixins' as *;

.detail-view {
  background-color: var(--color-bg);
  min-height: 100%;

  &__container {
    max-width: $max-width;
    margin: 0 auto;
    padding: $space-5;
  }

  &__back {
    @include flex-center;
    gap: $space-1;
    color: var(--color-text-muted);
    background: none;
    border: none;
    cursor: pointer;
    font-size: $font-size-sm;
    padding: $space-2 0;
    margin-bottom: $space-4;
    transition: color var(--transition-fast);

    svg { width: 18px; height: 18px; }

    &:hover { color: var(--color-primary); }
  }

  &__loading {
    @include flex-center;
    min-height: 400px;
  }
}

.detail-card {
  display: grid;
  grid-template-columns: 1fr 1.5fr;
  gap: $space-8;
  background: var(--color-bg-card);
  border: 1px solid var(--color-border);
  border-radius: $radius-lg;
  box-shadow: var(--shadow-card);
  padding: $space-7;

  @include respond-to(md) {
    grid-template-columns: 1fr;
    gap: $space-5;
    padding: $space-5;
  }

  /* Colonna immagine */
  &__image-col {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: $space-4;
  }

  &__image-wrap {
    background: linear-gradient(135deg, var(--color-border) 0%, var(--color-bg) 100%);
    border-radius: $radius-lg;
    padding: $space-6;
    width: 100%;
    @include flex-center;
  }

  &__image {
    width: 220px;
    height: 220px;
    object-fit: contain;
    /* Rendering smooth per official artwork ad alta risoluzione */
    image-rendering: auto;
    image-rendering: -webkit-optimize-contrast;
    will-change: transform;
    transition: transform var(--transition-slow);
    backface-visibility: hidden;

    &:hover { transform: scale(1.05); }
  }

  &__types {
    display: flex;
    flex-wrap: wrap;
    gap: $space-2;
    justify-content: center;
  }

  /* Colonna info */
  &__info-col {
    display: flex;
    flex-direction: column;
    gap: $space-4;
  }

  &__id {
    font-size: $font-size-sm;
    color: var(--color-text-muted);
    font-weight: $font-weight-medium;
  }

  &__name {
    font-size: $font-size-2xl;
    font-weight: $font-weight-bold;
    text-transform: capitalize;
    color: var(--color-text);
    line-height: $line-height-tight;
  }

  &__price {
    font-size: $font-size-xl;
    font-weight: $font-weight-bold;
    color: var(--color-primary);
  }

  &__about {
    display: flex;
    flex-direction: column;
    gap: $space-2;
  }

  &__about-title {
    font-size: $font-size-base;
    font-weight: $font-weight-bold;
    color: var(--color-text);
    letter-spacing: 0.8px;
  }

  &__description {
    font-size: $font-size-base;
    color: var(--color-text-muted);
    line-height: $line-height-loose;
  }

  /* Dati fisici */
  &__meta {
    display: flex;
    gap: $space-5;
  }

  &__meta-item {
    display: flex;
    flex-direction: column;
    gap: $space-1;
  }

  &__meta-label {
    font-size: $font-size-xs;
    text-transform: uppercase;
    letter-spacing: 0.8px;
    color: var(--color-text-muted);
  }

  &__meta-value {
    font-size: $font-size-md;
    font-weight: $font-weight-bold;
    color: var(--color-text);
  }

  /* Statistiche */
  &__stats {
    display: flex;
    flex-direction: column;
    gap: $space-3;
  }

  &__stats-title {
    font-size: $font-size-base;
    font-weight: $font-weight-bold;
    color: var(--color-text);
    text-transform: uppercase;
    letter-spacing: 0.8px;
  }

  &__stat-row {
    display: grid;
    grid-template-columns: 60px 40px 1fr;
    align-items: center;
    gap: $space-3;
  }

  &__stat-name {
    font-size: $font-size-sm;
    color: var(--color-text-muted);
    text-align: left;
    font-weight: $font-weight-medium;
  }

  &__stat-value {
    font-size: $font-size-sm;
    font-weight: $font-weight-bold;
    color: var(--color-text);
    text-align: center;
  }

  &__stat-bar-bg {
    height: 8px;
    background-color: var(--color-border);
    border-radius: $radius-full;
    overflow: hidden;
  }

  &__stat-bar {
    height: 100%;
    border-radius: $radius-full;
    transition: width 0.6s ease-out;
  }

  /* Azioni */
  &__actions {
    display: flex;
    align-items: center;
    gap: $space-3;
    margin-top: auto;
    padding-top: $space-4;

    @include respond-to(sm) {
      flex-direction: column;
    }
  }

  &__wishlist-btn {
    @include flex-center;
    gap: $space-2;
    padding: $space-3 $space-5;
    border: 2px solid var(--color-border);
    border-radius: $radius-full;
    font-size: $font-size-base;
    font-weight: $font-weight-medium;
    color: var(--color-text-muted);
    background: transparent;
    cursor: pointer;
    transition: border-color var(--transition-fast), color var(--transition-fast), background-color var(--transition-fast);
    white-space: nowrap;

    svg { width: 18px; height: 18px; fill: none; }

    &:hover, &:focus-visible {
      border-color: #e53935;
      color: #e53935;
      outline: none;
    }

    &--active {
      border-color: #e53935;
      background-color: #e53935;
      color: #fff;
      svg { fill: currentColor; }
    }
  }

  &__cart-btn {
    flex: 1;
    padding: $space-3 $space-6;
    border: none;
    border-radius: $radius-full;
    background-color: var(--color-primary);
    color: #fff;
    font-size: $font-size-base;
    font-weight: $font-weight-bold;
    cursor: pointer;
    transition: background-color var(--transition-fast);
    white-space: nowrap;

    &:hover, &:focus-visible {
      background-color: var(--color-primary-hover);
      outline: none;
    }

  }

  &__in-cart-badge {
    display: inline-flex;
    align-items: center;
    padding: $space-2 $space-4;
    border-radius: $radius-full;
    background-color: var(--color-success);
    color: #fff;
    font-size: $font-size-sm;
    font-weight: $font-weight-medium;
    white-space: nowrap;
  }
}
</style>

