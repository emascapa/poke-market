<script setup lang="ts">
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { useWishlistStore } from '@/stores/wishlist'
import { useCartStore } from '@/stores/cart'
import { getPokemonImage, calculatePrice } from '@/utils/priceCalculator'
import TypeBadge from '@/components/ui/TypeBadge.vue'

const router = useRouter()
const wishlist = useWishlistStore()
const cart = useCartStore()

const isEmpty = computed(() => wishlist.items.length === 0)

function addToCart(item: (typeof wishlist.items)[number]) {
  cart.addToCart(item.pokemon)
}
</script>

<template>
  <div class="wishlist-view">
    <div class="wishlist-view__container">
      <h1 class="wishlist-view__title">Wishlist</h1>
      <p class="wishlist-view__count" v-if="!isEmpty">
        {{ wishlist.totalItems }} saved Pokémon
      </p>

      <!-- Stato vuoto -->
      <div v-if="isEmpty" class="wishlist-view__empty">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true">
          <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
        </svg>
        <p>Your wishlist is empty.</p>
        <button class="wishlist-view__go-home" @click="router.push({ name: 'home' })">
          Explore Pokémon
        </button>
      </div>

      <!-- Griglia wishlist -->
      <ul v-else class="wishlist-grid" aria-label="Pokémon nella wishlist">
        <li
          v-for="item in wishlist.items"
          :key="item.pokemon.id"
          class="wishlist-card"
        >
          <!-- Immagine -->
          <button
            class="wishlist-card__image-btn"
              :aria-label="`View details of ${item.pokemon.name}`"
            @click="router.push({ name: 'pokemon-detail', params: { id: item.pokemon.id } })"
          >
            <img
              :src="getPokemonImage(item.pokemon.sprites)"
              :alt="item.pokemon.name"
              class="wishlist-card__image"
              loading="lazy"
              width="100"
              height="100"
            />
          </button>

          <!-- Info -->
          <div class="wishlist-card__body">
            <span class="wishlist-card__id">#{{ String(item.pokemon.id).padStart(4, '0') }}</span>
            <span class="wishlist-card__name">{{ item.pokemon.name }}</span>
            <div class="wishlist-card__types">
              <TypeBadge
                v-for="entry in item.pokemon.types"
                :key="entry.slot"
                :type="entry.type.name"
              />
            </div>
            <span class="wishlist-card__price">€{{ calculatePrice(item.pokemon.stats).toFixed(2) }}</span>
          </div>

          <!-- Azioni -->
          <div class="wishlist-card__actions">
            <button
              class="wishlist-card__cart-btn"
              :class="{ 'wishlist-card__cart-btn--added': cart.items.some(i => i.pokemon.id === item.pokemon.id) }"
              :aria-label="`Add ${item.pokemon.name} to cart`"
              @click="addToCart(item)"
            >
              {{ cart.items.some(i => i.pokemon.id === item.pokemon.id) ? '✓ In cart' : 'Add' }}
            </button>

            <button
              class="wishlist-card__remove-btn"
              :aria-label="`Remove ${item.pokemon.name} from wishlist`"
              @click="wishlist.removeFromWishlist(item.pokemon.id)"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
                <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
              </svg>
            </button>
          </div>
        </li>
      </ul>
    </div>
  </div>
</template>

<style scoped lang="scss">
@use '@/assets/styles/variables' as *;
@use '@/assets/styles/mixins' as *;

.wishlist-view {
  background-color: var(--color-bg);
  min-height: 100%;

  &__container {
    max-width: $max-width;
    margin: 0 auto;
    padding: $space-6 $space-5;
  }

  &__title {
    font-size: $font-size-xl;
    font-weight: $font-weight-bold;
    margin-bottom: $space-2;
  }

  &__count {
    font-size: $font-size-sm;
    color: var(--color-text-muted);
    margin-bottom: $space-5;
  }

  &__empty {
    @include flex-center;
    flex-direction: column;
    gap: $space-4;
    padding: $space-8 0;
    color: var(--color-text-muted);
    text-align: center;

    svg { width: 64px; height: 64px; }
    p   { font-size: $font-size-md; }
  }

  &__go-home {
    padding: $space-3 $space-6;
    border: 2px solid var(--color-primary);
    border-radius: $radius-full;
    color: var(--color-primary);
    font-weight: $font-weight-medium;
    background: transparent;
    cursor: pointer;
    transition: background-color var(--transition-fast), color var(--transition-fast);

    &:hover { background-color: var(--color-primary); color: #fff; }
  }
}

.wishlist-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: $space-5;
  list-style: none;

  @include respond-to(xl) { grid-template-columns: repeat(3, 1fr); }
  @include respond-to(md) { grid-template-columns: repeat(2, 1fr); }
  @include respond-to(sm) { grid-template-columns: 1fr; }
}

.wishlist-card {
  @include card;
  display: flex;
  flex-direction: column;
  overflow: hidden;

  &__image-btn {
    background: linear-gradient(135deg, var(--color-border) 0%, var(--color-bg) 100%);
    border: none;
    cursor: pointer;
    padding: $space-5;
    @include flex-center;
    transition: opacity var(--transition-fast);

    &:hover { opacity: 0.85; }
  }

  &__image {
    width: 100px;
    height: 100px;
    object-fit: contain;
    image-rendering: pixelated;
    image-rendering: crisp-edges;
    transition: transform var(--transition-base);

    .wishlist-card:hover & { transform: scale(1.06); }
  }

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
  }

  &__name {
    font-size: $font-size-md;
    font-weight: $font-weight-bold;
    text-transform: capitalize;
    @include truncate;
  }

  &__types { display: flex; flex-wrap: wrap; gap: $space-1; }

  &__price {
    font-size: $font-size-lg;
    font-weight: $font-weight-bold;
    color: var(--color-primary);
  }

  &__actions {
    display: flex;
    gap: $space-2;
    padding: $space-2 $space-4 $space-4;
  }

  &__cart-btn {
    flex: 1;
    padding: $space-2 $space-3;
    border: none;
    border-radius: $radius-base;
    background-color: var(--color-primary);
    color: #fff;
    font-size: $font-size-sm;
    font-weight: $font-weight-medium;
    cursor: pointer;
    transition: background-color var(--transition-fast);
    @include truncate;

    &:hover { background-color: var(--color-primary-hover); }

    &--added {
      background-color: var(--color-success);
    }
  }

  &__remove-btn {
    @include flex-center;
    flex-shrink: 0;
    width: 36px;
    height: 36px;
    border: 1.5px solid var(--color-border);
    border-radius: $radius-base;
    background: transparent;
    color: var(--color-text-muted);
    cursor: pointer;
    transition: border-color var(--transition-fast), color var(--transition-fast);

    svg { width: 16px; height: 16px; fill: none; }

    &:hover { border-color: #e53935; color: #e53935; }
  }
}
</style>

