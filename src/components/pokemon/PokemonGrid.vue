<script setup lang="ts">
import type { Pokemon } from '@/types/pokemon'
import { calculatePrice } from '@/utils/priceCalculator'
import PokemonCard from './PokemonCard.vue'

defineProps<{
  pokemons: Pokemon[]
  isLoading: boolean
  /** Numero di skeleton card da mostrare durante il caricamento */
  skeletonCount?: number
}>()

// Il numero di skeleton deve combaciare con i pokemon per pagina (20 di default)
const DEFAULT_SKELETON_COUNT = 20
</script>

<template>
  <section class="pokemon-grid" aria-live="polite" :aria-busy="isLoading">
    <!-- Skeleton loading: mostra card placeholder durante il fetch -->
    <template v-if="isLoading">
      <div
        v-for="i in (skeletonCount ?? DEFAULT_SKELETON_COUNT)"
        :key="`skeleton-${i}`"
        class="pokemon-grid__skeleton"
        aria-hidden="true"
      >
        <div class="pokemon-grid__skeleton-img" />
        <div class="pokemon-grid__skeleton-body">
          <div class="pokemon-grid__skeleton-line pokemon-grid__skeleton-line--sm" />
          <div class="pokemon-grid__skeleton-line pokemon-grid__skeleton-line--md" />
          <div class="pokemon-grid__skeleton-line pokemon-grid__skeleton-line--sm" />
          <div class="pokemon-grid__skeleton-line pokemon-grid__skeleton-line--lg" />
        </div>
        <div class="pokemon-grid__skeleton-actions">
          <div class="pokemon-grid__skeleton-btn pokemon-grid__skeleton-btn--icon" />
          <div class="pokemon-grid__skeleton-btn" />
        </div>
      </div>
    </template>

    <!-- Lista pokemon reali -->
    <template v-else>
      <PokemonCard
        v-for="pokemon in pokemons"
        :key="pokemon.id"
        :pokemon="pokemon"
        :price="calculatePrice(pokemon.stats)"
      />
    </template>
  </section>
</template>

<style scoped lang="scss">
@use '@/assets/styles/variables' as *;
@use '@/assets/styles/mixins' as *;

/* Animazione shimmer per gli skeleton */
@keyframes shimmer {
  0%   { background-position: -400px 0; }
  100% { background-position: 400px 0; }
}

%skeleton-base {
  background: linear-gradient(
    90deg,
    var(--color-border) 25%,
    var(--color-bg-card) 50%,
    var(--color-border) 75%
  );
  background-size: 800px 100%;
  animation: shimmer 1.4s infinite linear;
  border-radius: $radius-sm;
}

.pokemon-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: $space-5;

  @include respond-to(xl) { grid-template-columns: repeat(3, 1fr); }
  @include respond-to(lg) { grid-template-columns: repeat(3, 1fr); }
  @include respond-to(md) { grid-template-columns: repeat(2, 1fr); }
  @include respond-to(sm) { grid-template-columns: 1fr; }

  /* Skeleton card */
  &__skeleton {
    @include card;
    display: flex;
    flex-direction: column;
    overflow: hidden;
    pointer-events: none;
  }

  &__skeleton-img {
    @extend %skeleton-base;
    min-height: 160px;
    border-radius: 0;
  }

  &__skeleton-body {
    flex: 1;
    padding: $space-3 $space-4 $space-2;
    display: flex;
    flex-direction: column;
    gap: $space-3;
  }

  &__skeleton-line {
    @extend %skeleton-base;
    height: 12px;

    &--sm  { width: 40%; }
    &--md  { width: 65%; }
    &--lg  { width: 50%; height: 20px; }
  }

  &__skeleton-actions {
    display: flex;
    gap: $space-2;
    padding: $space-2 $space-4 $space-4;
  }

  &__skeleton-btn {
    @extend %skeleton-base;
    height: 36px;
    flex: 1;
    border-radius: $radius-base;

    &--icon {
      flex: 0 0 36px;
      border-radius: $radius-base;
    }
  }
}
</style>
