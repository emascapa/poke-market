<script setup lang="ts">
import { computed, onMounted } from 'vue'
import { RouterLink, useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { useCartStore } from '@/stores/cart'
import { usePokemonStore } from '@/stores/pokemon'
import logoUrl from '@/assets/images/logo.png'

const router = useRouter()
const auth = useAuthStore()
const cart = useCartStore()
const pokemonStore = usePokemonStore()

/* Carica i tipi al montaggio del componente se non sono già stati caricati */
onMounted(() => pokemonStore.loadTypes())

const isAuthenticated = computed(() => auth.isAuthenticated)
const cartCount = computed(() => cart.totalItems)
const types = computed(() => pokemonStore.types)

function handleLogout() {
  auth.logout()
  router.push({ name: 'home' })
}
</script>

<template>
  <header class="app-header">
    <div class="app-header__inner">
      <!-- Logo e nome store -->
      <RouterLink class="app-header__brand" :to="{ name: 'home' }" aria-label="Poke Market — Home">
        <img :src="logoUrl" alt="Logo Poke Market" class="app-header__logo" width="36" height="36" />
        <span class="app-header__name">PokéMarket</span>
      </RouterLink>

      <!-- Navigazione tipi (categorie) -->
      <nav class="app-header__nav" aria-label="Filtra per tipo">
        <RouterLink
          :to="{ name: 'home' }"
          class="app-header__nav-link app-header__nav-link--all"
          :class="{ 'app-header__nav-link--active': $route.name === 'home' && !$route.query.category }"
        >
          Tutti
        </RouterLink>
        <RouterLink
          v-for="type in types"
          :key="type.name"
          :to="{ name: 'home', query: { category: type.name } }"
          class="app-header__nav-link"
          :class="{ 'app-header__nav-link--active': $route.query.category === type.name }"
        >
          {{ type.name }}
        </RouterLink>
      </nav>

      <!-- Azioni utente -->
      <div class="app-header__actions">
        <!-- Pulsante carrello con counter -->
        <RouterLink
          :to="{ name: 'cart' }"
          class="app-header__cart"
          aria-label="`Carrello, ${cartCount} articoli`"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
            <circle cx="9" cy="21" r="1" />
            <circle cx="20" cy="21" r="1" />
            <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
          </svg>
          <span v-if="cartCount > 0" class="app-header__cart-badge" aria-live="polite">
            {{ cartCount > 99 ? '99+' : cartCount }}
          </span>
        </RouterLink>

        <!-- Wishlist -->
        <RouterLink :to="{ name: 'wishlist' }" class="app-header__icon-btn" aria-label="Wishlist">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
          </svg>
        </RouterLink>

        <!-- Login / Logout -->
        <RouterLink
          v-if="!isAuthenticated"
          :to="{ name: 'login' }"
          class="app-header__auth-btn"
        >
          Accedi
        </RouterLink>
        <button
          v-else
          class="app-header__auth-btn app-header__auth-btn--logout"
          @click="handleLogout"
        >
          Esci
        </button>
      </div>
    </div>
  </header>
</template>

<style scoped lang="scss">
@use '@/assets/styles/variables' as *;
@use '@/assets/styles/mixins' as *;

.app-header {
  position: sticky;
  top: 0;
  z-index: $z-header;
  background-color: var(--color-bg-header);
  box-shadow: var(--shadow-header);
  transition: background-color var(--transition-base);

  &__inner {
    @include flex-between;
    max-width: $max-width;
    margin: 0 auto;
    padding: 0 $space-5;
    height: $header-height;
    gap: $space-4;
  }

  /* Brand */
  &__brand {
    @include flex-center;
    gap: $space-2;
    text-decoration: none;
    flex-shrink: 0;
  }

  &__logo {
    border-radius: $radius-sm;
    object-fit: contain;
  }

  &__name {
    font-size: $font-size-lg;
    font-weight: $font-weight-bold;
    color: var(--color-primary);
    white-space: nowrap;
  }

  /* Navigazione tipi */
  &__nav {
    display: flex;
    align-items: center;
    gap: $space-1;
    overflow-x: auto;
    scrollbar-width: none;
    flex: 1;
    padding: 0 $space-2;

    /* Nasconde la scrollbar su Webkit */
    &::-webkit-scrollbar { display: none; }
  }

  &__nav-link {
    padding: $space-1 $space-3;
    border-radius: $radius-full;
    font-size: $font-size-sm;
    font-weight: $font-weight-medium;
    white-space: nowrap;
    color: var(--color-text-muted);
    text-decoration: none;
    text-transform: capitalize;
    transition: background-color var(--transition-fast), color var(--transition-fast);

    &:hover,
    &:focus-visible {
      background-color: var(--color-border);
      color: var(--color-text);
      outline: none;
    }

    &--active {
      background-color: var(--color-primary);
      color: #fff;

      &:hover { background-color: var(--color-primary-hover); }
    }

    &--all {
      font-weight: $font-weight-bold;
    }
  }

  /* Azioni utente */
  &__actions {
    display: flex;
    align-items: center;
    gap: $space-3;
    flex-shrink: 0;
  }

  &__cart,
  &__icon-btn {
    position: relative;
    display: flex;
    align-items: center;
    justify-content: center;
    width: 36px;
    height: 36px;
    color: var(--color-text);
    text-decoration: none;
    border-radius: $radius-base;
    transition: color var(--transition-fast), background-color var(--transition-fast);

    svg {
      width: 22px;
      height: 22px;
    }

    &:hover,
    &:focus-visible {
      background-color: var(--color-border);
      color: var(--color-primary);
      outline: none;
    }
  }

  &__cart-badge {
    position: absolute;
    top: -4px;
    right: -4px;
    min-width: 18px;
    height: 18px;
    padding: 0 4px;
    border-radius: $radius-full;
    background-color: var(--color-primary);
    color: #fff;
    font-size: 10px;
    font-weight: $font-weight-bold;
    line-height: 18px;
    text-align: center;
  }

  &__auth-btn {
    padding: $space-1 $space-4;
    border: 2px solid var(--color-primary);
    border-radius: $radius-full;
    font-size: $font-size-sm;
    font-weight: $font-weight-medium;
    color: var(--color-primary);
    background: transparent;
    text-decoration: none;
    cursor: pointer;
    transition: background-color var(--transition-fast), color var(--transition-fast);
    white-space: nowrap;

    &:hover,
    &:focus-visible {
      background-color: var(--color-primary);
      color: #fff;
      outline: none;
    }

    &--logout {
      border-color: var(--color-text-muted);
      color: var(--color-text-muted);

      &:hover,
      &:focus-visible {
        background-color: var(--color-text-muted);
        color: #fff;
      }
    }
  }

  /* Responsive: nascondi nav tipi su schermi piccoli */
  @include respond-to(md) {
    &__nav {
      display: none;
    }
  }

  @include respond-to(sm) {
    &__name { display: none; }
  }
}
</style>
