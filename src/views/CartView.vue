<script setup lang="ts">
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { useCartStore } from '@/stores/cart'
import { getPokemonImage } from '@/utils/priceCalculator'
import TypeBadge from '@/components/ui/TypeBadge.vue'

const router = useRouter()
const cart = useCartStore()

const isEmpty = computed(() => cart.items.length === 0)
</script>

<template>
  <div class="cart-view">
    <div class="cart-view__container">
      <h1 class="cart-view__title">Your Cart</h1>

      <!-- Stato vuoto -->
      <div v-if="isEmpty" class="cart-view__empty">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true">
          <circle cx="9" cy="21" r="1" />
          <circle cx="20" cy="21" r="1" />
          <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
        </svg>
        <p>Your cart is empty.</p>
        <button class="cart-view__go-home" @click="router.push({ name: 'home' })">
          Continue shopping
        </button>
      </div>

      <!-- Lista articoli -->
      <template v-else>
        <ul class="cart-list" aria-label="Cart items">
          <li
            v-for="item in cart.items"
            :key="item.pokemon.id"
            class="cart-item"
          >
            <!-- Immagine cliccabile -->
            <button
              class="cart-item__image-btn"
              :aria-label="`View details of ${item.pokemon.name}`"
              @click="router.push({ name: 'pokemon-detail', params: { id: item.pokemon.id } })"
            >
              <img
                :src="getPokemonImage(item.pokemon.sprites)"
                :alt="item.pokemon.name"
                class="cart-item__image"
                width="80"
                height="80"
              />
            </button>

            <!-- Info -->
            <div class="cart-item__info">
              <span class="cart-item__id">#{{ String(item.pokemon.id).padStart(4, '0') }}</span>
              <span class="cart-item__name">{{ item.pokemon.name }}</span>
              <div class="cart-item__types">
                <TypeBadge
                  v-for="entry in item.pokemon.types"
                  :key="entry.slot"
                  :type="entry.type.name"
                />
              </div>
            </div>

            <!-- Prezzo unitario -->
            <span class="cart-item__unit-price">€{{ item.price.toFixed(2) }}</span>

            <!-- Controllo quantità -->
            <div class="cart-item__qty" role="group" :aria-label="`Quantity of ${item.pokemon.name}`">
              <button
                class="cart-item__qty-btn"
                aria-label="Decrease quantity"
                :disabled="item.quantity <= 1"
                @click="cart.updateQuantity(item.pokemon.id, item.quantity - 1)"
              >−</button>
              <span class="cart-item__qty-value">{{ item.quantity }}</span>
              <button
                class="cart-item__qty-btn"
                aria-label="Increase quantity"
                @click="cart.updateQuantity(item.pokemon.id, item.quantity + 1)"
              >+</button>
            </div>

            <!-- Subtotale riga -->
            <span class="cart-item__subtotal">€{{ (item.price * item.quantity).toFixed(2) }}</span>

            <!-- Rimuovi -->
            <button
              class="cart-item__remove"
              :aria-label="`Remove ${item.pokemon.name} from cart`"
              @click="cart.removeFromCart(item.pokemon.id)"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
                <polyline points="3 6 5 6 21 6" />
                <path d="M19 6l-1 14H6L5 6" />
                <path d="M10 11v6M14 11v6" />
                <path d="M9 6V4h6v2" />
              </svg>
            </button>
          </li>
        </ul>

        <!-- Riepilogo totale -->
        <div class="cart-summary">
          <button class="cart-summary__clear" @click="cart.clearCart()">
            Clear cart
          </button>
          <div class="cart-summary__total">
            <span>Total ({{ cart.totalItems }} items)</span>
            <strong>€{{ cart.totalPrice.toFixed(2) }}</strong>
          </div>
        </div>
      </template>
    </div>
  </div>
</template>

<style scoped lang="scss">
@use '@/assets/styles/variables' as *;
@use '@/assets/styles/mixins' as *;

.cart-view {
  background-color: var(--color-bg);
  min-height: 100%;

  &__container {
    max-width: 860px;
    margin: 0 auto;
    padding: $space-6 $space-5;
  }

  &__title {
    font-size: $font-size-xl;
    font-weight: $font-weight-bold;
    margin-bottom: $space-6;
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

.cart-list {
  display: flex;
  flex-direction: column;
  gap: $space-3;
  list-style: none;
}

.cart-item {
  display: grid;
  grid-template-columns: 80px 1fr auto auto auto auto;
  align-items: center;
  gap: $space-4;
  padding: $space-4;
  background: var(--color-bg-card);
  border: 1px solid var(--color-border);
  border-radius: $radius-md;
  box-shadow: var(--shadow-card);

  @include respond-to(md) {
    grid-template-columns: 80px 1fr auto;
    grid-template-rows: auto auto;
  }

  &__image-btn {
    background: none;
    border: none;
    cursor: pointer;
    border-radius: $radius-base;
    padding: 0;
    transition: opacity var(--transition-fast);

    &:hover { opacity: 0.8; }
  }

  &__image {
    width: 80px;
    height: 80px;
    object-fit: contain;
    image-rendering: pixelated;
    image-rendering: crisp-edges;
  }

  &__info {
    display: flex;
    flex-direction: column;
    gap: $space-1;
    min-width: 0;
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

  &__unit-price {
    font-size: $font-size-sm;
    color: var(--color-text-muted);
    white-space: nowrap;
  }

  &__qty {
    display: flex;
    align-items: center;
    gap: $space-2;
    border: 1px solid var(--color-border);
    border-radius: $radius-base;
    padding: $space-1 $space-2;
  }

  &__qty-btn {
    width: 24px;
    height: 24px;
    @include flex-center;
    border: none;
    background: none;
    cursor: pointer;
    font-size: $font-size-md;
    color: var(--color-text);
    border-radius: $radius-sm;
    transition: background-color var(--transition-fast);

    &:hover:not(:disabled) { background-color: var(--color-border); }
    &:disabled { opacity: 0.3; cursor: not-allowed; }
  }

  &__qty-value {
    min-width: 24px;
    text-align: center;
    font-weight: $font-weight-bold;
  }

  &__subtotal {
    font-size: $font-size-md;
    font-weight: $font-weight-bold;
    color: var(--color-primary);
    white-space: nowrap;
    min-width: 60px;
    text-align: right;
  }

  &__remove {
    @include flex-center;
    width: 32px;
    height: 32px;
    border: none;
    background: none;
    cursor: pointer;
    color: var(--color-text-muted);
    border-radius: $radius-base;
    transition: color var(--transition-fast), background-color var(--transition-fast);

    svg { width: 18px; height: 18px; }

    &:hover { color: var(--color-error); background-color: rgba(229, 57, 53, 0.08); }
  }
}

.cart-summary {
  @include flex-between;
  margin-top: $space-6;
  padding: $space-5;
  background: var(--color-bg-card);
  border: 1px solid var(--color-border);
  border-radius: $radius-md;

  &__clear {
    font-size: $font-size-sm;
    color: var(--color-text-muted);
    background: none;
    border: none;
    cursor: pointer;
    text-decoration: underline;
    transition: color var(--transition-fast);

    &:hover { color: var(--color-error); }
  }

  &__total {
    display: flex;
    align-items: center;
    gap: $space-4;
    font-size: $font-size-md;
    color: var(--color-text);

    strong {
      font-size: $font-size-xl;
      color: var(--color-primary);
    }
  }
}
</style>

