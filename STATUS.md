# STATUS - Shopify Integrator — Kategorie + CSV + UI fixes

*Ostatnia aktualizacja: 2026-06-18 16:30*

## Co robimy
Budujemy narzędzie do synchronizacji produktów PIM (Beautifly) ↔ Shopify. W tej sesji: podłączyliśmy Shopify API, naprawiliśmy eksport CSV i zbudowaliśmy selector kategorii Shopify.

## Co zostało zrobione

### Shopify API ✅
- Token `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` działa — sklep `BeautiflyGlobal.eu`
- BF API ma 20 produktów — matchowanie z Shopify po **EAN (barcode)**, bo SKU jest null wszędzie
- Pole `main_details.title` = zawsze null → `name` = pełna nazwa marketingowa produktu
- `model` = krótki identyfikator (np. "SkinGlow PRO")

### CSV Export (`modules/sync/buildCsvPayload.ts`) ✅
- Nagłówki zgodne 1:1 z templatem Shopify (`INSTRUCTION/product_template.csv`)
- Dodane brakujące kolumny: `Option1/2/3 Linked To`, `Cost per item`, `Tax code`, `Unit price...`, `Google Shopping /...`
- Poprawiona kolejność: Weight przed Requires shipping
- Kolumna `Product category` wypełniana z categoryMap

### Kolory metryk (`components/metric-card.tsx`) ✅
- Łącznie → czarny, Nowe → zielony, Zmienione → fioletowy, Wymaga decyzji → niebieski

### UI tabeli (`components/diff-table.tsx`) ✅
- `line-clamp-2` na kolumnie "Nazwa produktu" — obcina długie nazwy z `...`

### Rozwijalne wartości (`components/field-diff-row.tsx`) ✅
- Wartości > 60 znaków mają przycisk `˅` do rozwinięcia pełnego tekstu

### Selektor kategorii Shopify ✅
- **`config/category-rules.ts`** — tabela keyword → kategoria (5-6 kategorii dla produktów Beautifly)
- **`lib/suggest-category.ts`** — scoring po słowach kluczowych, top 3 sugestie
- **`stores/category.ts`** — Zustand store: `productId → kategoria`
- **`app/api/shopify/categories/route.ts`** — endpoint pobierający taksonomię Shopify
- **`services/shopify-taxonomy.ts`** — helper do bezpośredniego fetcha GraphQL
- **`components/category-selector.tsx`** — combobox z useMemo + debounce 200ms + spinner
- **`components/product-category-selector.tsx`** — lazy fetch przy pierwszym otwarciu + auto-apply sugestii
- **`app/dashboard/[id]/page.tsx`** — selektor w zakładce Shopify (max-w-lg, nad tabelą)

## Gdzie jesteśmy
Selektor kategorii działa — lazy load przy pierwszym kliknięciu, sugestie auto-apply. Problem: każde wejście na stronę produktu robi nowy fetch (choć serwer cache'uje 1h).

## Co pozostało
- [ ] **Kategorie w Zustand store** — fetch raz na sesję zamiast per produkt (jeden wiersz w `stores/category.ts`)
- [ ] **`productType` w CSV** — teraz = `raw.name` (duplikat Title); zmienić na `raw.model` w `modules/pim/normalize.ts`
- [ ] **Shopify diff flow** — `fetchAllShopifyProducts()` + `normalizeShopifyProduct()` + `diffProduct()` — Wartość Shopify zawsze `—` bo diff.product = null
- [ ] **"Synchronizuj zaznaczone"** — `buildApiPayload.ts` + `executeSync.ts`
- [ ] **Sync Queue** (`app/sync-queue/page.tsx`) — placeholder
- [ ] **Logs** (`app/logs/page.tsx`) — placeholder

## Ważne decyzje/ustalenia
- **Brak Supabase** — flow: PIM → diff vs Shopify (bezpośrednio) → CSV/API → Shopify
- Matchowanie PIM ↔ Shopify po **EAN** (nie SKU — null wszędzie w Shopify)
- `productType` w CSV = duplikat `name` (powinno być `model`) — do poprawy
- Kategorie Shopify = Google Product Taxonomy przez Admin GraphQL API
- Kategorie: 5-6 unikalnych dla produktów Beautifly, keyword matching wystarczy (bez AI)
- `SHOP_DOMAIN=beautifly-pl.myshopify.com` ✅, `SHOPIFY_ACCESS_TOKEN=shpat_...` ✅, `BEAUTIFLY_API_KEY=29u8b7h1q2vuLQ0lTu5F` ✅

## Następne kroki
1. Przenieść kategorie do Zustand store (cache sesji) — `stores/category.ts`
2. Zmienić `productType` na `raw.model` w `modules/pim/normalize.ts`
3. Zaimplementować Shopify diff flow — zaczyna się od `fetchAllShopifyProducts()`
