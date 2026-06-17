# STATUS - Shopify Integrator — Aktualizacja designu Pencil

*Ostatnia aktualizacja: 2026-06-17 15:30*

## Co robimy
Aktualizacja pliku `pencil-new.pen` żeby odzwierciedlał aktualny wygląd aplikacji — kierunek **kod → Pencil** (nie odwrotnie). Aplikacja była rozwijana (nowe zakładki, kolumny, pola) a Pencil był nieaktualny.

## Co zostało zrobione

### Dashboard (frame N5yns) ✅
- Metric cards: "Nowe produkty/Zmienione/Usunięte w PIM" → **"Łącznie (183) / Nowe (42) / Zmienione (118) / Wymaga decyzji (15)"** z poprawnymi kolorami
- Nagłówek: "Diff Dashboard" → **"Dashboard"**, subtitle → **"Produkty z PIM Beautifly"**
- Przycisk "Filtry" → **"Eksportuj CSV"** (ikona download)
- Filter buttons: dodano **"Wymaga decyzji"** jako 5. filtr
- Tabela: przebudowane kolumny: usunięto OST. SYNCHRONIZACJA + AKCJE, dodano osobne **SKU (120px)** i **EAN (140px)**, PRODUKT → NAZWA PRODUKTU
- Zaktualizowano wszystkie 6 wierszy danych (dane z pętlą JS)

### Product Detail — zakładka "Shopify" (frame UmW97) ✅
- Dodano **Tab Bar**: "Dane produktu" (nieaktywna) | **"Shopify"** (aktywna)
- Podzielono kolumnę DECYZJA → **STATUS (90px) + AKCJA (190px)**
- Zaktualizowano wszystkie 8 wierszy field diff (5 z FieldToggle, 3 "Brak zmian")

### Product Detail — zakładka "Dane produktu" (nowy frame PRnw5) ✅
- Nowy ekran 1440×1024 px z Tab Bar "**Dane produktu**" (aktywna) | "Shopify" (nieaktywna)
- Zawartość zakładki:
  - Badges: vendor, typ, barcode, dostępność, waga
  - 2-kolumnowy layout: galeria (320px + thumbnails) + ceny PLN/EUR netto/brutto + stock "24 szt." + wymiary
  - Opis + Krótkie opisy (numerowane) + USP (checkmark icons)
  - Tabela parametrów technicznych (5 wierszy)
  - Tagi/Rodziny jako badge chips

## Gdzie jesteśmy
Sesja zakończona. Wszystkie główne ekrany Pencil zaktualizowane. Na kanvasie jest teraz 6 ekranów: Dashboard, Product Detail (Shopify tab), Product Detail (Dane produktu tab), Sync Queue, Logs + paleta kolorów.

## Co pozostało
- [ ] **Etap 06B — API Push** do Shopify (wymaga credentials):
  - `SHOP_DOMAIN=` i `SHOPIFY_ACCESS_TOKEN=` w `.env.local` — PUSTE
  - `modules/sync/buildApiPayload.ts` — selekcja + diff → `productUpdate` input
  - `modules/sync/executeSync.ts` — mutacje GraphQL
  - `app/api/sync/route.ts` — endpoint synca
- [ ] **Sync Queue** (`app/sync-queue/page.tsx`) — placeholder, czeka na 06B
- [ ] **Logs** (`app/logs/page.tsx`) — placeholder, czeka na 06B
- [ ] Ewentualnie: Pencil — brakuje badge "Wymaga decyzji" w kolorze purple (brak zmiennej w tokenie)

## Ważne decyzje/ustalenia
- Plik designu: `pencil-new.pen` w root projektu
- Kierunek synca designu: **kod → Pencil** (kod jest source of truth)
- `BEAUTIFLY_API_KEY=29u8b7h1q2vuLQ0lTu5F` — działa
- `SHOP_DOMAIN=` i `SHOPIFY_ACCESS_TOKEN=` — PUSTE, blokują etap 06B
- Font: Inter, `forcedTheme="light"`
- CSV export: limit 50 produktów, 32 kolumny wypełnione
- Zdjęcia produktów z Google Drive via `external_sources` (nie z `media.images` — zawsze puste)

## Następne kroki
1. Uzupełnij `.env.local`: `SHOP_DOMAIN=` i `SHOPIFY_ACCESS_TOKEN=`
2. Etap 06B: `buildApiPayload.ts` + `executeSync.ts` + `app/api/sync/route.ts`
3. Wpiąć przycisk "Synchronizuj" w dashboard/product detail (obok "Eksportuj CSV")
4. Sync Queue + Logs — realne dane z historii synchronizacji
