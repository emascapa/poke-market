<script setup lang="ts">
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import type { Pokemon } from '@/types/pokemon'
import { useCartStore } from '@/stores/cart'
import { useWishlistStore } from '@/stores/wishlist'
import { useAuthStore } from '@/stores/auth'
import { getPokemonImage } from '@/utils/priceCalculator'
import TypeBadge from '@/components/ui/TypeBadge.vue'

const props = defineProps<{
  pokemon: Pokemon
  price: number
}>()

const router = useRouter()
const cart = useCartStore()
const wishlist = useWishlistStore()
const auth = useAuthStore()

const image = computed(() => getPokemonImage(props.pokemon.sprites))
const wishlisted = computed(() => wishlist.isWishlisted(props.pokemon.id))
const inCart = computed(() => cart.items.some((i) => i.pokemon.id === props.pokemon.id))

function goToDetail() {
  router.push({ name: 'pokemon-detail', params: { id: props.pokemon.id } })
}

function handleAddToCart(event: Event) {
  /* Impedisce la navigazione al dettaglio quando si clicca il pulsante */
  event.stopPropagation()
  if (!auth.isAuthenticated) {
    router.push({ name: 'login', query: { redirect: `/cart` } })
    return
  }
  cart.addToCart(props.pokemon)
}

function handleToggleWishlist(event: Event) {
  event.stopPropagation()
  if (!auth.isAuthenticated) {
    router.push({ name: 'login', query: { redirect: `/wishlist` } })
    return
  }
  wishlist.toggleWishlist(props.pokemon)
}
</script>

<template>
  <article
    class="pokemon-card"
    tabindex="0"
    role="button"
    :aria-label="`${pokemon.name}, $${price}`"
    @click="goToDetail"
    @keydown.enter="goToDetail"
    @keydown.space.prevent="goToDetail"
  >
    <!-- Immagine pokemon -->
    <div class="pokemon-card__image-wrap">
      <img
        :src="image"
        :alt="pokemon.name"
        class="pokemon-card__image"
        loading="lazy"
        width="200"
        height="200"
      />
      <span v-if="inCart" class="pokemon-card__cart-badge" aria-label="Already in cart">
        <svg viewBox="0 0 12 12" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
          <polyline points="1.5,6 4.5,9 10.5,3" />
        </svg>
      </span>
    </div>

    <!-- Corpo della card -->
    <div class="pokemon-card__body">
      <!-- Numero Pokédex -->
      <span class="pokemon-card__id">#{{ String(pokemon.id).padStart(4, '0') }}</span>

      <!-- Nome -->
      <h2 class="pokemon-card__name">{{ pokemon.name }}</h2>

      <!-- Badge tipi -->
      <div class="pokemon-card__types">
        <TypeBadge
          v-for="entry in pokemon.types"
          :key="entry.slot"
          :type="entry.type.name"
        />
      </div>

      <!-- Prezzo -->
      <p class="pokemon-card__price">€{{ price.toFixed(2) }}</p>
    </div>

    <!-- Azioni -->
    <div class="pokemon-card__actions">
      <!-- Wishlist toggle -->
      <button
        class="pokemon-card__wishlist-btn"
        :class="{ 'pokemon-card__wishlist-btn--active': wishlisted }"
        :aria-label="wishlisted ? 'Remove from wishlist' : 'Add to wishlist'"
        :aria-pressed="wishlisted"
        @click="handleToggleWishlist"
      >
        <svg viewBox="0 0 24 24" stroke="currentColor" stroke-width="2" aria-hidden="true">
          <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
        </svg>
      </button>

      <!-- Aggiungi al carrello -->
      <button
        class="pokemon-card__cart-btn"
        :aria-label="`Add ${pokemon.name} to cart`"
        @click="handleAddToCart"
      >
        Add
      </button>
    </div>
  </article>
</template>

<style scoped lang="scss">
@use '@/assets/styles/variables' as *;
@use '@/assets/styles/mixins' as *;

