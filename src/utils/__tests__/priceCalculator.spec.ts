import { describe, it, expect } from 'vitest'
import {
  calculatePrice,
  extractPokemonIdFromUrl,
  getEnglishFlavorText,
  getPokemonImage,
} from '@/utils/priceCalculator'
import type { FlavorTextEntry, Pokemon } from '@/types/pokemon'

// ----------------------------------------------------------------
// Helper per costruire un oggetto sprites minimale
// ----------------------------------------------------------------
function buildSprites(opts: {
  officialArtwork: string | null
  frontDefault: string | null
  frontShiny?: string | null
}): Pokemon['sprites'] {
  return {
    front_default: opts.frontDefault,
    front_shiny: opts.frontShiny ?? null,
    back_default: null,
    other: {
      'official-artwork': {
        front_default: opts.officialArtwork,
        front_shiny: null,
      },
      dream_world: { front_default: null },
    },
  }
}

// ----------------------------------------------------------------
// calculatePrice
// ----------------------------------------------------------------
describe('calculatePrice', () => {
  it('calcola il prezzo come round(totalStat × 0.15)', () => {
    // Bulbasaur: hp=45, atk=49, def=49, sp.atk=65, sp.def=65, spd=45 → totale=318
    // prezzo = round(318 × 0.15) = round(47.7) = 48
    const stats = [
      { base_stat: 45, effort: 0, stat: { name: 'hp', url: '' } },
      { base_stat: 49, effort: 0, stat: { name: 'attack', url: '' } },
      { base_stat: 49, effort: 0, stat: { name: 'defense', url: '' } },
      { base_stat: 65, effort: 1, stat: { name: 'special-attack', url: '' } },
      { base_stat: 65, effort: 0, stat: { name: 'special-defense', url: '' } },
      { base_stat: 45, effort: 0, stat: { name: 'speed', url: '' } },
    ]
    expect(calculatePrice(stats)).toBe(48)
  })

  it('restituisce 0 per un array di stat vuoto', () => {
    expect(calculatePrice([])).toBe(0)
  })

  it('arrotonda correttamente il valore decimale', () => {
    // totale = 107: 107 × 0.15 = 16.05 → round = 16
    const stats = [{ base_stat: 107, effort: 0, stat: { name: 'hp', url: '' } }]
    expect(calculatePrice(stats)).toBe(16)
  })

  it('gestisce pokemon leggendari con stat elevate (Mewtwo: totale=680)', () => {
    // prezzo = round(680 × 0.15) = round(102) = 102
    const stats = [
      { base_stat: 106, effort: 0, stat: { name: 'hp', url: '' } },
      { base_stat: 110, effort: 0, stat: { name: 'attack', url: '' } },
      { base_stat: 90, effort: 0, stat: { name: 'defense', url: '' } },
      { base_stat: 154, effort: 3, stat: { name: 'special-attack', url: '' } },
      { base_stat: 90, effort: 0, stat: { name: 'special-defense', url: '' } },
      { base_stat: 130, effort: 0, stat: { name: 'speed', url: '' } },
    ]
    expect(calculatePrice(stats)).toBe(102)
  })
})

// ----------------------------------------------------------------
// extractPokemonIdFromUrl
// ----------------------------------------------------------------
describe('extractPokemonIdFromUrl', () => {
  it('estrae correttamente l\'id da un URL PokeAPI con slash finale', () => {
    expect(extractPokemonIdFromUrl('https://pokeapi.co/api/v2/pokemon/25/')).toBe(25)
  })

  it('estrae correttamente l\'id da un URL senza slash finale', () => {
    expect(extractPokemonIdFromUrl('https://pokeapi.co/api/v2/pokemon/150')).toBe(150)
  })

  it('funziona anche con id a 4 cifre', () => {
    expect(extractPokemonIdFromUrl('https://pokeapi.co/api/v2/pokemon/1000/')).toBe(1000)
  })
})

// ----------------------------------------------------------------
// getPokemonImage
// ----------------------------------------------------------------
describe('getPokemonImage', () => {
  it('preferisce l\'official artwork front_default', () => {
    const sprites = buildSprites({ officialArtwork: 'artwork.png', frontDefault: 'sprite.png' })
    expect(getPokemonImage(sprites)).toBe('artwork.png')
  })

  it('usa front_default come fallback se l\'artwork è null', () => {
    const sprites = buildSprites({ officialArtwork: null, frontDefault: 'sprite.png' })
    expect(getPokemonImage(sprites)).toBe('sprite.png')
  })

  it('restituisce il placeholder se nessuno sprite è disponibile', () => {
    const sprites = buildSprites({ officialArtwork: null, frontDefault: null })
    expect(getPokemonImage(sprites)).toBe('/img/placeholder-pokemon.png')
  })

  it('con shiny=true preferisce official-artwork front_shiny', () => {
    const sprites: Pokemon['sprites'] = {
      front_default: 'sprite.png',
      front_shiny: 'shiny-sprite.png',
      back_default: null,
      other: {
        'official-artwork': { front_default: 'artwork.png', front_shiny: 'shiny-artwork.png' },
        dream_world: { front_default: null },
      },
    }
    expect(getPokemonImage(sprites, true)).toBe('shiny-artwork.png')
  })
})

// ----------------------------------------------------------------
// getEnglishFlavorText
// ----------------------------------------------------------------
describe('getEnglishFlavorText', () => {
  it('restituisce l\'entry inglese più recente', () => {
    const entries: FlavorTextEntry[] = [
      { flavor_text: 'Old text.', language: { name: 'en', url: '' }, version: { name: 'red', url: '' } },
      { flavor_text: 'New text.', language: { name: 'en', url: '' }, version: { name: 'scarlet', url: '' } },
    ]
    expect(getEnglishFlavorText(entries)).toBe('New text.')
  })

  it('normalizza i caratteri di spaziatura anomali (\\f, \\n, \\r)', () => {
    const entries: FlavorTextEntry[] = [
      {
        flavor_text: 'line1\nline2\fline3\r',
        language: { name: 'en', url: '' },
        version: { name: 'x', url: '' },
      },
    ]
    expect(getEnglishFlavorText(entries)).toBe('line1 line2 line3')
  })

  it('restituisce il testo di fallback se non ci sono entry in inglese', () => {
    const entries: FlavorTextEntry[] = [
      { flavor_text: 'texto', language: { name: 'es', url: '' }, version: { name: 'x', url: '' } },
    ]
    expect(getEnglishFlavorText(entries)).toBe('No description available.')
  })

  it('restituisce il testo di fallback per array vuoto', () => {
    expect(getEnglishFlavorText([])).toBe('No description available.')
  })
})
