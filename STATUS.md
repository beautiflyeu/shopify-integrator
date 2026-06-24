# STATUS - Shopify Integrator — Naprawa kategorii + weryfikacja kolekcji

*Ostatnia aktualizacja: 2026-06-24 15:30*

## Co robimy

Budujemy lokalne narzędzie do synchronizacji produktów między Beautifly PIM API a Shopify. W tej sesji naprawiliśmy problem z kategorią produktu (Shopify taxonomy) w eksporcie CSV oraz zweryfikowaliśmy dopasowanie kolekcji PIM → Shopify.

## Co zostało zrobione

### W tej sesji (2026-06-24)

**Bugfix — "nieprawidłowa kategoria" przy imporcie CSV:**
- `app/api/export/csv/route.ts` — dodano walidację `categoryMap` przez `fetchShopifyCategories()` przed budowaniem CSV; wartości nieistniejące w taksonomii Shopify są filtrowane (zamiast powodować błąd importu)
- `config/category-rules.ts` — **wszystkie category strings zamienione z angielskich na dokładne polskie `fullName` z Shopify Taxonomy API** (np. `"Health & Beauty > ..."` → `"Zdrowie i uroda > Higiena osobista > Kosmetyki > ..."`)

**Weryfikacja kolekcji PIM vs Shopify:**
- Pobrano families z PIM API: 29 unikalnych nazw
- Porównano z 29 kolekcjami w Shopify — **100% dopasowanie, identyczne nazwy**
- Sync API (`app/api/sync/products/route.ts`) poprawnie reużywa istniejące kolekcje przez `fetchCollectionByTitle()` — nie tworzy duplikatów

### Z poprzednich sesji

- Bugfix: "zaznacz wszystkie" nie trafiało do eksportu CSV
- Bugfix: kolumna "Product category" pusta w CSV (auto-uzupełnianie przez useEffect)
- Przycisk "Synchronizuj zaznaczone" — pełna implementacja
- `app/api/sync/products/route.ts` — endpoint sync z obsługą kolekcji i kategorii taksonomii
- `modules/sync/buildShopifyInput.ts` — buduje ProductInput dla GraphQL
- 29 kolekcji Shopify gotowych (manual, 0 produktów — czekają na sync)

## Gdzie jesteśmy

Naprawy gotowe, TypeScript clean (poza pre-existing błędem w `category-diff-row.tsx`). Gotowi do testowania end-to-end — CSV export Omnilight Pro powinien przejść bez błędu kategorii, sync API powinien ustawić kategorię taksonomii i kolekcję.

## Co pozostało

- [ ] **Przetestować CSV export Omnilight Pro** (id: 183) — sprawdzić czy "Product category" pojawia się po polsku i import do Shopify przechodzi bez błędu
- [ ] **Przetestować sync API** na Omnilight Pro — sprawdzić w Shopify Admin: produkt, kategoria taksonomii, kolekcja LIGHT THERAPY
- [ ] Naprawić pre-existing błąd TS — `components/category-diff-row.tsx:41` — `Property 'allCategories' does not exist on type CategorySelectorProps`
- [ ] Rozważyć zwiększenie limitu sync z 10 do więcej / progress bar

## Ważne decyzje/ustalenia

**Kategorie taksonomii — aktualne wartości w `category-rules.ts`:**
| Typ produktu | Polska kategoria Shopify |
|---|---|
| LED/light therapy | `Zdrowie i uroda > Higiena osobista > Kosmetyki > Akcesoria kosmetyczne > Akcesoria do pielęgnacji twarzy > Urządzenia do terapii światłem LED` |
| Hydrodermabrazja/peeling/darsonval/ion | `Zdrowie i uroda > Higiena osobista > Kosmetyki > Akcesoria kosmetyczne > Akcesoria do pielęgnacji twarzy` |
| Masażer/cellulite | `Zdrowie i uroda > Higiena osobista > Masaż i relaks > Masażery` |
| EMS/elektrostymulacja | `Zdrowie i uroda > Higiena osobista > Masaż i relaks > Masażery > Masażery elektryczne` |
| Prostownica | `Zdrowie i uroda > Higiena osobista > Pielęgnacja włosów > Narzędzia do stylizacji włosów > Prostownice do włosów` |
| Spinki/klamry/włosy | `Ubrania i akcesoria > Akcesoria do ubrań > Akcesoria do włosów > Szpilki, klamry i spinki do włosów` |
| Paznokcie | `Zdrowie i uroda > Higiena osobista > Kosmetyki > Pielęgnacja paznokci` |
| Mist/spray | `Zdrowie i uroda > Higiena osobista > Kosmetyki > Pielęgnacja skóry` |

**CSV vs Sync — różnice:**
| | Kategoria taksonomii | Kolekcja |
|---|---|---|
| CSV import | ✓ (fullName string) | ✗ niemożliwe w formacie CSV |
| Sync API | ✓ (przez GID) | ✓ (families z PIM → kolekcja Shopify) |

**Omnilight Pro (id: 183):**
- Family: `LIGHT THERAPY` → kolekcja "LIGHT THERAPY" w Shopify
- CSV Type: `"Panel do terapii światłem LED Beautifly OmniLight Pro"` (brak `main_details.title` w PIM — fallback na `name`)
- SKU: null w PIM — uwaga przy sync
- `SHOP_DOMAIN=beautifly-pl.myshopify.com`

**Manual collections rekomendowane** (nie smart collections) — 29 kolekcji już istnieje, sync API je reużywa, PIM families = źródło prawdy

## Problemy/blokery

- Pre-existing błąd TS w `components/category-diff-row.tsx:41` — nie blokuje dev server, blokuje `npx tsc --noEmit`
- Obrazy z Google Drive (`lh3.googleusercontent.com`) mogą być odrzucane przez Shopify przy sync API
- Omnilight Pro (id: 183) nie ma SKU w PIM — może wymagać uwagi przy sync

## Następne kroki

1. `npm run dev` → wyeksportuj Omnilight Pro do CSV → zaimportuj do Shopify → brak błędu kategorii
2. Sync API: zaznacz Omnilight Pro → "Synchronizuj zaznaczone" → sprawdź w Shopify Admin (produkt + kolekcja LIGHT THERAPY + kategoria taksonomii)
3. Po potwierdzeniu działania — zsynchronizuj całą rodzinę LIGHT THERAPY (13 produktów)
4. Napraw błąd TS w `category-diff-row.tsx`
