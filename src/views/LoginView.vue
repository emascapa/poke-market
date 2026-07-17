<script setup lang="ts">
import { ref } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import logoUrl from '@/assets/images/logo.png'

const router = useRouter()
const route = useRoute()
const auth = useAuthStore()

const username = ref('')
const password = ref('')
const error = ref<string | null>(null)
const isLoading = ref(false)

async function handleSubmit() {
  if (!username.value || !password.value) {
    error.value = 'Please enter your username and password.'
    return
  }

  isLoading.value = true
  error.value = null

  try {
    await auth.login({ username: username.value, password: password.value })
    /* Dopo il login torna alla pagina da cui l'utente proveniva, o alla home */
    const redirect = typeof route.query.redirect === 'string' ? route.query.redirect : '/'
    router.push(redirect)
  } catch {
    error.value = 'Invalid credentials. Please try again.'
  } finally {
    isLoading.value = false
  }
}
</script>

<template>
  <div class="login-view">
    <div class="login-view__card">
      <!-- Logo e titolo -->
      <div class="login-view__header">
        <img :src="logoUrl" alt="Logo PokéMarket" class="login-view__logo" width="56" height="56" />
        <h1 class="login-view__title">PokéMarket</h1>
        <p class="login-view__subtitle">Sign in to manage your cart and wishlist</p>
      </div>

      <!-- Form di login -->
      <form class="login-view__form" novalidate @submit.prevent="handleSubmit">
        <!-- Campo username -->
        <div class="login-view__field">
          <label class="login-view__label" for="username">Username</label>
          <input
            id="username"
            v-model="username"
            class="login-view__input"
            type="text"
            autocomplete="username"
            placeholder="e.g. johnd"
            :disabled="isLoading"
            required
          />
        </div>

        <!-- Campo password -->
        <div class="login-view__field">
          <label class="login-view__label" for="password">Password</label>
          <input
            id="password"
            v-model="password"
            class="login-view__input"
            type="password"
            autocomplete="current-password"
            placeholder="••••••••"
            :disabled="isLoading"
            required
          />
        </div>

        <!-- Messaggio di errore -->
        <p v-if="error" class="login-view__error" role="alert">{{ error }}</p>

        <!-- Pulsante submit -->
        <button
          class="login-view__submit"
          type="submit"
          :disabled="isLoading"
        >
          <span v-if="isLoading" class="login-view__spinner" aria-hidden="true" />
          {{ isLoading ? 'Signing in…' : 'Sign in' }}
        </button>
      </form>

      <!-- Credenziali demo -->
      <p class="login-view__hint">
        Demo: <strong>johnd</strong> / <strong>m38rmF$</strong>
      </p>
    </div>
  </div>
</template>

<style scoped lang="scss">
@use '@/assets/styles/variables' as *;
@use '@/assets/styles/mixins' as *;

.login-view {
  @include flex-center;
  min-height: calc(100vh - #{$header-height});
  padding: $space-5;
  background-color: var(--color-bg);

  &__card {
    width: 100%;
    max-width: 420px;
    background: var(--color-bg-card);
    border: 1px solid var(--color-border);
    border-radius: $radius-lg;
    box-shadow: var(--shadow-card);
    padding: $space-7 $space-6;
    display: flex;
    flex-direction: column;
    gap: $space-5;
  }

  &__header {
    @include flex-center;
    flex-direction: column;
    gap: $space-2;
    text-align: center;
  }

  &__logo {
    border-radius: $radius-base;
  }

  &__title {
    font-size: $font-size-xl;
    font-weight: $font-weight-bold;
    color: var(--color-primary);
  }

  &__subtitle {
    font-size: $font-size-sm;
    color: var(--color-text-muted);
  }

  &__form {
    display: flex;
    flex-direction: column;
    gap: $space-4;
  }

  &__field {
    display: flex;
    flex-direction: column;
    gap: $space-1;
  }

  &__label {
    font-size: $font-size-sm;
    font-weight: $font-weight-medium;
    color: var(--color-text);
  }

  &__input {
    padding: $space-3 $space-4;
    border: 1.5px solid var(--color-border);
    border-radius: $radius-base;
    font-size: $font-size-base;
    background: var(--color-bg);
    color: var(--color-text);
    transition: border-color var(--transition-fast);

    &:focus {
      outline: none;
      border-color: var(--color-primary);
    }

    &:disabled {
      opacity: 0.6;
      cursor: not-allowed;
    }
  }

  &__error {
    font-size: $font-size-sm;
    color: var(--color-error);
    padding: $space-2 $space-3;
    background: rgba(229, 57, 53, 0.08);
    border-radius: $radius-base;
    border-left: 3px solid var(--color-error);
  }

  &__submit {
    @include flex-center;
    gap: $space-2;
    padding: $space-3;
    border: none;
    border-radius: $radius-base;
    background-color: var(--color-primary);
    color: #fff;
    font-size: $font-size-base;
    font-weight: $font-weight-bold;
    cursor: pointer;
    transition: background-color var(--transition-fast);

    &:hover:not(:disabled) { background-color: var(--color-primary-hover); }
    &:focus-visible { outline: 2px solid var(--color-primary); outline-offset: 2px; }
    &:disabled { opacity: 0.6; cursor: not-allowed; }
  }

  /* Spinner inline nel pulsante */
  &__spinner {
    display: inline-block;
    width: 16px;
    height: 16px;
    border: 2px solid rgba(255,255,255,0.4);
    border-top-color: #fff;
    border-radius: 50%;
    animation: spin 0.7s linear infinite;
  }

  &__hint {
    text-align: center;
    font-size: $font-size-xs;
    color: var(--color-text-muted);
  }
}

@keyframes spin {
  to { transform: rotate(360deg); }
}
</style>

