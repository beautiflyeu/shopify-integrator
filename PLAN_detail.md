# Plan implementacji: Shopify Integrator

## Context

Design aplikacji jest gotowy w `pencil-new.pen` (4 ekrany, 11 komponentów, shadcn neutral theme). Repozytorium nie ma jeszcze żadnego kodu — tylko dokumenty planowania. Teraz przechodzimy z fazy design → faza implementacji, ściśle według 6-etapowego roadmapu z `/PLAN/`.

**Kluczowa zasada:** etap 06 (zapis do Shopify) realizujemy jako ostatni — 01–05 są read-only.

---

## Jak design (Pencil) mapuje się na plan (PLAN/)

| Pencil Screen | PLAN Stage | Kiedy gotowe |
|---|---|---|
| Sidebar + nawigacja | **01** scaffolding | Po etapie 01 |
| Dashboard — tabela PIM (lista produktów) | **02** PIM connector | Po etapie 02 |
| Dashboard — kolumna Shopify + metryki | **03** Shopify connector | Po etapie 03 |
| Dashboard — badge statusu, kolumna "Pola zmienione" | **04** diff engine | Po etapie 04 |
| Dashboard + Product Detail — checkboxy, Field Toggle, selekcja 3-poziomowa | **05** UI diff dashboard | Po etapie 05 |
| Sync Queue + Logs — realne dane | **06** sync execution | Po etapie 06 |

**Stage 01–04 = fundament danych. Stage 05 = Pencil design ożywa z prawdziwymi danymi.**

---

## Etap 01 — Scaffolding (start od razu)

**Cel:** Działająca pusta Next.js app + shadcn + struktura katalogów.

### Kroki
1. `npx shadcn@latest init --preset bIkf1TW --template next --pointer`
2. Utworzenie struktury katalogów: `app/`, `components/`, `modules/pim|shopify|diff|sync/`, `services/`, `stores/`, `types/`, `config/`, `lib/`, `docs/`
3. `types/product.ts` — definicja `SyncedProduct` + `NormalizedProduct`
4. `.env.local` z placeholderami: `BEAUTIFLY_API_KEY`, `SHOP_DOMAIN`, `SHOPIFY_ACCESS_TOKEN`, `SHOPIFY_API_VERSION`
5. Dodanie layoutu aplikacji: Sidebar komponent + nawigacja (Dashboard / Sync Queue / Logs / Ustawienia) — zgodnie z Pencil

### Pliki do stworzenia
```
types/product.ts
app/layout.tsx            ← sidebar nav
app/page.tsx              ← redirect → /dashboard
components/sidebar.tsx    ← nav sidebar z Pencil
.env.local
```

**Kryterium zakończenia:** `npm run dev` startuje, sidebar widoczny, routing działa.

---

## Etap 02 — PIM Connector

**Cel:** Lista produktów z Beautifly w tabeli (read-only, bez Shopify).

### Kroki
1. `services/beautifly.ts`:
   - `fetchAllProducts(lang)` — paginacja `?page=N` do `meta.total`
   - `fetchProduct(id, opts)` — pełne dane z `include`
   - `searchProducts(list, query)` — filtrowanie lokalne po name/SKU
2. `modules/pim/normalize.ts` — mapowanie Beautifly → `NormalizedProduct`
3. `app/dashboard/page.tsx` — Server Component fetchujący i przekazujący dane
4. `components/products-table.tsx` — TanStack Table, kolumny: Produkt/SKU/Status

### Pliki do stworzenia
```
services/beautifly.ts
modules/pim/normalize.ts
app/dashboard/page.tsx
app/api/pim/route.ts
components/products-table.tsx
components/search-input.tsx
```

**Kryterium zakończenia:** Tabela renderuje produkty z PIM, search po nazwie/SKU działa lokalnie.

---

## Etap 03 — Shopify Connector

**Cel:** Lista produktów z Shopify (read-only, cursor pagination).

### Kroki
1. `services/shopify.ts` — GraphQL client z retry/backoff na 429, odczyt kosztu z `extensions`
2. `modules/shopify/normalize.ts` — mapowanie Shopify → `NormalizedProduct`
3. `lib/shopify-id.ts` — `extractId()` / `buildGid()` (numeric ↔ `gid://shopify/Product/{id}`)
4. Rozszerzenie tabeli dashboardu o kolumnę "Shopify" obok "PIM"

### Pliki do stworzenia
```
services/shopify.ts
modules/shopify/normalize.ts
lib/shopify-id.ts
app/api/shopify/route.ts
```

**Kryterium zakończenia:** Tabela pokazuje produkty z obu źródeł, paginacja cursor-based działa.

---

## Etap 04 — Diff Engine

**Cel:** Funkcja `diffProduct()` zwracająca różnice per pole + status rekordu.

### Kroki
1. `config/field-map.ts` — tabela mapowań: pole Beautifly → kolumna `product_template.csv` → pole Shopify Admin API
2. `modules/diff/diffProduct.ts`:
   ```typescript
   diffProduct(pim: NormalizedProduct, shopify: NormalizedProduct | null)
   // zwraca: { fields: Record<string, 'new'|'changed'|'removed'|'unchanged'>, hash: string, status: ProductStatus }
   ```
