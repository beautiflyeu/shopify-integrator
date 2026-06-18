# STATUS - Shopify Integrator — UI lista + integracja Shopify

*Ostatnia aktualizacja: 2026-06-18 13:00*

## Co robimy
Budujemy narzędzie do synchronizacji produktów PIM (Beautifly) ↔ Shopify. Aktualnie dopracowujemy UI listy produktów i przygotowujemy integrację z Shopify Admin API.

## Co zostało zrobione

### Lista produktów (`components/diff-table.tsx`) ✅
- Nowa kolejność kolumn wg CSV template: **[checkbox, Model, EAN, Nazwa produktu, Status, Pola zmienione]**
- Usunięta kolumna SKU
- Kolumna "Type" przemianowana na **"Model"** (pokazuje `item.model` z PIM)
- Zmniejszony checkbox (28px), padding komórek px-2, tekst xs
- Usunięty duplikat ExportCsvButton i licznik produktów z toolbara tabeli

### Nagłówek dashboardu (`components/dashboard-header.tsx`) ✅ NOWY
- Nowy client component z przyciskami po prawej stronie tytułu
- **"Eksportuj CSV"** — działa, eksportuje zaznaczone produkty
- **"Synchronizuj zaznaczone"** — placeholder, `disabled` dopóki nic nie zaznaczone

### Mapowanie pól (`modules/pim/normalize.ts`) ✅
- `productType` = `md.title ?? raw.name` (tytuł z PIM)
- Trafia do kolumny "Type" w CSV oraz do wiersza "Type" w zakładce Shopify

### API PIM (`services/beautifly.ts`) ✅
- Dodano pole `model` do `BeautiflyProductListItem`
- Zapytanie API pobiera `fields=id,sku,model,name,ean`
- `searchProducts()` szuka też po modelu

## Gdzie jesteśmy
UI listy gotowy. Próbujemy podłączyć Shopify Admin API — token wgrany, ale okazał się nieprawidłowy.

## Co pozostało
- [ ] **Shopify token** — wgrany `shpss_...` jest NIEPRAWIDŁOWY. Potrzebny `shpat_` z custom app w Shopify Admin (`beautifly-pl.myshopify.com/admin/settings/apps/development`)
- [ ] **Shopify diff flow** — po uzyskaniu tokenu: `fetchAllShopifyProducts()` + `normalizeShopifyProduct()` + `diffProduct()` w `app/api/export/csv/route.ts`
- [ ] **Przycisk "Synchronizuj zaznaczone"** — wpiąć logikę sync po 06B (`buildApiPayload.ts` + `executeSync.ts`)
- [ ] **Product category w CSV** — kolumna pusta, potrzeba zmapować na taksonomię Shopify (np. Health & Beauty > Skin Care)
- [ ] **Sync Queue** (`app/sync-queue/page.tsx`) — placeholder
- [ ] **Logs** (`app/logs/page.tsx`) — placeholder

## Ważne decyzje/ustalenia
- **Brak Supabase** — flow: PIM → diff vs Shopify (bezpośrednio) → CSV/API → Shopify
- `productType` w `NormalizedProduct` = tytuł produktu PIM (nie model) → trafia do Shopify "Type"
- Kolumna "Model" w liście = `item.model` z API listowego (osobne od productType)
- `SHOP_DOMAIN=beautifly-pl.myshopify.com` ✅ ustawiony
- `SHOPIFY_ACCESS_TOKEN=shpss_...` ❌ nieprawidłowy typ tokenu
- `BEAUTIFLY_API_KEY=29u8b7h1q2vuLQ0lTu5F` ✅ działa

## Problemy/blokery
**Shopify token** — `shpss_` to token sesji (CI/CD), nie Admin API. Trzeba wygenerować `shpat_` token przez: Shopify Admin → Settings → Apps → Develop apps → utwórz custom app → API credentials → Install → skopiuj token (pokazywany jednorazowo).

## Następne kroki
1. Wygeneruj prawidłowy `shpat_` token w Shopify Admin i wklej do `.env.local`
2. Przetestuj połączenie (`curl` na `/admin/api/2026-04/graphql.json`)
3. Podepnij `fetchAllShopifyProducts()` do eksportu CSV — diff PIM vs Shopify
4. Wpiąć "Synchronizuj zaznaczone" — `buildApiPayload.ts` + `executeSync.ts`
5. Uzupełnić "Product category" w CSV (stała domyślna lub mapowanie z PIM)