.pokemon-card {
  @include card;
  display: flex;
  flex-direction: column;
  cursor: pointer;
  overflow: hidden;
  /* Easing con leggero rimbalzo per la card */
  transition:
    box-shadow var(--transition-base) cubic-bezier(0.34, 1.56, 0.64, 1),
    transform var(--transition-base) cubic-bezier(0.34, 1.56, 0.64, 1),
    outline-color var(--transition-fast);

  &:hover,
  &:focus-visible {
    transform: translateY(-6px) scale(1.01);
    box-shadow: var(--shadow-card-hover);
    outline: 2px solid var(--color-primary);
    outline-offset: 2px;
  }



  /* Area immagine con sfondo sfumato */
  &__image-wrap {
    position: relative;
    background: linear-gradient(135deg, var(--color-border) 0%, var(--color-bg) 100%);
    padding: $space-5;
    @include flex-center;
    min-height: 160px;
    /* Preparazione per il fade del gradiente sull'hover */
    transition: background var(--transition-slow);

    .pokemon-card:hover & {
      background: linear-gradient(135deg, var(--color-border) 0%, var(--color-bg-card) 100%);
    }
  }

  &__image {
    // width: 120px;
    // height: 120px;
    object-fit: contain;
    /* La resa bicubica predefinita (auto) è ottimale per l'official artwork in alta risoluzione.
       pixelated/crisp-edges usavano nearest-neighbor che causa l'effetto "impastato" su immagini smooth. */
    image-rendering: auto;
    /* Safari: forza downscaling nitido invece dello smooth blur */
    image-rendering: -webkit-optimize-contrast;
    /* Promuove l'immagine su GPU layer, riduce il sub-pixel blurring durante le animazioni */
    will-change: transform;
    transition: transform var(--transition-base) cubic-bezier(0.34, 1.56, 0.64, 1);
    /* Previene artifatti di antialiasing ai bordi del contenitore */
    backface-visibility: hidden;

    .pokemon-card:hover & {
      transform: scale(1.12) rotate(-1deg);
    }
  }

  &__cart-badge {
    position: absolute;
    top: $space-2;
    right: $space-2;
    width: 22px;
    height: 22px;
    background-color: var(--color-success);
    color: #fff;
    border-radius: $radius-full;
    @include flex-center;
    pointer-events: none;

    svg {
      width: 12px;
      height: 12px;
      flex-shrink: 0;
    }
  }

  /* Corpo */
  &__body {
    flex: 1;
    padding: $space-3 $space-4 $space-2;
    display: flex;
    flex-direction: column;
    gap: $space-2;
  }

  &__id {
    font-size: $font-size-xs;
    color: var(--color-text-muted);
    font-weight: $font-weight-medium;
  }

  &__name {
    font-size: $font-size-md;
    font-weight: $font-weight-bold;
    text-transform: capitalize;
    @include truncate;
    color: var(--color-text);
  }

  &__types {
    display: flex;
    flex-wrap: wrap;
    gap: $space-1;
  }

  &__price {
    font-size: $font-size-lg;
    font-weight: $font-weight-bold;
    color: var(--color-primary);
    margin-top: auto;
  }

  /* Azioni */
  &__actions {
    display: flex;
    align-items: center;
    gap: $space-2;
    padding: $space-2 $space-4 $space-4;
  }

  &__wishlist-btn {
    @include flex-center;
    flex-shrink: 0;
    width: 36px;
    height: 36px;
    border: 1.5px solid var(--color-border);
    border-radius: $radius-base;
    color: var(--color-text-muted);
    transition: border-color var(--transition-fast), color var(--transition-fast), background-color var(--transition-fast);
    background: transparent;

    svg {
      width: 18px;
      height: 18px;
      fill: none;
    }

    &:hover,
    &:focus-visible {
      border-color: #e53935;
      color: #e53935;
      outline: none;
    }

    &--active {
      border-color: #e53935;
      color: #fff;
      background-color: #e53935;

      svg { fill: currentColor; }
    }
  }

  &__cart-btn {
    flex: 1;
    padding: $space-2 $space-3;
    border-radius: $radius-base;
    background-color: var(--color-primary);
    color: #fff;
    font-size: $font-size-sm;
    font-weight: $font-weight-medium;
    border: none;
    cursor: pointer;
    transition: background-color var(--transition-fast);
    @include truncate;

    &:hover,
    &:focus-visible {
      background-color: var(--color-primary-hover);
      outline: none;
    }
  }
}
</style>
