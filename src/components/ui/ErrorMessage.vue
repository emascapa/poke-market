<script setup lang="ts">
defineProps<{
  message: string
}>()

const emit = defineEmits<{
  retry: []
}>()
</script>

<template>
  <div class="error-message" role="alert">
    <!-- Icona di errore SVG inline (no dipendenze esterne) -->
    <svg
      class="error-message__icon"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      stroke-width="2"
      aria-hidden="true"
    >
      <circle cx="12" cy="12" r="10" />
      <line x1="12" y1="7" x2="12" y2="13" />
      <line x1="12" y1="16" x2="12.01" y2="16" stroke-linecap="round" />
    </svg>

    <p class="error-message__text">{{ message }}</p>

    <button
      v-if="$attrs.onRetry !== undefined"
      class="error-message__btn"
      @click="emit('retry')"
    >
      Retry
    </button>
  </div>
</template>

<style scoped lang="scss">
@use '@/assets/styles/variables' as *;
@use '@/assets/styles/mixins' as *;

.error-message {
  @include flex-center;
  flex-direction: column;
  gap: $space-4;
  padding: $space-7 $space-5;
  text-align: center;

  &__icon {
    width: 48px;
    height: 48px;
    color: var(--color-error);
  }

  &__text {
    color: var(--color-text-muted);
    font-size: $font-size-md;
    max-width: 360px;
  }

  &__btn {
    padding: $space-2 $space-5;
    border: 2px solid var(--color-primary);
    border-radius: $radius-full;
    color: var(--color-primary);
    font-size: $font-size-base;
    font-weight: $font-weight-medium;
    cursor: pointer;
    transition: background-color var(--transition-fast), color var(--transition-fast);

    &:hover,
    &:focus-visible {
      background-color: var(--color-primary);
      color: var(--color-text-inverse);
      outline: none;
    }
  }
}
</style>
