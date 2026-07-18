<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref } from 'vue'
import { RouterLink, useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { useCartStore } from '@/stores/cart'
import { usePokemonStore } from '@/stores/pokemon'
import { useTheme } from '@/composables/useTheme'
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

/* Stato del dropdown dei tipi */
const dropdownOpen = ref(false)

function toggleDropdown() {
  dropdownOpen.value = !dropdownOpen.value
}

function closeDropdown() {
  dropdownOpen.value = false
}

/* Chiude il dropdown se si clicca fuori da esso */
function onDocumentClick(e: MouseEvent) {
  const target = e.target as HTMLElement
  if (!target.closest('.app-header__types-menu')) {
    closeDropdown()
  }
}

/* Chiude il dropdown con il tasto Escape */
function onKeydown(e: KeyboardEvent) {
  if (e.key === 'Escape') closeDropdown()
}

onMounted(() => {
  document.addEventListener('click', onDocumentClick)
  document.addEventListener('keydown', onKeydown)
})

onUnmounted(() => {
  document.removeEventListener('click', onDocumentClick)
  document.removeEventListener('keydown', onKeydown)
})

function handleLogout() {
  auth.logout()
  router.push({ name: 'home' })
}

const { theme, toggleTheme } = useTheme()
</script>

<template>
  <header class="app-header">
    <div class="app-header__inner">
      <!-- Logo e nome store -->
      <RouterLink class="app-header__brand" :to="{ name: 'home' }" aria-label="Poke Market — Home">
        <img :src="logoUrl" alt="Logo Poke Market" class="app-header__logo" width="50" height="50" />
        <span class="app-header__name">PokéMarket</span>
      </RouterLink>

      <!-- Dropdown tipi -->
      <div class="app-header__types-menu">
        <button
          class="app-header__types-btn"
          :class="{ 'app-header__types-btn--open': dropdownOpen }"
          :aria-expanded="dropdownOpen"
          aria-haspopup="listbox"
          @click.stop="toggleDropdown"
        >
          Types
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" aria-hidden="true">
            <polyline points="6 9 12 15 18 9" />
          </svg>
        </button>

        <Transition name="dropdown">
          <div
            v-if="dropdownOpen"
            class="app-header__dropdown"
            role="listbox"
            aria-label="Pokemon types"
          >
            <!-- Opzione "All" -->
            <RouterLink
              role="option"
              :to="{ name: 'home' }"
              class="app-header__dropdown-item app-header__dropdown-item--all"
              :class="{ 'app-header__dropdown-item--active': $route.name === 'home' && !$route.query.category }"
              :aria-selected="$route.name === 'home' && !$route.query.category"
              @click="closeDropdown"
            >
              All
            </RouterLink>

            <!-- Lista tipi -->
            <RouterLink
              v-for="type in types"
              :key="type.name"
              role="option"
              :to="{ name: 'home', query: { category: type.name } }"
              class="app-header__dropdown-item"
              :class="[
                `app-header__dropdown-item--${type.name}`,
                { 'app-header__dropdown-item--active': $route.query.category?.includes(type.name) },
              ]"
              :aria-selected="$route.query.category?.includes(type.name)"
              @click="closeDropdown"
            >
              <span class="app-header__dropdown-dot" :class="`app-header__dropdown-dot--${type.name}`" aria-hidden="true" />
              {{ type.name }}
            </RouterLink>
          </div>
        </Transition>
      </div>

      <!-- Azioni utente -->
      <div class="app-header__actions">
        <!-- Pulsante carrello con counter -->
        <RouterLink
          :to="{ name: 'cart' }"
          class="app-header__cart"
          :aria-label="`Cart, ${cartCount} items`"
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

        <!-- Toggle tema chiaro/scuro -->
        <button
          class="app-header__theme-btn"
          :aria-label="theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'"
          @click="toggleTheme"
        >
          <!-- Icona sole (light mode) -->
          <svg v-if="theme === 'dark'" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
            <circle cx="12" cy="12" r="5" />
            <line x1="12" y1="1" x2="12" y2="3" />
            <line x1="12" y1="21" x2="12" y2="23" />
            <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
            <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
            <line x1="1" y1="12" x2="3" y2="12" />
            <line x1="21" y1="12" x2="23" y2="12" />
            <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
            <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
          </svg>
          <!-- Icona luna (dark mode) -->
          <svg v-else viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
            <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
          </svg>
        </button>

        <!-- Login / Logout -->
        <RouterLink
          v-if="!isAuthenticated"
          :to="{ name: 'login' }"
          class="app-header__auth-btn"
        >
          Sign in
        </RouterLink>
        <button
          v-else
          class="app-header__auth-btn app-header__auth-btn--logout"
          @click="handleLogout"
        >
          Sign out
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

  /* Dropdown wrapper */
  &__types-menu {
    position: relative;
    flex: 1;
  }

  /* Pulsante "Types" */
  &__types-btn {
    @include flex-center;
    gap: $space-1;
    padding: $space-2 $space-4;
    border: 1.5px solid var(--color-border);
    border-radius: $radius-full;
    font-size: $font-size-sm;
    font-weight: $font-weight-medium;
    color: var(--color-text);
    background: var(--color-bg-card);
    cursor: pointer;
    transition: border-color var(--transition-fast), color var(--transition-fast),
                background-color var(--transition-fast);

    svg {
      width: 14px;
      height: 14px;
      transition: transform var(--transition-fast);
    }

    &:hover,
    &:focus-visible {
      border-color: var(--color-primary);
      color: var(--color-primary);
      outline: none;
    }

    &--open {
      border-color: var(--color-primary);
      color: var(--color-primary);

      svg { transform: rotate(180deg); }
    }
  }

  /* Pannello dropdown */
  &__dropdown {
    position: absolute;
    top: calc(100% + $space-2);
    left: 0;
    min-width: 200px;
    max-height: 380px;
    overflow-y: auto;
    background: var(--color-bg-card);
    border: 1px solid var(--color-border);
    border-radius: $radius-md;
    box-shadow: var(--shadow-card-hover);
    padding: $space-2 0;
    z-index: $z-dropdown;
    /* Griglia a 2 colonne per sfruttare meglio lo spazio */
    display: grid;
    grid-template-columns: 1fr 1fr;

    scrollbar-width: thin;
    scrollbar-color: var(--color-border) transparent;
  }

  /* Voci del dropdown */
  &__dropdown-item {
    @include flex-center;
    justify-content: flex-start;
    gap: $space-2;
    padding: $space-2 $space-4;
    font-size: $font-size-sm;
    font-weight: $font-weight-medium;
    text-transform: capitalize;
    color: var(--color-text-muted);
    text-decoration: none;
    transition: background-color var(--transition-fast), color var(--transition-fast);

    &:hover,
    &:focus-visible {
      background-color: var(--color-border);
      color: var(--color-text);
      outline: none;
    }

    /* "All" occupa tutta la larghezza */
    &--all {
      grid-column: 1 / -1;
      font-weight: $font-weight-bold;
      border-bottom: 1px solid var(--color-border);
      margin-bottom: $space-1;
    }

    &--active {
      color: var(--color-primary);
      font-weight: $font-weight-bold;
    }
  }

  /* Pallino colorato per il tipo */
  &__dropdown-dot {
    flex-shrink: 0;
    width: 10px;
    height: 10px;
    border-radius: 50%;
    background-color: var(--color-border);

    @each $name, $color in $type-colors {
      &--#{$name} { background-color: $color; }
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

  /* Pulsante tema chiaro/scuro */
  &__theme-btn {
    @include flex-center;
    flex-shrink: 0;
    width: 36px;
    height: 36px;
    border: none;
    border-radius: $radius-base;
    background: transparent;
    color: var(--color-text);
    cursor: pointer;
    transition: color var(--transition-fast), background-color var(--transition-fast);

    svg {
      width: 20px;
      height: 20px;
    }

    &:hover,
    &:focus-visible {
      background-color: var(--color-border);
      color: var(--color-primary);
      outline: none;
    }
  }

  @include respond-to(sm) {
    &__name { display: none; }
  }
}

/* Animazione apertura/chiusura dropdown */
.dropdown-enter-active,
.dropdown-leave-active {
  transition: opacity var(--transition-fast), transform var(--transition-fast);
  transform-origin: top left;
}

.dropdown-enter-from,
.dropdown-leave-to {
  opacity: 0;
  transform: scaleY(0.92) translateY(-4px);
}
</style>
