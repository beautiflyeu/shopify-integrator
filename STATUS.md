# STATUS - Shopify Integrator — CSV Export + UI fixes

*Ostatnia aktualizacja: 2026-06-24 16:30*

## Co robimy
Naprawiamy eksport CSV produktów z PIM Beautifly do Shopify — głównie kategorie produktów oraz drobne poprawki UI (wyszukiwarka, skrót ⌘K).

## Co zostało zrobione

### W tej sesji (2026-06-24 popołudnie)

**UI — wyszukiwarka:**
- `components/search-input.tsx` — `forwardRef`, badge `⌘ K` po prawej, placeholder znika przy fokusie
- `components/diff-table.tsx` — `useRef` + listener `keydown` (⌘K/Ctrl+K focusuje input)

**Eksport CSV — nazwa pliku:**
- `app/api/export/csv/route.ts` — dodano godzinę: `shopify-export-2026-06-24_103956.csv`

**Eksport CSV — kategorie:**
- `app/api/export/csv/route.ts` — **usunięto walidację** przez `fetchShopifyCategories()` (cicho kasowała kategorie gdy API rzucało błąd)
- `app/api/export/csv/route.ts` — dodano **UTF-8 BOM** (`﻿`) na początku CSV
- `config/category-rules.ts` — polskie ścieżki (verified przez Shopify GraphQL API via MCP)
- `components/diff-table.tsx` — usunięto guard `if (!current[row.id])` → auto-sugestia zawsze nadpisuje przy montowaniu

**Cache/serwer:**
- `.next` wyczyszczony, serwer zrestartowany świeżo

### Z poprzednich sesji
- Bugfix: "zaznacz wszystkie" nie trafiało do eksportu CSV
- Przycisk "Synchronizuj zaznaczone" — pełna implementacja
- `app/api/sync/products/route.ts` — endpoint sync z obsługą kolekcji i kategorii taksonomii
- 29 kolekcji Shopify gotowych (manual, czekają na sync)

## Gdzie jesteśmy
Serwer działa od nowa bez cache. Polskie ścieżki kategorii aktywne. Test (image #17) potwierdził że polskie kategorie SĄ akceptowane przez Shopify — preview dialog ich nie wyświetla (bug Shopify UI), ale produkt ma kategorię ustawioną po faktycznym imporcie.

## Co pozostało
- [ ] Przetestować eksport po hard refresh — sprawdzić czy CSV ma polskie kategorie i import przechodzi
- [ ] Opcjonalnie: dodać regułę dla suszarek do włosów (`suszarka`, `dryer`, `ionboost`)
- [ ] Naprawić pre-existing błąd TS — `components/category-diff-row.tsx:41`
- [ ] Rozważyć sync API test end-to-end (Omnilight Pro)

## Ważne decyzje/ustalenia
- **Sklep Shopify jest po POLSKU** — CSV wymaga polskich ścieżek kategorii (angielskie odrzucane z błędem)
- **Preview dialog Shopify** NIE pokazuje kategorii — to bug UI Shopify, nie błąd w kodzie. Sprawdzać produkt PO imporcie.
- **BOM** dodany do CSV żeby polskie znaki UTF-8 były poprawnie czytane
- **Auto-sugestia** zawsze nadpisuje przy każdym montowaniu — po hard refresh czysta

**Aktualne polskie fullName (verified):**
| Typ produktu | Kategoria Shopify |
|---|---|
| LED/light therapy | `Zdrowie i uroda > Higiena osobista > Kosmetyki > Akcesoria kosmetyczne > Akcesoria do pielęgnacji twarzy > Urządzenia do terapii światłem LED` |
| Hydrodermabrazja/peeling/darsonval | `Zdrowie i uroda > Higiena osobista > Kosmetyki > Akcesoria kosmetyczne > Akcesoria do pielęgnacji twarzy` |
| Masażer/cellulite | `Zdrowie i uroda > Higiena osobista > Masaż i relaks > Masażery` |
| EMS/elektrostymulacja | `Zdrowie i uroda > Higiena osobista > Masaż i relaks > Masażery > Masażery elektryczne` |
| Prostownica | `Zdrowie i uroda > Higiena osobista > Pielęgnacja włosów > Narzędzia do stylizacji włosów > Prostownice do włosów` |
| Spinki/klamry | `Ubrania i akcesoria > Akcesoria do ubrań > Akcesoria do włosów > Szpilki, klamry i spinki do włosów` |
| Paznokcie | `Zdrowie i uroda > Higiena osobista > Kosmetyki > Pielęgnacja paznokci` |
| Mist/spray | `Zdrowie i uroda > Higiena osobista > Kosmetyki > Pielęgnacja skóry` |

## Następne kroki
1. Hard refresh (`⌘⇧R`) w przeglądarce
2. Zaznaczyć produkt LED → eksport CSV → sprawdzić kolumnę `Product category`
3. Import do Shopify → sprawdzić produkt PO imporcie (nie preview)
4. Opcjonalnie: dodać keywords dla suszarek do włosów w `config/category-rules.ts`
