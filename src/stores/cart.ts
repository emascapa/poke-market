import { ref, computed } from 'vue'
import { defineStore } from 'pinia'
import { calculatePrice } from '@/utils/priceCalculator'
import type { CartItem, Pokemon } from '@/types/pokemon'

export const useCartStore = defineStore('cart', () => {
  const items = ref<CartItem[]>([])

  /** Numero totale di articoli nel carrello (somma delle quantità). */
  const totalItems = computed(() => items.value.reduce((sum, item) => sum + item.quantity, 0))

  /** Prezzo totale del carrello. */
  const totalPrice = computed(() =>
    items.value.reduce((sum, item) => sum + item.price * item.quantity, 0),
  )

  /**
   * Aggiunge un pokemon al carrello.
   * Se è già presente, incrementa solo la quantità.
   */
  function addToCart(pokemon: Pokemon): void {
    const existing = items.value.find((item) => item.pokemon.id === pokemon.id)
    if (existing) {
      existing.quantity++
    } else {
      items.value.push({
        pokemon,
        quantity: 1,
        price: calculatePrice(pokemon.stats),
      })
    }
  }

  /** Rimuove completamente un pokemon dal carrello. */
  function removeFromCart(pokemonId: number): void {
    const index = items.value.findIndex((item) => item.pokemon.id === pokemonId)
    if (index !== -1) items.value.splice(index, 1)
  }

  /**
   * Aggiorna la quantità di un articolo.
   * Se la quantità è <= 0 rimuove l'articolo dal carrello.
   */
  function updateQuantity(pokemonId: number, quantity: number): void {
    if (quantity <= 0) {
      removeFromCart(pokemonId)
      return
    }
    const item = items.value.find((item) => item.pokemon.id === pokemonId)
    if (item) item.quantity = quantity
  }

  /** Svuota completamente il carrello. */
  function clearCart(): void {
    items.value = []
  }

  return { items, totalItems, totalPrice, addToCart, removeFromCart, updateQuantity, clearCart }
})
