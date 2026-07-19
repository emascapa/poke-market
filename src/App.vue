<script setup lang="ts">
import { RouterView } from 'vue-router'
import AppHeader from '@/components/layout/AppHeader.vue'
/* Inizializza il tema al bootstrap dell'app leggendo localStorage o la preferenza di sistema */
import { useTheme } from '@/composables/useTheme'

useTheme()
</script>

<template>
  <!-- Layout principale: header sticky + area contenuto -->
  <AppHeader />
  <main class="app-main">
    <!-- Transizione di pagina: fade + slide verticale tra route -->
    <RouterView v-slot="{ Component }">
      <Transition name="page" mode="out-in">
        <component :is="Component" />
      </Transition>
    </RouterView>
  </main>
</template>

<style>
/* Transizione di route — non scoped perché deve coprire i component figli */
.page-enter-active,
.page-leave-active {
  transition:
    opacity var(--transition-base),
    transform var(--transition-base);
}

.page-enter-from {
  opacity: 0;
  transform: translateY(10px);
}

.page-leave-to {
  opacity: 0;
  transform: translateY(-6px);
}
</style>

<style scoped>
.app-main {
  min-height: calc(100vh - 64px);
}
</style>
