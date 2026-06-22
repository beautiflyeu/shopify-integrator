# STATUS - Shopify Integrator

*Ostatnia aktualizacja: 2026-06-22 17:30*

## Co robimy
Budujemy lokalne narzędzie do synchronizacji produktów między Beautifly PIM API a Shopify. Aplikacja pozwala przeglądać różnice, zaznaczać pola i eksportować CSV do Shopify lub pushować przez API.

## Co zostało zrobione

### W tej sesji (2026-06-22):
- **`services/beautifly.ts`** — poprawiono `fetchAllProducts`: dodano `limit=500`, paginacja przez `meta.last_page` / `meta.current_page` (1 request dla 226 produktów)
- **`config/category-rules.ts`** — naprawiono WSZYSTKIE 9 ścieżek kategorii (były błędne w Shopify taxonomy):
  - Masażery: `Health & Beauty > Personal Care > Massage & Relaxation > Massagers`
  - Urządzenia skin care: `Cosmetics > Cosmetic Tools > Skin Care Tools`
  - LED: `Skin Care Tools > LED Light Therapy Devices`
  - Prostownice: `Hair Styling Tools > Hair Straighteners`
  - Spinki/klamry: `Apparel & Accessories > Clothing Accessories > Hair Accessories > Hair Pins, Claws & Clips`
- **`app/api/shopify/categories/route.ts`** — zwraca 145 kategorii (via search po terminach) zamiast 26 root
- **`app/api/shopify/categories/search/route.ts`** — NOWY: live search po pełnej taksonomii Shopify (26k+), min 2 znaki
- **`components/category-selector.tsx`** — przepisano na live search do API (debounce 300ms + AbortController) zamiast filtrowania lokalnego
- **`components/product-category-selector.tsx`** — uproszczono, usunieto props `allCategories`
- **`stores/shopify-taxonomy.ts`** — NOWY: współdzielony Zustand store (ładuje raz, trzyma `fullNameSet` do walidacji sugestii)
- **`INSTRUCTION/plan_kontynuacja.md`** — zapisany pełny audyt stanu wdrożenia

### Z poprzednich sesji:
- Switche Synchronizuj/Pomiń per pole + globalny switch
- CSV export z 64 kolumnami (format Shopify import)
- Dashboard + detail view produktu, 3-poziomowa selekcja (katalog → produkt → pole)
- Diff engine z SHA256 hash, vitest testy
- Shopify connector (GraphQL, retry 429, cursor pagination)

## Gdzie jesteśmy
Aplikacja jest na **Etapie 5/6** wg specyfikacji (`INSTRUCTION/plan_kontynuacja.md`). Tryb read + CSV export działa w pełni. Kategorie Shopify są poprawne i przeszukiwalne po całej taksonomii.

Główny brakujący element: **matchowanie PIM ↔ Shopify** — teraz `diffProduct(pim, null)` dla każdego produktu (wszystkie widoczne jako "nowe").

## Co pozostało
- [ ] **Priorytet 1:** Matchowanie PIM ↔ Shopify po EAN — fetch Shopify products → mapa EAN→produkt → przekaż do `diffProduct(pim, shopifyMatch)` (pliki: `app/dashboard/page.tsx`, `app/dashboard/[id]/page.tsx`)
- [ ] **Priorytet 2:** Push to Shopify API — `modules/sync/executeSync.ts` z mutacjami `productUpdate`, `variantUpdate`, `metafieldsSet`
- [ ] **Priorytet 3:** Baza danych SQLite + Prisma — schemat `SyncHistory`, `SyncLog`, persystencja stanu między sesjami
- [ ] **Priorytet 4:** Walidacja przed CSV export (alert o brakujących polach)
- [ ] Wypełnić placeholder pages: `app/sync-queue/page.tsx`, `app/logs/page.tsx`

## Ważne decyzje/ustalenia
- Beautifly API: `?limit=500` — 1 request dla 226 produktów, paginacja przez `meta.last_page`
- Kategorie Shopify: GraphQL `taxonomy { categories(search: "...") }` — wyszukiwanie po fullName
- Sugestie kategorii walidowane vs rzeczywista taksonomia (nie pokażą się jeśli string nie pasuje)
- `useTaxonomyStore` → ładuje `/api/shopify/categories` (145 pozycji) raz na sesję
- Live search = `/api/shopify/categories/search?q=` — pełna taksonomia, min 2 znaki, max 50 wyników
- Matchowanie PIM ↔ Shopify po **EAN** (nie SKU — null w Shopify)
- `SHOP_DOMAIN=beautifly-pl.myshopify.com`
- Brak bazy danych — stan synchronizacji obliczany na żywo

## Następne kroki
1. Zaimplementować matchowanie PIM ↔ Shopify w `app/dashboard/page.tsx` (fetch Shopify → mapa EAN → diffProduct z drugim argumentem)
2. Napisać `modules/sync/executeSync.ts` z GraphQL mutations do Shopify
3. Dodać Prisma + SQLite dla historii synca i logów
