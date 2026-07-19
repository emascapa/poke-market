import { describe, it, expect, vi, beforeEach } from 'vitest'
import { shallowMount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import PokemonCard from '@/components/pokemon/PokemonCard.vue'
import type { Pokemon } from '@/types/pokemon'

/* Mocka vue-router per evitare errori "No active router" in ambiente jsdom */
vi.mock('vue-router', () => ({
  useRouter: () => ({ push: vi.fn() }),
}))

// ----------------------------------------------------------------
// Dati di test
// ----------------------------------------------------------------

/** Pikachu: totale stat = 320, prezzo = round(320 × 0.15) = 48 */
const mockPokemon: Pokemon = {
  id: 25,
  name: 'pikachu',
  base_experience: 112,
  height: 4,
  weight: 60,
  is_default: true,
  order: 35,
  sprites: {
    front_default: 'sprite.png',
    front_shiny: null,
    back_default: null,
    other: {
      'official-artwork': { front_default: 'artwork.png', front_shiny: null },
      dream_world: { front_default: null },
    },
  },
  stats: [
    { base_stat: 35, effort: 0, stat: { name: 'hp', url: '' } },
    { base_stat: 55, effort: 0, stat: { name: 'attack', url: '' } },
    { base_stat: 40, effort: 0, stat: { name: 'defense', url: '' } },
    { base_stat: 50, effort: 0, stat: { name: 'special-attack', url: '' } },
    { base_stat: 50, effort: 0, stat: { name: 'special-defense', url: '' } },
    { base_stat: 90, effort: 2, stat: { name: 'speed', url: '' } },
  ],
  types: [{ slot: 1, type: { name: 'electric', url: '' } }],
  abilities: [],
  species: { name: 'pikachu', url: '' },
}

const MOCK_PRICE = 48

// ----------------------------------------------------------------
// Suite di test
// ----------------------------------------------------------------
describe('PokemonCard', () => {
  /* Inizializza un'istanza Pinia pulita prima di ogni test */
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  /** Monta la card con le props di default; usa shallowMount per isolare i componenti figli */
  function mountCard(price = MOCK_PRICE) {
    return shallowMount(PokemonCard, {
      props: { pokemon: mockPokemon, price },
    })
  }

  it('visualizza il nome del pokemon', () => {
    const wrapper = mountCard()
    expect(wrapper.find('.pokemon-card__name').text()).toBe('pikachu')
  })

  it('visualizza il prezzo formattato con simbolo €', () => {
    const wrapper = mountCard()
    expect(wrapper.find('.pokemon-card__price').text()).toBe('€48.00')
  })

  it('visualizza il numero del pokédex a 4 cifre con prefisso #', () => {
    const wrapper = mountCard()
    expect(wrapper.find('.pokemon-card__id').text()).toBe('#0025')
  })

  it('usa il prezzo passato come prop per il calcolo', () => {
    const wrapper = mountCard(99)
    expect(wrapper.find('.pokemon-card__price').text()).toBe('€99.00')
  })

  it('mostra il pulsante wishlist', () => {
    const wrapper = mountCard()
    expect(wrapper.find('.pokemon-card__wishlist-btn').exists()).toBe(true)
  })

  it('mostra il pulsante "Add" quando il pokemon non è nel carrello', () => {
    const wrapper = mountCard()
    expect(wrapper.find('.pokemon-card__cart-btn').text()).toBe('Add')
  })

  it('il componente è accessibile: ha role="button" e tabindex="0"', () => {
    const wrapper = mountCard()
    const article = wrapper.find('.pokemon-card')
    expect(article.attributes('role')).toBe('button')
    expect(article.attributes('tabindex')).toBe('0')
  })
})
