# STATUS - Shopify Integrator — Switch sync + fixes

*Ostatnia aktualizacja: 2026-06-18 18:30*

## Co robimy
Budujemy narzędzie do synchronizacji PIM (Beautifly) ↔ Shopify. W tej sesji: zamieniliśmy przyciski Synchronizuj/Pomiń na switche, dodaliśmy globalny switch, naprawiliśmy build i problem z tokenem na GitHubie.

## Co zostało zrobione

### Switche w tabeli diff-pól ✅
- **`components/ui/switch.tsx`** — nowy komponent (shadcn `npx shadcn@latest add switch`)
- **`components/field-toggle.tsx`** — podmieniono dwa przyciski ("Synchronizuj"/"Pomiń") na `<Switch size="sm" />`
- **`components/field-diff-detail.tsx`** — nagłówek "Akcja" → "Synchronizacja"

### Globalny switch ✅
- **`stores/selection.ts`** — dodano akcję `setAllFieldsForProduct(productId, fieldKeys, selected)`
  - `selected=true` → kasuje mapę produktu (domyślnie wszystkie `true`)
  - `selected=false` → ustawia `false` dla wszystkich changed-pól
- **`components/field-diff-detail.tsx`** — switch w `<th>Synchronizacja</th>` kontroluje wszystkie per-field switche; `allChangedSelected` = czy wszystkie changed-pola są zaznaczone

### Fix build — font ✅
- **`app/layout.tsx`** — usunięto `Geist_Mono` z `next/font/google` (timeout na `fonts.gstatic.com`)
- Klasy `font-mono` w komponentach działają przez systemowe fonty Tailwind

### Fix paginacji Beautifly API ✅
- **`services/beautifly.ts`** — poprawiono warunek `hasMore` — działa też gdy API nie zwraca `meta.total`

### GitHub Push Protection — token w historii ⚠️
- Token Shopify był w STATUS.md (już usunięty z working tree)
- Dwa commity z tokenem: `155c018 add credensials`, `0f12b75 swich in diff`
- **Do zrobienia**: odinstaluj aplikację w Shopify Admin → nowy token → zaktualizuj `.env` → kliknij Allow na GitHubie → push

## Gdzie jesteśmy
Switche działają, build przechodzi. Blokada push przez GitHub — czeka na rotację tokenu Shopify przez reinstalację aplikacji.

## Co pozostało
- [ ] **Rotacja tokenu** — odinstaluj/reinstaluj aplikację Shopify → nowy `SHOPIFY_ACCESS_TOKEN` w `.env` → push
- [ ] **Kategorie w Zustand store** — fetch raz na sesję zamiast per produkt (`stores/category.ts`)
- [ ] **`productType` w CSV** — zmienić na `raw.model` w `modules/pim/normalize.ts` (teraz = duplikat `name`)
- [ ] **Shopify diff flow** — `fetchAllShopifyProducts()` + `normalizeShopifyProduct()` + `diffProduct()` — wartość Shopify zawsze `—`
- [ ] **"Synchronizuj zaznaczone"** — `buildApiPayload.ts` + `executeSync.ts`
- [ ] **Sync Queue** (`app/sync-queue/page.tsx`) — placeholder
- [ ] **Logs** (`app/logs/page.tsx`) — placeholder

## Ważne decyzje/ustalenia
- **Brak Supabase** — flow: PIM → diff vs Shopify (bezpośrednio) → CSV/API → Shopify
- Matchowanie PIM ↔ Shopify po **EAN** (nie SKU — null wszędzie w Shopify)
- `SHOP_DOMAIN=beautifly-pl.myshopify.com`, `BEAUTIFLY_API_KEY=29u8b7h1q2vuLQ0lTu5F` ✅
- Token Shopify — do rotacji przez odinstalowanie aplikacji
- Geist Mono usunięty z layoutu (problem z CDN Google Fonts)

## Następne kroki
1. Odinstaluj aplikację Shopify → reinstaluj → skopiuj nowy token do `.env`
2. Allow na GitHubie + git push
3. Zaimplementuj Shopify diff flow (`fetchAllShopifyProducts`)
