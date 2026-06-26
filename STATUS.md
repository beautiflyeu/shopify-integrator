# STATUS - Shopify Integrator — Pełna przebudowa + widok porównawczy

*Ostatnia aktualizacja: 2026-06-26 09:30*

## Co robimy
Budujemy lokalny dashboard do synchronizacji produktów PIM Beautifly → Shopify.
W tej sesji przebudowaliśmy całą architekturę danych i widok produktu.

## Co zostało zrobione

### SQLite (zastąpiono JSON flat files)
- `lib/db.ts` (NOWY) — singleton `better-sqlite3`, tabele: `exported_products`, `field_selections`, `settings`, auto-migracja z JSON
- `lib/exported-products-db.ts` (NOWY) — zastępuje `lib/exported-products-file.ts`
- `lib/field-selections-db.ts` (NOWY) — CRUD per-produkt selekcji pól
- `data/app.db` — baza SQLite gotowa, 22 wpisy zmigrowały automatycznie z JSON
- `next.config.ts` — dodano `serverExternalPackages: ["better-sqlite3"]`
- `package.json` — dodano `better-sqlite3` + `@types/better-sqlite3`

### API routes — przełączone na SQLite
- `app/api/exported-products/route.ts`
- `app/api/export/csv/route.ts`
- `app/api/shopify/import-status/route.ts`
- `app/api/sync/products/route.ts`
- `app/api/category-rules/route.ts` — używa `settings` tabeli
- `app/api/field-selections/[id]/route.ts` (NOWY) — GET/PUT selekcji pól per produkt

### Uproszczenie UI
- `components/dashboard-header.tsx` — usunięto "Synchronizuj zaznaczone" (API sync), dodano "Eksportuj kolejkę (N)"
- `components/diff-table.tsx` — dwie niezależne ikony: Upload (eksportowano CSV) + Shopify SVG (potwierdzony EAN)

### Nowy widok produktu: side-by-side porównanie
- `components/product-comparison-view.tsx` (NOWY) — 5 kolumn:
  - `Pole PIM | Wartość PIM | Pole Shopify | Wartość Shopify | Sync?`
  - PIM po lewej, Shopify po prawej
  - Każda etykieta pola: dwie linie — nazwa PL + techniczny klucz (`description` / `descriptionHtml`)
  - Kolory wierszy: pomarańczowy=zmienione, niebieski=tylko PIM, zielona kropka=OK
  - Miniatury zdjęć 40×40px z hover podglądem 200×200px
  - Double-click na "Porównanie pól" → zaznacza/odznacza wszystkie zmienione pola
  - Checkboxy per pole zapisują się do SQLite (persystują po odświeżeniu)
  - Sekcja "Dane PIM" pod tabelą: familie, kategorie, atrybuty, parametry
- `app/dashboard/[id]/page.tsx` — przebudowany: bez zakładek, używa `ProductComparisonView`

### Kolejka eksportu
- `stores/export-queue.ts` (NOWY) — Zustand + localStorage persist (żyje między sesjami)
- Widok produktu: przycisk `+ Dodaj do kolejki` / `✓ W kolejce` obok "Eksportuj CSV"
- Dashboard header: `Eksportuj kolejkę (N)` pojawia się gdy kolejka niepusta

## Gdzie jesteśmy
Wszystkie zaplanowane funkcje zaimplementowane. TypeScript 0 błędów. Serwer startuje, strona produktu 206 renderuje się z danymi z PIM + Shopify (widać preload obrazków Shopify CDN).

## Co pozostało
- [ ] Przetestować wizualnie w przeglądarce — sprawdzić 5-kolumnową tabelę, kolory diff, hover miniaturek
- [ ] Sprawdzić double-click na "Porównanie pól" — czy zaznacza zmienione pola
- [ ] Sprawdzić kolejkę eksportu — dodać produkt → odświeżyć → czy zostaje
- [ ] Sprawdzić "Eksportuj kolejkę" w dashboardzie
- [ ] Sprawdzić czy selekcja pól persystuje po odświeżeniu (SQLite)

## Ważne decyzje/ustalenia
- **SQLite**: `data/app.db`, biblioteka `better-sqlite3` (synchroniczna), `serverExternalPackages` w next.config
- **Migracja JSON→SQLite**: automatyczna przy pierwszym uruchomieniu, stare pliki → `.migrated`
- **API sync ("Synchronizuj zaznaczone")**: usunięte z UI, kod route.ts pozostaje
- **Diff kolory wierszy**: pomarańczowy=zmienione, niebieski=tylko PIM, szary=tylko Shopify
- **Ikony w tabeli**: Upload icon = eksportowano CSV; Shopify SVG = potwierdzony przez EAN
- **Selekcja pól**: persystowana per-produkt w `field_selections` SQLite
- **Kolejka eksportu**: `stores/export-queue.ts`, Zustand + localStorage key `"export-queue"`
- **Category rules**: `settings` tabela SQLite (key="category-rules"), fallback do defaults gdy brak
- **5 kolumn w tabeli**: `Pole PIM | Wartość PIM | Pole Shopify | Wartość Shopify | Sync?`
- **Double-click**: na nagłówku "Porównanie pól" → toggle zaznaczenia wszystkich zmienionych pól

## Następne kroki
1. Otworzyć `http://localhost:3000/dashboard` w przeglądarce
2. Kliknąć w produkt z shopifyId (np. 206) → sprawdzić side-by-side widok
3. Double-click na "Porównanie pól" → potwierdzić zaznaczanie zmienionych
4. "Dodaj do kolejki" → odświeżyć → potwierdzić persistencję
5. Wrócić do dashboardu → sprawdzić przycisk "Eksportuj kolejkę (1)"
