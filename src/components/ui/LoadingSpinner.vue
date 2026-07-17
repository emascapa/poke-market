<script setup lang="ts">
withDefaults(
  defineProps<{
    /** Dimensione del cerchio in pixel */
    size?: number
  }>(),
  { size: 40 },
)
</script>

<template>
  <div
    class="spinner"
    :style="{ width: `${size}px`, height: `${size}px` }"
    role="status"
    aria-label="Loading"
  />
</template>

<style scoped lang="scss">
@use '@/assets/styles/variables' as *;

.spinner {
  display: inline-block;
  border: 3px solid var(--color-border);
  border-top-color: var(--color-primary);
  border-radius: 50%;
  animation: spin 0.7s linear infinite;
  flex-shrink: 0;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}
</style>
