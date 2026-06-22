# Stan wdrożenia: Shopify Integrator
> Aktualizacja: 2026-06-22

## Gdzie jesteśmy: Etap 5/6

Aplikacja jest w pełni funkcjonalna w trybie **read + CSV export**.
Brakuje Etapu 6 — zapisu danych do Shopify przez API i persystencji stanu.

---

## ZROBIONE ✅

### Infrastruktura
- Next.js + shadcn (preset bIkf1TW), Tailwind, Zustand, TanStack Table, Vitest
- Pełna struktura: app/, components/, modules/, services/, stores/, config/, lib/, types/
- Sidebar z nawigacją (Dashboard / Sync Queue / Logs)

### PIM Connector (Beautifly API)
- `services/beautifly.ts` — fetchAllProducts (limit=500, paginacja po last_page), fetchProduct, searchProducts
- `modules/pim/normalize.ts` — Beautifly → NormalizedProduct (title, media, ceny, atrybuty, kategorie)
- `app/api/pim/route.ts` — proxy endpoint

### Shopify Connector
- `services/shopify.ts` — GraphQL client z retry 429, cursor pagination, fetchAllShopifyProducts, fetchShopifyProduct
- `modules/shopify/normalize.ts` — Shopify → NormalizedProduct
- `app/api/shopify/route.ts` — endpoint
- `app/api/shopify/categories/route.ts` — 145 kategorii z Shopify taxonomy (revalidate 1h)
- `app/api/shopify/categories/search/route.ts` — live search po pełnej taksonomii Shopify (26k+ kategorii)
- `config/category-rules.ts` — reguły auto-sugestii kategorii (9 reguł, zwalidowane vs Shopify taxonomy)

### Diff Engine
- `modules/diff/diffProduct.ts` — diffProduct(pim, shopify) → status (new/changed/unchanged/removed) + hash SHA256
- `modules/diff/syncState.ts` — SyncedProduct model
- `config/field-map.ts` — mapowanie 13 pól (title, price, images, tags, vendor, SEO…)
- `modules/diff/diffProduct.test.ts` — 6 testów vitest

### UI Dashboard
- `app/dashboard/page.tsx` — metryki (Łącznie/Nowe/Zmienione/Wymaga decyzji) + tabela produktów
- `app/dashboard/[id]/page.tsx` — szczegóły produktu, taby (Dane produktu / Shopify)
- 3-poziomowa selekcja (Zustand `stores/selection.ts`):
  - Poziom 1: checkbox "zaznacz wszystkie"
  - Poziom 2: checkbox per produkt w tabeli
  - Poziom 3: switch per pole w detail view
- `components/diff-table.tsx` — wyszukiwanie po nazwie/EAN/model, filtr statusu, sortowanie kolumn
- `components/product-category-selector.tsx` — sugestie z CATEGORY_RULES + live search Shopify taxonomy
- `stores/shopify-taxonomy.ts` — współdzielony store kategorii (ładuje raz, waliduje sugestie)

### CSV Export
- `modules/sync/buildCsvPayload.ts` — CSV z 64 kolumnami (format Shopify product import)
- `app/api/export/csv/route.ts` — POST endpoint
- `components/export-csv-button.tsx` — respektuje selekcję pól (3. poziom)

---

## BRAKUJE ❌

### 1. Matchowanie PIM ↔ Shopify (priorytet 1)
- Wszystkie produkty PIM traktowane jako "nowe" — `diffProduct(pim, null)`
- Brak logiki: znajdź istniejący Shopify produkt po EAN lub SKU → przekaż jako drugi arg do diffProduct
- Diff viewer działa poprawnie, ale zawsze porównuje vs null (brak danych Shopify)

### 2. Push to Shopify API (priorytet 2)
- Brak `modules/sync/executeSync.ts` — GraphQL mutations do Shopify
- Potrzebne mutacje: `productUpdate`, `variantUpdate`, `metafieldsSet`, `productCreateMedia`
- `app/sync-queue/page.tsx` — placeholder bez logiki

### 3. Baza danych i persystencja (priorytet 3)
- Brak SQLite/PostgreSQL + Prisma/Drizzle
- Stan selekcji i kategorii resetuje się po odświeżeniu strony
- `app/logs/page.tsx` — placeholder bez danych
- Brak historii synchronizacji (kiedy, co, wynik)
- Schemat do dodania: `SyncHistory`, `SyncedProduct`, `SyncLog`

### 4. Walidacja przed eksportem (priorytet 4)
- CSV generuje się bez sprawdzenia wymaganych pól
- Brak alertu "Brakuje: Title, Price, …" przed pobraniem pliku

---

## KOLEJNOŚĆ IMPLEMENTACJI (Etap 6)

### Krok 1 — Matchowanie PIM ↔ Shopify
Odblokuje prawdziwy diff (zmienione vs nowe vs takie same).

```
1. GET /api/shopify → fetchAllShopifyProducts() (już istnieje)
2. Zbuduj mapę: EAN → ShopifyProduct (lub SKU jako fallback)
3. W dashboard/page.tsx: dla każdego PIM produktu znajdź odpowiednik Shopify
4. Przekaż do diffProduct(pim, shopifyMatch ?? null)
```

Pliki do zmiany: `app/dashboard/page.tsx`, `app/dashboard/[id]/page.tsx`

### Krok 2 — Push to Shopify API
```
1. Nowy plik: modules/sync/executeSync.ts
   - przyjmuje: NormalizedProduct + Set<fieldKey> + shopifyGid
   - wywołuje: productUpdate mutation (title, descriptionHtml, tags, vendor, productType)
   - wywołuje: variantUpdate mutation (price, compareAtPrice, barcode, weight, inventoryQty)
   - zwraca: { success, errors }
2. Nowy endpoint: POST /api/sync/product
3. Podłączyć do sync-queue page z listą zaznaczonych produktów
```

### Krok 3 — Baza danych (SQLite + Prisma)
```
schema.prisma:
  model SyncHistory {
    id          String   @id @default(cuid())
    pimId       String
    shopifyId   String?
    fields      String   // JSON array of synced fields
    channel     String   // "csv" | "api"
    status      String   // "success" | "error"
    createdAt   DateTime @default(now())
  }
  model SyncLog {
    id        String   @id @default(cuid())
    level     String   // "info" | "warning" | "error"
    message   String
    context   String?  // JSON
    createdAt DateTime @default(now())
  }
```

### Krok 4 — Walidacja
- Przed generowaniem CSV: sprawdź wymagane pola (title, price, SKU)
- Wyświetl listę brakujących danych zamiast cicho pomijać

---

## Pliki STABILNE (nie ruszać bez powodu)
```
services/beautifly.ts
services/shopify.ts
modules/pim/normalize.ts
modules/shopify/normalize.ts
modules/diff/diffProduct.ts
modules/diff/syncState.ts
modules/sync/buildCsvPayload.ts
config/field-map.ts
config/category-rules.ts
lib/suggest-category.ts
lib/shopify-id.ts
types/product.ts
```
