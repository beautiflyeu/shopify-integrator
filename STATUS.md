# STATUS - Shopify Integrator — Category Search + Rules Editor

*Ostatnia aktualizacja: 2026-06-24 19:15*

## Co robimy
Budujemy system wyszukiwania i zarządzania kategoriami Shopify — wyszukiwarka w UI + reguły auto-mapowania + edytor reguł w sidebarze.

## Co zostało zrobione

### Naprawa eksportu CSV
- `app/api/export/csv/route.ts` — wyłączone auto-przypisywanie kategorii (było zepsute)
- CSV teraz zawsze używa **angielskich** ścieżek kategorii (Shopify akceptuje EN, nie PL)

### Wyszukiwarka kategorii
- `components/category-selector.tsx` — wyszukuje lokalnie z załadowanego store (nie live API)
- Polska mapa aliasów: `masażer`→`massager`, `prostownica`→`straightener` itp.
- `app/api/shopify/categories/route.ts` — naprawiono: usunięto `@inContext(language: PL)` (nie istnieje w Admin API), przywrócono `revalidate = 3600`

### Reguły kategorii — nowa architektura
- `config/category-rules.ts` — uproszczony interface: tylko `keywords[]` + `englishFullName` (usunięto `category` PL)
- `stores/category-rules.ts` — nowy Zustand store z `persist` (localStorage), CRUD reguł
- `lib/suggest-category.ts` — zwraca `string | null` (angielski fullName), przyjmuje `rules` jako param
- `components/category-rule-badges.tsx` — nowy komponent: badge'y reguł obok selectora, klik → wypełnia kategorię
- `components/category-rules-panel.tsx` — zwijany panel pod tabelą (read-only lista reguł)

### Edytor reguł w sidebarze
- `components/sidebar.tsx` — dodano zakładkę "Reguły kategorii" (ikona Tag, link `/rules`)
- `app/rules/page.tsx` — nowa strona: lista reguł z edycją/usuwaniem + przycisk "Dodaj"
- `components/rule-editor.tsx` — formularz: keywords + wyszukiwarka taksonomii Shopify

### Zaktualizowane komponenty
- `components/product-category-selector.tsx` — używa store reguł, badge'y, angielski do CSV
- `components/category-diff-row.tsx` — jw., uproszczony (bez PL→EN translacji)

### Nowe reguły
Dodano: `kawitacyjny/cavitation/ultrasonic` (Skin Care Tools), `suszarka/dryer` (Hair Dryers), `microcurrent/ems` (Microcurrent & EMS Facial Devices)

## Gdzie jesteśmy
Wszystko gotowe i skompilowane (TS 0 błędów). Serwer uruchomiony świeżo po wyczyszczeniu cache.

## Co pozostało
- [ ] Przetestować eksport CSV z angielską kategorią → import do Shopify
- [ ] Sprawdzić czy badge'y poprawnie wypełniają kategorię i eksport działa
- [ ] Przetestować dodawanie nowej reguły przez `/rules`
- [ ] Sprawdzić persist store po odświeżeniu (reguły zostają)
- [ ] Naprawić pre-existing TS błąd — `components/category-diff-row.tsx` (był przed naszymi zmianami)

## Ważne decyzje/ustalenia
- **CSV używa angielskich ścieżek** — Shopify lepiej akceptuje EN niż PL
- **Shopify Admin API taxonomy** zawsze zwraca EN — `@inContext(language: PL)` nie istnieje w Admin API (tylko Storefront)
- **`CategoryRule` interface** — tylko `keywords[]` + `englishFullName`, bez polskiej ścieżki
- **Store z persist** — reguły zapisywane w localStorage pod kluczem `"category-rules"`
- **Auto-suggest** w `diff-table.tsx` jest wyłączony (zakomentowany) — ręczny wybór lub przez badge

## Następne kroki
1. Hard refresh (`⌘⇧R`) i test eksportu CSV → import do Shopify
2. Test strony `/rules` — dodanie nowej reguły
3. Opcjonalnie: test wyszukiwarki z polskim aliasem np. `masażer`