3. `modules/diff/syncState.ts` — zarządzanie stanem `SyncedProduct` (`pim_id`, `shopify_id`, `last_synced_hash`, `last_synced_at`, `status`)
4. Testy jednostkowe: "The Band T-Shirt" z `product_template.csv` — zmiana ceny nie flaguje innych pól
5. Dashboard — badge statusu i licznik "Pola zmienione" zasilone prawdziwymi danymi z `diffProduct()`

### Pliki do stworzenia
```
config/field-map.ts
modules/diff/diffProduct.ts
modules/diff/syncState.ts
modules/diff/diffProduct.test.ts
```

**Kryterium zakończenia:** `diffProduct()` poprawnie wykrywa zmianę pojedynczego pola, testy przechodzą.

---

## Etap 05 — UI Diff Dashboard (Pencil design → kod)

**Cel:** Pełne UI z Pencil — 3-poziomowa selekcja, diff per pole, wszystkie ekrany.

### Mapowanie Pencil → kod

**Dashboard (`app/dashboard/page.tsx`)**
- Metryki nowe/zmienione/usunięte/wymaga decyzji — z wyników `diffProduct()`
- `components/status-badge.tsx` — Badge z kolorami semantycznymi (warning/info/error)
- `components/diff-table.tsx` — TanStack Table + checkboxy (selekcja poziom 2: per produkt)
- `stores/selection.ts` (Zustand) — stan zaznaczeń 3-poziomowy
- Checkbox "zaznacz wszystko" — selekcja poziom 1 (cały katalog)
- Filtry statusów: Wszystkie / Nowe / Zmienione / Usunięte

**Product Detail (`app/dashboard/[id]/page.tsx`)**
- Tabela pole-po-polu z wynikami `diffProduct()`
- `components/field-toggle.tsx` — ToggleGroup "Pomiń / Synchronizuj" per pole (selekcja poziom 3)
- Breadcrumb: Dashboard → Nazwa produktu
- Summary bar: "Wybrano X z Y pól do synchronizacji"

**Sync Queue (`app/sync-queue/page.tsx`)** — placeholder tabela (dane mock, logika w etapie 06)

**Logs (`app/logs/page.tsx`)** — placeholder lista (dane mock, logika w etapie 06)

### Pliki do stworzenia / rozszerzenia
```
stores/selection.ts            ← Zustand, 3-level selection state
components/status-badge.tsx    ← Badge z semantic colors
components/diff-table.tsx      ← TanStack Table + selekcja checkboxami
components/field-diff-row.tsx  ← wiersz: Pole | Wartość PIM | Wartość Shopify | Toggle
components/field-toggle.tsx    ← ToggleGroup accept/reject per pole
components/metric-card.tsx     ← karty liczników na górze dashboardu
app/dashboard/[id]/page.tsx    ← Product Detail
app/sync-queue/page.tsx        ← Sync Queue placeholder
app/logs/page.tsx              ← Logs placeholder
```

### shadcn — ważne przed etapem 05
Przed użyciem `Select`, `ToggleGroup`, `Slider`, `Accordion` sprawdzić wariant:
```bash
npx shadcn@latest info
```
Wariant `base` i `radix` mają różne API dla tych komponentów.

**Kryterium zakończenia:** User widzi listę produktów z diffem, wchodzi w szczegóły produktu, zaznacza dowolny podzbiór pól. Żadne dane nie są wysyłane do Shopify.

---

## Etap 06 — Sync Execution (ostatni, jedyny z zapisem)

Realizujemy dopiero po przetestowaniu 01–05.

### Pliki do stworzenia
```
modules/sync/buildPayload.ts   ← selekcja + diff → payload Shopify
modules/sync/executeSync.ts    ← productUpdate + metafieldsSet mutations
```

Obsługuje 3 tryby: sync all / sync selected products / sync selected fields.
Po syncu aktualizuje `last_synced_hash`, `last_synced_at`, `status → unchanged`.
Błędy częściowe widoczne w Logs. Historia synca zasila Sync Queue i Logs realnymi danymi.

---

## Weryfikacja end-to-end

Po każdym etapie:
1. `npm run dev` — brak błędów TypeScript i w konsoli
2. Nawigacja do ekranu/endpointu zmienionego w danym etapie
3. **Etap 04:** `npm test` — testy `diffProduct()`
4. **Etap 05:** ręczne zaznaczenie produktów i pól, sprawdzenie stanu Zustand

---

## Kolejność wykonania (sesja po sesji)

```
Sesja 1 → Etap 01: scaffolding + sidebar + typy
Sesja 2 → Etap 02: PIM connector + tabela produktów
Sesja 3 → Etap 03: Shopify connector + porównanie list
Sesja 4 → Etap 04: diff engine + testy jednostkowe
Sesja 5 → Etap 05: pełne UI (Dashboard + Product Detail)
Sesja 6 → Etap 06: sync execution + historia
```
