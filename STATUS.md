# STATUS - Shopify Integrator — Filtracja rodzin + UI Shopify

*Ostatnia aktualizacja: 2026-06-22 19:45*

## Co robimy
Budujemy lokalne narzędzie do synchronizacji produktów między Beautifly PIM API a Shopify. Aktualnie przebudowaliśmy UI dashboardu — dodano filtrację po rodzinach PIM i zmieniono domyślny widok produktu na zakładkę Shopify.

## Co zostało zrobione

### W tej sesji (2026-06-22):
- **Shopify MCP** — potwierdzono dostęp do sklepu BeautiflyGlobal.eu
- **Skanowanie PIM** — 226 produktów, 29 rodzin, `categories` = PUSTE (nie używać)
- **Odkrycie kodów** — 9 prefiksów (HA, DH, DE, NA, ME, EY, BE, FO, HAA) = akcesoria — każdy mapuje się na 1 rodzinę
- **Utworzono 29 kolekcji Shopify** (przez MCP) zgodnych 1:1 z rodzinami PIM
- **Usunięto wszystkie produkty** z Shopify (czysty start) — 0 produktów, 29 kolekcji
- **`docs/products-collections-map.md`** — tabela wszystkich 226 produktów PIM z rodzinami i statusem sync (⬜/✅)
- **UI przebudowa — 4 pliki zmienione:**
  - `services/beautifly.ts` — `BeautiflyProductListItem` ma `families?: Array<{id,name}>`, `fetchAllProducts` dodaje `include=families`
  - `components/diff-table.tsx` — `DiffTableRow` ma `family?: string | null`, scrollowalne pill-bary rodzin nad tabelą, logika filtrowania
  - `app/dashboard/page.tsx` — każdy wiersz ma `family: item.families?.[0]?.name ?? null`
  - `app/dashboard/[id]/page.tsx` — `<Tabs defaultValue="shopify">` (domyślna zakładka Shopify)

### Z poprzednich sesji:
- `services/beautifly.ts` — `fetchAllProducts` z `limit=500`, paginacja przez `meta.last_page`
- `config/category-rules.ts` — 9 ścieżek kategorii Shopify taxonomy
- Dashboard + detail view, 3-poziomowa selekcja, diff engine, CSV export (64 kolumny)
- Shopify connector (GraphQL, retry 429, cursor pagination)

## Gdzie jesteśmy
Wszystkie zmiany UI są wprowadzone. Aplikacja powinna pokazywać pill-bary 29 rodzin na górze dashboardu i otwierać produkty na zakładce Shopify. Dev server nie był uruchamiany do weryfikacji.

## Co pozostało
- [ ] **Uruchomić `npm run dev`** i zweryfikować: pill-bary rodzin działają, klik produktu = zakładka Shopify, CSV export działa
- [ ] **Naprawić pre-existing błąd TS** — `components/category-diff-row.tsx:41` — `Property 'allCategories' does not exist on type CategorySelectorProps` (nie blokuje dev server, ale blokuje `tsc --noEmit`)
- [ ] **Import produktów do Shopify** — przez CSV export z aplikacji (zaznacz produkty rodziny → exportuj → importuj w Shopify)
- [ ] **Aktualizacja `docs/products-collections-map.md`** — zmieniaj ⬜ → ✅ + Shopify ID po każdym imporcie
- [ ] **Matchowanie PIM ↔ Shopify po EAN** — do wdrożenia gdy Shopify będzie miał produkty
- [ ] **Push to Shopify API** — `modules/sync/executeSync.ts` z mutacjami `productUpdate`, `variantUpdate`, `metafieldsSet`

## Ważne decyzje/ustalenia
- **PIM `families`** = źródło prawdy dla kolekcji Shopify (29 rodzin). `categories` w API jest PUSTE — nie używać
- **Preferowany import**: CSV export z aplikacji lokalnej (więcej danych, 64 kolumny) — NIE MCP direct
- **Matchowanie PIM ↔ Shopify po EAN** (nie SKU — null w Shopify)
- **3 produkty bez rodziny**: SkinMist PRO (id:221), D'Arsonval Pro (id:222), IonSteam Balance (id:220)
- `SHOP_DOMAIN=beautifly-pl.myshopify.com`
- **`docs/products-collections-map.md`** = jedyne miejsce śledzenia statusu importu produktów
- **Sklep Shopify** = 0 produktów, 29 pustych kolekcji gotowych na import

## Problemy/blokery
- Pre-existing błąd TS w `components/category-diff-row.tsx:41` — `allCategories` prop nie istnieje w `CategorySelectorProps`. Nie blokuje dev server, ale blokuje `npx tsc --noEmit`. Wymaga naprawy.
- Obrazy z Google Drive (`lh3.googleusercontent.com`) nie są publicznie dostępne — Shopify odrzuca te URL-e cicho (featuredImageUrl: null). Produkty będą bez obrazów przez CSV import.

## Następne kroki
1. Uruchomić `npm run dev` → sprawdzić pill-bary rodzin + domyślna zakładka Shopify
2. Naprawić błąd TS w `category-diff-row.tsx`
3. Zaznaczyć produkty wybranej rodziny (np. LIGHT THERAPY) → wyeksportować CSV → zaimportować w Shopify admin
4. Po imporcie zaktualizować `docs/products-collections-map.md` (⬜ → ✅ + Shopify ID)
5. Użyć MCP do weryfikacji: które produkty z rodziny trafiły do kolekcji Shopify
