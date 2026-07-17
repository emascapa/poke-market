<script setup lang="ts">
import type { NamedAPIResource } from '@/types/pokemon'

const props = defineProps<{
  types: NamedAPIResource[]
  activeTypes: string[]
}>()

const emit = defineEmits<{
  'update:activeTypes': [types: string[]]
}>()

/** Indice della pill nel set attivo (-1 = non selezionata) */
function selectionIndex(typeName: string): number {
  return props.activeTypes.indexOf(typeName)
}

/**
 * Gestisce il click su una pill:
 * - già selezionata → rimuove
 * - non selezionata e slot libero → aggiunge
 * - non selezionata e già 2 selezionati → rimpiazza il più vecchio (FIFO)
 */
function toggle(typeName: string) {
  const current = [...props.activeTypes]
  const idx = current.indexOf(typeName)

  if (idx !== -1) {
    current.splice(idx, 1)
  } else if (current.length < 2) {
    current.push(typeName)
  } else {
    /* Scorre la finestra: rimuove il primo, aggiunge il nuovo */
    current.shift()
    current.push(typeName)
  }

  emit('update:activeTypes', current)
}
</script>

<template>
  <div class="type-filter" role="navigation" aria-label="Filter by type">
    <!-- Pill reset: mostra tutti i pokemon -->
    <button
      class="type-filter__pill"
      :class="{ 'type-filter__pill--active': activeTypes.length === 0 }"
      :aria-pressed="activeTypes.length === 0"
      @click="emit('update:activeTypes', [])"
    >
      All
    </button>

    <!-- Una pill per ogni tipo -->
    <button
      v-for="type in types"
      :key="type.name"
      class="type-filter__pill"
      :class="[
        `type-filter__pill--${type.name}`,
        {
          'type-filter__pill--active': selectionIndex(type.name) !== -1,
          'type-filter__pill--second': selectionIndex(type.name) === 1,
        },
      ]"
      :aria-pressed="selectionIndex(type.name) !== -1"
      :title="
        selectionIndex(type.name) !== -1
          ? `Remove ${type.name}`
          : activeTypes.length === 2
            ? `Replace ${activeTypes[0]} with ${type.name}`
            : `Filter by ${type.name}`
      "
      @click="toggle(type.name)"
    >
      {{ type.name }}
      <!-- Numero d'ordine visibile quando 2 tipi sono attivi -->
      <span
        v-if="activeTypes.length === 2 && selectionIndex(type.name) !== -1"
        class="type-filter__order"
        aria-hidden="true"
      >
        {{ selectionIndex(type.name) + 1 }}
      </span>
    </button>

    <!-- Label combinazione attiva: es. "fire + flying" -->
    <span
      v-if="activeTypes.length === 2"
      class="type-filter__combo"
      aria-live="polite"
    >
      {{ activeTypes[0] }} + {{ activeTypes[1] }}
    </span>
  </div>
</template>

<style scoped lang="scss">
@use '@/assets/styles/variables' as *;

.type-filter {
  display: flex;
  flex-wrap: wrap;
  gap: $space-2;
  padding: $space-4 0;
  align-items: center;

  &__pill {
    position: relative;
    display: inline-flex;
    align-items: center;
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

    /* Primo tipo selezionato: riempito con il colore del tipo */
    &--active {
      background-color: var(--color-primary);
      border-color: var(--color-primary);
      color: #fff;
    }

    /* Genera colori per ogni tipo */
    @each $name, $color in $type-colors {
      &--#{$name}#{&}--active {
        background-color: $color;
        border-color: $color;
        color: #fff;
      }
    }
  }

  /* Numero d'ordine piccolo sulla pill (1 o 2) */
  &__order {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 14px;
    height: 14px;
    margin-left: 4px;
    border-radius: 50%;
    background: rgba(0, 0, 0, 0.2);
    font-size: 9px;
    font-weight: $font-weight-bold;
    line-height: 14px;
  }

  /* Label combinazione es. "fire + flying" */
  &__combo {
    padding: $space-1 $space-3;
    border-radius: $radius-full;
    background: var(--color-border);
    font-size: $font-size-xs;
    font-weight: $font-weight-bold;
    color: var(--color-text-muted);
    text-transform: capitalize;
    white-space: nowrap;
    border: 1px dashed var(--color-text-muted);
  }
}
</style>
