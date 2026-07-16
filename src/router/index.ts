import { createRouter, createWebHistory, type RouteLocationNormalized } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

// Augmentazione del tipo RouteMeta di vue-router con i meta campi del progetto.
// Deve essere in un file che ha già import/export (modulo), non in un file .d.ts
// senza import, altrimenti TypeScript la tratta come ambient module declaration
// e sovrascrive l'intero modulo vue-router invece di estenderlo.
declare module 'vue-router' {
  interface RouteMeta {
    requiresAuth?: boolean
  }
}

// HomeView viene importata subito (non lazy) perché è la pagina di atterraggio più frequente.
// Tutte le altre view sono lazy-loaded per ottimizzare il bundle iniziale.
import HomeView from '../views/HomeView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: HomeView,
    },
    {
      path: '/pokemon/:id',
      name: 'pokemon-detail',
      component: () => import('../views/PokemonDetailView.vue'),
      // L'id viene passato come prop al componente tramite vue-router
      props: true,
    },
    {
      path: '/login',
      name: 'login',
      component: () => import('../views/LoginView.vue'),
    },
    {
      // Rotta protetta: accessibile solo agli utenti autenticati
      path: '/cart',
      name: 'cart',
      component: () => import('../views/CartView.vue'),
      meta: { requiresAuth: true },
    },
    {
      // Rotta protetta: accessibile solo agli utenti autenticati
      path: '/wishlist',
      name: 'wishlist',
      component: () => import('../views/WishlistView.vue'),
      meta: { requiresAuth: true },
    },
  ],
})

// ----------------------------------------------------------------
// Navigation guard globale
// Prima di ogni navigazione controlla se la rotta richiede autenticazione.
// In caso negativo, reindirizza a /login conservando la destinazione
// originale nel query param `redirect` per un redirect post-login.
// ----------------------------------------------------------------
router.beforeEach((to: RouteLocationNormalized) => {
  if (!to.meta.requiresAuth) return true

  const auth = useAuthStore()
  if (auth.isAuthenticated) return true

  return { name: 'login', query: { redirect: to.fullPath } }
})

export default router
