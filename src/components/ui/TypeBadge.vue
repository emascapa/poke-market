<script setup lang="ts">
defineProps<{
  type: string
}>()
</script>

<template>
  <span :class="['type-badge', `type-badge--${type}`]">
    {{ type }}
  </span>
</template>

<style scoped lang="scss">
@use '@/assets/styles/variables' as *;

.type-badge {
  display: inline-block;
  padding: 2px $space-2;
  border-radius: $radius-full;
  font-size: $font-size-xs;
  font-weight: $font-weight-bold;
  color: #fff;
  text-transform: capitalize;
  letter-spacing: 0.5px;
  /* Colore di fallback se il tipo non è nel design system */
  background-color: $type-normal;

  /* Genera una classe per ogni tipo usando la mappa $type-colors */
  @each $name, $color in $type-colors {
    &--#{$name} {
      background-color: $color;
      /* Testo scuro per i tipi chiari */
      @if $name == 'electric' or $name == 'ice' or $name == 'normal' or $name == 'ground' {
        color: rgba(0, 0, 0, 0.75);
      }
    }
  }
}
</style>
