import { ref, computed } from 'vue'
import { defineStore } from 'pinia'
import { calculatePrice } from '@/utils/priceCalculator'
import type { Pokemon, WishlistItem } from '@/types/pokemon'

export const useWishlistStore = defineStore('wishlist', () => {
  const items = ref<WishlistItem[]>([])

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
