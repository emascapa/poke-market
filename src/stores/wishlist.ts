import { ref, computed, watch } from 'vue'
import { defineStore } from 'pinia'
import { calculatePrice } from '@/utils/priceCalculator'
import type { Pokemon, WishlistItem } from '@/types/pokemon'

const WISHLIST_KEY = 'poke_market_wishlist'

export const useWishlistStore = defineStore('wishlist', () => {
  const stored = localStorage.getItem(WISHLIST_KEY)
  const items = ref<WishlistItem[]>(stored ? (JSON.parse(stored) as WishlistItem[]) : [])

  watch(items, (val) => localStorage.setItem(WISHLIST_KEY, JSON.stringify(val)), { deep: true })

  /** Numero di pokemon salvati nella wishlist. */
  const totalItems = computed(() => items.value.length)

  /** Restituisce true se il pokemon con l'id specificato è nella wishlist. */
  function isWishlisted(pokemonId: number): boolean {
    return items.value.some((item) => item.pokemon.id === pokemonId)
  }

  /**
   * Aggiunge il pokemon alla wishlist se non è presente, altrimenti lo rimuove.
   */
  function toggleWishlist(pokemon: Pokemon): void {
    const index = items.value.findIndex((item) => item.pokemon.id === pokemon.id)
    if (index !== -1) {
      items.value.splice(index, 1)
    } else {
      items.value.push({ pokemon, price: calculatePrice(pokemon.stats) })
    }
  }

  /** Rimuove un pokemon dalla wishlist tramite id. */
  function removeFromWishlist(pokemonId: number): void {
    const index = items.value.findIndex((item) => item.pokemon.id === pokemonId)
    if (index !== -1) items.value.splice(index, 1)
  }

  return { items, totalItems, isWishlisted, toggleWishlist, removeFromWishlist }
})
