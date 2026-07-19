# PokéMarket

Web app di e-commerce a tema Pokémon realizzata con **Vue 3**, **TypeScript** e **Pinia**.

I Pokémon sostituiscono i prodotti, i tipi sostituiscono le categorie e i prezzi vengono calcolati a partire dalle stat base. L'autenticazione è gestita tramite la [Fake Store API](https://fakestoreapi.com/docs); tutti i dati sui Pokémon provengono da [PokeAPI](https://pokeapi.co/docs/v2).

---

## Funzionalità

- Griglia paginata di Pokémon con immagini, nomi e prezzi calcolati
- Filtro per tipo (categoria) — riflesso nell'URL (`?category=fire`) con supporto ai deep link
- Pagina di dettaglio con statistiche, descrizione e pulsante aggiungi al carrello
- Carrello e Wishlist — route protette che richiedono autenticazione
- Login / Logout tramite Fake Store API (`johnd` / `m38rmF$`)
- Toggle tema chiaro/scuro (preferenza persistita in `localStorage`)
- Layout completamente responsive (mobile, tablet, desktop)
- Gestione degli errori di rete con messaggi leggibili dall'utente

---

## Stack tecnologico

| Livello | Scelta |
|---|---|
| Framework UI | Vue 3 (Composition API + `<script setup>`) |
| Linguaggio | TypeScript (strict mode) |
| Build tool | Vite |
| State management | Pinia |
| Routing | Vue Router 4 |
| Stili | SCSS con CSS custom properties design system |
| Client HTTP | Axios |
| Testing | Vitest + Vue Test Utils |

---

## Installazione e avvio

### Prerequisiti

- Node.js ≥ 18
- npm ≥ 9

### Installazione

```sh
git clone https://github.com/<your-username>/poke-market.git
cd poke-market
npm install
```

### Server di sviluppo

```sh
npm run dev
```

Apri [http://localhost:5173](http://localhost:5173) nel browser.

### Verifica dei tipi

```sh
npm run type-check
```

### Build di produzione

```sh
npm run build
```

L'output viene generato nella cartella `dist/`. Per visualizzarlo in anteprima:

```sh
npm run preview
```

### Test unitari

```sh
npm run test:unit
```

### Lint e formattazione

```sh
npm run lint     # ESLint + oxlint (con auto-fix)
npm run format   # Prettier
```

---

## Struttura del progetto

```
src/
├── assets/styles/       # Design system SCSS (_variables, _mixins, _reset)
├── components/
│   ├── layout/          # AppHeader
│   ├── pokemon/         # PokemonCard, PokemonGrid, PokemonTypeFilter, PokemonPagination
│   └── ui/              # LoadingSpinner, ErrorMessage, TypeBadge
├── composables/
│   └── useTheme.ts      # Toggle tema chiaro/scuro
├── router/index.ts      # Route + guard di autenticazione beforeEach
├── services/            # pokeApi.ts, authApi.ts (wrapper Axios)
├── stores/              # auth, cart, wishlist, pokemon (Pinia)
├── types/pokemon.ts     # Interfacce TypeScript
├── utils/
│   ├── apiError.ts      # Converte gli errori Axios in messaggi leggibili
│   └── priceCalculator.ts
└── views/               # HomeView, PokemonDetailView, LoginView, CartView, WishlistView
```

---

## Formula del prezzo

```ts
price = Math.round(totalBaseStats × 0.15)
// totalBaseStats = HP + ATK + DEF + SpATK + SpDEF + SPD
// Range: ~€45 (Pokémon deboli) — €105+ (leggendari)
```

---

## Credenziali demo

| Campo | Valore |
|---|---|
| Username | `johnd` |
| Password | `m38rmF$` |

Fornite da [Fake Store API](https://fakestoreapi.com/docs#tag/user/operation/LoginUser).

---

## Utilizzo dell'IA

Questo progetto è stato sviluppato con il supporto di **GitHub Copilot (Claude Sonnet 4.6)** in modalità agente all'interno di VS Code.

### Come è stata utilizzata

- **Architettura e pianificazione**: la struttura iniziale del progetto, la strategia di routing, il design degli store Pinia e il piano di integrazione delle API sono stati definiti insieme all'IA a partire dalla richiesta.
- **Generazione del codice**: componenti, store, servizi e SCSS sono stati generati fase per fase seguendo il piano di sviluppo scelto. Ogni fase è stata revisionata prima di passare alla successiva.
- **Refactoring e correzioni**: l'IA ha proposto miglioramenti (es. utility `getApiErrorMessage`, easing spring per le animazioni, composable `useTheme`) che sono stati valutati e accettati o modificati.
- **Scrittura dei test**: i test unitari per `priceCalculator.ts` e `PokemonCard.vue` sono stati generati ed eseguiti immediatamente per verificarne la correttezza.

### Come è stato validato l'output

- Ogni file generato è stato letto e revisionato prima di essere committato.
- `npm run type-check` è stato eseguito dopo ogni fase per intercettare errori TypeScript tempestivamente.
- `npm run build` è stato utilizzato per verificare che il bundle di produzione fosse privo di errori.
- `npm run test:unit` conferma che tutti i 22 test passano.
- L'app in esecuzione è stata testata manualmente nel browser: griglia, filtri, deep link, flusso di autenticazione, contatore carrello, toggle tema e layout responsive su più viewport.

