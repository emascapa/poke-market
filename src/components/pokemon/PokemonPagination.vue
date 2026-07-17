<script setup lang="ts">
defineProps<{
  currentPage: number
  totalPages: number
  isLoading: boolean
}>()

const emit = defineEmits<{
  'update:page': [page: number]
}>()
</script>

<template>
  <nav
    v-if="totalPages > 1"
    class="pagination"
    aria-label="Navigazione pagine"
  >
    <!-- Precedente -->
    <button
      class="pagination__btn pagination__btn--prev"
      :disabled="currentPage === 0 || isLoading"
      :aria-label="`Vai alla pagina ${currentPage}`"
      @click="emit('update:page', currentPage - 1)"
    >
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" aria-hidden="true">
        <polyline points="15 18 9 12 15 6" />
      </svg>
      Precedente
    </button>

    <!-- Indicatore pagina corrente -->
    <span class="pagination__info" aria-current="page">
      Pagina {{ currentPage + 1 }} di {{ totalPages }}
    </span>

    <!-- Successivo -->
    <button
      class="pagination__btn pagination__btn--next"
      :disabled="currentPage >= totalPages - 1 || isLoading"
      :aria-label="`Vai alla pagina ${currentPage + 2}`"
      @click="emit('update:page', currentPage + 1)"
    >
      Successivo
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" aria-hidden="true">
        <polyline points="9 18 15 12 9 6" />
      </svg>
    </button>
  </nav>
</template>

<style scoped lang="scss">
@use '@/assets/styles/variables' as *;
@use '@/assets/styles/mixins' as *;

.pagination {
  @include flex-center;
  gap: $space-4;
  padding: $space-7 0 $space-5;

  &__btn {
    @include flex-center;
    gap: $space-2;
    padding: $space-2 $space-5;
    border: 1.5px solid var(--color-border);
    border-radius: $radius-full;
    font-size: $font-size-sm;
    font-weight: $font-weight-medium;
    color: var(--color-text);
    background: var(--color-bg-card);
    cursor: pointer;
    transition: border-color var(--transition-fast),
                background-color var(--transition-fast),
                color var(--transition-fast);

    svg {
      width: 16px;
      height: 16px;
    }

    &:hover:not(:disabled),
    &:focus-visible:not(:disabled) {
      border-color: var(--color-primary);
      color: var(--color-primary);
      outline: none;
    }

    &:disabled {
      opacity: 0.35;
      cursor: not-allowed;
    }
  }

  &__info {
    font-size: $font-size-sm;
    color: var(--color-text-muted);
    min-width: 120px;
    text-align: center;
  }

  @include respond-to(sm) {
    gap: $space-2;

    &__btn {
      padding: $space-2 $space-3;
    }
  }
}
</style>
