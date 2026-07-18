import { ref } from 'vue'

const STORAGE_KEY = 'poke-market:daily-shiny'
const SHINY_COUNT = 50
const MAX_ID = 1000

interface DailyShinyData {
  date: string
  ids: number[]
}

function todayISO(): string {
  return new Date().toISOString().slice(0, 10)
}

function generateShinyIds(): number[] {
  const ids = new Set<number>()
  while (ids.size < SHINY_COUNT) {
    ids.add(Math.floor(Math.random() * MAX_ID) + 1)
  }
  return Array.from(ids)
}

function loadOrGenerateShinyIds(): Set<number> {
  const today = todayISO()
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) {
      const data: DailyShinyData = JSON.parse(raw)
      if (data.date === today && Array.isArray(data.ids)) {
        return new Set(data.ids)
      }
    }
  } catch {
    /* dati corrotti: rigenera */
  }
  const ids = generateShinyIds()
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ date: today, ids }))
  } catch {
    /* localStorage non disponibile: prosegui senza persistenza */
  }
  return new Set(ids)
}

/* Singleton: viene calcolato una sola volta per sessione applicazione */
const shinyIds = ref<Set<number>>(loadOrGenerateShinyIds())

export function useDailyShiny() {
  return { shinyIds }
}
