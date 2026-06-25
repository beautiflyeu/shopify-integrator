# STATUS - Shopify Integrator + Shopify Store Setup

*Ostatnia aktualizacja: 2026-06-24 13:30*

## Co robimy
Rozwijamy aplikację Shopify Integrator (lokalny diff/sync dashboard) oraz równolegle konfigurujemy sklep Shopify (kolekcje, metaobiekty, kategorie produktów).

## Co zostało zrobione

### Shopify Integrator (aplikacja Next.js)
- **Auto-sugestia kategorii** — dodano toggle ON/OFF w `/rules`
  - `stores/category-rules.ts` — dodano `autoSuggest: boolean` + `setAutoSuggest()`
  - `components/product-category-selector.tsx` — respektuje ustawienie; pokazuje pomarańczowe ostrzeżenie "Brak sugestii" gdy auto-sugestia włączona ale nic nie znajdzie
  - `app/rules/page.tsx` — Switch toggle na górze strony
- **Skill `/shopify-assign-collections`** — utworzono skill do przypisywania produktów do kolekcji
  - Plik: `/Users/mateuszbukala/.claude/skills/shopify-assign-collections/SKILL.md`
  - Logika: pobiera produkty + kolekcje, dopasowuje tag → kolekcja, pokazuje tabelę propozycji, czeka na potwierdzenie, wykonuje `add-to-collection`

### Shopify Store (MCP)
- **20 produktów** przypisanych do kolekcji na podstawie tagów:
  - LIGHT THERAPY → 11 produktów
  - GOLDEN → 7 produktów
  - WŁOSY → 1 (Suszarka MistEssence)
  - BRWI → 1 (Pęseta EY-2)
- **Metaobiekt "Homepage tab"** — utworzono definicję (`homepage_tab`) z polami `title` + `collection`
  - ID definicji: `gid://shopify/MetaobjectDefinition/32110051654`
- **3 wpisy metaobiektów** — What's hot (→GOLDEN), Best sellers (→LIGHT THERAPY), Sale (→DEPILATORY)
- **29 kolekcji opublikowanych** w kanale "Sklep online" (były niewidoczne w pickerze edytora motywu)

## Gdzie jesteśmy
Kolekcje są opublikowane i widoczne w edytorze motywu. Użytkownik ma ręcznie przypisać kolekcje do zakładek w sekcji `product-tabs` na homepage.

## Co pozostało
- [ ] Ręczne przypisanie kolekcji w edytorze motywu: Online Store → Customize → homepage → sekcja zakładek → blok po bloku wybrać kolekcję (What's hot → GOLDEN, Best sellers → LIGHT THERAPY, Sale → DEPILATORY)
- [ ] Uzupełnienie produktów w pustych kolekcjach (PEELING KAWITACYJNY, MEZOTERAPIA itp.)
- [ ] Przetestować eksport CSV z angielską kategorią → import do Shopify
- [ ] Dalsza budowa Shopify Integratora (etap: porównanie z Shopify read-only)

## Ważne decyzje/ustalenia
- Sekcja `product-tabs` w motywie `sleek-shopify-bfg` używa **bezpośredniego pickera kolekcji** (nie metaobiektu) — pole `"collection": ""` per blok zakładki
- Motywy: MAIN = `gid://shopify/OnlineStoreTheme/191657476422` (live), DEV = `gid://shopify/OnlineStoreTheme/191657509190`
- Kolekcje były niepublikowane → stąd "Nie znaleziono żadnych kolekcji" w edytorze — naprawiono
- Reguły kategorii + auto-sugestia: localStorage `"category-rules"` (Zustand persist)
- Skill `shopify-assign-collections` — zawsze czeka na potwierdzenie przed zapisem
- CSV używa angielskich ścieżek kategorii (Shopify Admin API zwraca EN, nie PL)
- `CategoryRule` interface: tylko `keywords[]` + `englishFullName`

## Następne kroki
1. W edytorze motywu przypisać kolekcje do 3 zakładek na homepage i zapisać
2. Jeśli sekcja wymaga metaobiektów zamiast kolekcji — wpisy już są gotowe (What's hot, Best sellers, Sale w `homepage_tab`)
3. Kontynuować budowę Shopify Integratora: dodać porównanie z Shopify (read-only diff)
