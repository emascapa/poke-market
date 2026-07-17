<script setup lang="ts">
import type { NamedAPIResource } from '@/types/pokemon'

defineProps<{
  types: NamedAPIResource[]
  activeType: string | null
}>()

const emit = defineEmits<{
  'update:activeType': [type: string | null]
}>()
</script>

<template>
  <div class="type-filter" role="navigation" aria-label="Filtro per tipo">
    <!-- Pill "Tutti" -->
    <button
      class="type-filter__pill"
      :class="{ 'type-filter__pill--active': activeType === null }"
      :aria-pressed="activeType === null"
      @click="emit('update:activeType', null)"
    >
      Tutti
    </button>

    <!-- Una pill per ogni tipo -->
    <button
      v-for="type in types"
      :key="type.name"
      class="type-filter__pill"
      :class="[`type-filter__pill--${type.name}`, { 'type-filter__pill--active': activeType === type.name }]"
      :aria-pressed="activeType === type.name"
      @click="emit('update:activeType', type.name)"
    >
      {{ type.name }}
    </button>
  </div>
</template>

<style scoped lang="scss">
@use '@/assets/styles/variables' as *;

.type-filter {
  display: flex;
  flex-wrap: wrap;
  gap: $space-2;
  padding: $space-4 0;

  &__pill {
    padding: $space-1 $space-4;
    border: 1.5px solid var(--color-border);
    border-radius: $radius-full;
    font-size: $font-size-sm;
    font-weight: $font-weight-medium;
    text-transform: capitalize;
    color: var(--color-text-muted);
    background: transparent;
    cursor: pointer;
    transition: border-color var(--transition-fast),
                background-color var(--transition-fast),
                color var(--transition-fast);

    &:hover,
    &:focus-visible {
      border-color: var(--color-primary);
      color: var(--color-primary);
      outline: none;
    }

    /* Stato attivo base */
    &--active {
      background-color: var(--color-primary);
      border-color: var(--color-primary);
      color: #fff;
    }

    /* Genera una variante colorata per ogni tipo.
       Se attiva, usa il colore del tipo anziché il primario. */
    @each $name, $color in $type-colors {
      &--#{$name}.type-filter__pill--active {
        background-color: $color;
        border-color: $color;
        @if $name == 'electric' or $name == 'ice' or $name == 'normal' or $name == 'ground' {
          color: rgba(0, 0, 0, 0.75);
        } @else {
          color: #fff;
        }
      }
    }
  }
}
</style>
