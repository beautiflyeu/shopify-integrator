# Beautifly API — Dokumentacja dla Raycast Extension

## 1. Przegląd

| | |
|---|---|
| **Base URL** | `https://devbeautifly.host486049.xce.pl` |
| **Wersja** | v1 |
| **Format odpowiedzi** | JSON |
| **Metody HTTP** | GET (tylko odczyt) |
| **Środowisko** | development |

---

## 2. Uwierzytelnienie

API używa klucza API przekazywanego w nagłówku HTTP przy każdym zapytaniu.

```
X-API-Key: <twój_klucz>
```

### Przechowywanie klucza w Raycast

W pliku `package.json` rozszerzenia zadeklaruj preferencję:

```json
"preferences": [
  {
    "name": "apiKey",
    "title": "Beautifly API Key",
    "description": "Klucz API do Beautifly (X-API-Key)",
    "type": "password",
    "required": true
  }
]
```

Odczyt w kodzie:

```typescript
import { getPreferenceValues } from "@raycast/api";

interface Preferences {
  apiKey: string;
}

const { apiKey } = getPreferenceValues<Preferences>();
```

---

## 3. Endpointy

### 3.1 Lista produktów

```
GET /api/v1/products
```

Zwraca listę produktów. Obsługuje filtrowanie, wybór pól i dołączanie sekcji danych.

**Parametry query:**

| Parametr | Typ | Wymagany | Opis |
|---|---|---|---|
| `lang` | `pl` \| `en` \| `de` | nie | Język zwracanych danych |
| `updated_since` | `YYYY-MM-DD` | nie | Tylko produkty zaktualizowane od tej daty |
| `fields` | string (CSV) | nie | Lista pól do zwrócenia, np. `id,sku,name` |
| `include` | string (CSV) | nie | Sekcje danych do dołączenia (patrz sekcja 5) |

**Przykłady curl:**

```bash
# Wszystkie produkty z pełnymi danymi po polsku
curl -H "X-API-Key: TWOJ_KLUCZ" \
  "https://devbeautifly.host486049.xce.pl/api/v1/products?lang=pl&include=main_details,price,categories"

# Tylko ID i SKU zaktualizowane od marca 2026
curl -H "X-API-Key: TWOJ_KLUCZ" \
  "https://devbeautifly.host486049.xce.pl/api/v1/products?fields=id,sku&updated_since=2026-03-01"
```

---

### 3.2 Pojedynczy produkt

```
GET /api/v1/products/{id}
```

Zwraca dane jednego produktu o podanym `id`.

**Parametry path:**

| Parametr | Typ | Opis |
|---|---|---|
| `id` | integer | ID produktu w systemie Beautifly |

**Parametry query:**

| Parametr | Typ | Wymagany | Opis |
|---|---|---|---|
| `lang` | `pl` \| `en` \| `de` | nie | Język zwracanych danych |
| `fields` | string (CSV) | nie | Lista pól do zwrócenia |
| `include` | string (CSV) | nie | Sekcje danych do dołączenia |

**Przykłady curl:**

```bash
# Pełny produkt ze wszystkimi sekcjami
curl -H "X-API-Key: TWOJ_KLUCZ" \
  "https://devbeautifly.host486049.xce.pl/api/v1/products/123?lang=pl&include=main_details,description_data,media,categories,families,attributes,parameters,price"

# Tylko cena i nazwa
curl -H "X-API-Key: TWOJ_KLUCZ" \
  "https://devbeautifly.host486049.xce.pl/api/v1/products/123?fields=id,sku,name,price&include=price"
```

---

### 3.3 Produkt w formacie LLM-ready

```
GET /api/v1/products/{id}/llm-ready
```

Zwraca dane produktu w formacie zoptymalizowanym do przekazania modelowi językowemu (AI). Przydatny do generowania opisów, odpowiadania na pytania o produkt, asystentów AI.

**Uwaga:** Ten endpoint NIE obsługuje parametru `include` — zawsze zwraca kompletny zestaw danych.

**Parametry path:**

| Parametr | Typ | Opis |
|---|---|---|
| `id` | integer | ID produktu |

**Parametry query:**

| Parametr | Typ | Wymagany | Opis |
|---|---|---|---|
| `lang` | `pl` \| `en` \| `de` | nie | Język danych |

**Przykład curl:**

```bash
curl -H "X-API-Key: TWOJ_KLUCZ" \
  "https://devbeautifly.host486049.xce.pl/api/v1/products/123/llm-ready?lang=pl"
```

---

## 4. Parametry query — pełna tabela

| Parametr | Typ | Endpointy | Przykład |
|---|---|---|---|
| `lang` | `pl` \| `en` \| `de` | wszystkie | `?lang=pl` |
| `updated_since` | `YYYY-MM-DD` | `/products` (lista) | `?updated_since=2026-03-01` |
| `fields` | CSV string | `/products`, `/products/{id}` | `?fields=id,sku,name,price` |
| `include` | CSV string | `/products`, `/products/{id}` | `?include=price,media` |

---

## 5. Dostępne wartości `include`

| Wartość | Opis |
|---|---|
| `main_details` | Podstawowe dane produktu (nazwa, SKU, stan magazynowy, itp.) |
| `description_data` | Opisy tekstowe produktu (krótki, długi, marketingowy) |
| `media` | Zdjęcia i pliki medialne (URL-e do obrazków) |
| `categories` | Przypisane kategorie produktowe (ID, nazwy, ścieżki) |
| `families` | Rodziny produktów — grupowanie asortymentu |
| `attributes` | Atrybuty produktu (kolor, rozmiar, materiał, itp.) |
| `parameters` | Parametry techniczne (wymiary, waga, pojemność, itp.) |
| `price` | Dane cenowe (cena bazowa, promocyjna, waluta, VAT) |

**Przykład kombinacji wszystkich sekcji:**

```
?include=main_details,description_data,media,categories,families,attributes,parameters,price
```

---

## 6. Kody HTTP i obsługa błędów

| Kod | Znaczenie | Co robić |
|---|---|---|
| `200 OK` | Sukces, dane w body | Przetwórz JSON |
| `401 Unauthorized` | Brak lub zły klucz API | Sprawdź `X-API-Key` w preferencjach |
| `404 Not Found` | Produkt o podanym ID nie istnieje | Pokaż komunikat użytkownikowi |
| `500 Internal Server Error` | Błąd po stronie API | Spróbuj ponownie lub zaraportuj |
| `502 Bad Gateway` | Błąd proxy (lokalny serwer dev) | Tylko przy dev proxy, nie dotyczy produkcji |

---

## 7. Gotowe fragmenty kodu TypeScript dla Raycast

### `src/api.ts` — helper do fetch

```typescript
import { getPreferenceValues } from "@raycast/api";

const BASE_URL = "https://devbeautifly.host486049.xce.pl";

interface Preferences {
  apiKey: string;
}

function getHeaders(): HeadersInit {
  const { apiKey } = getPreferenceValues<Preferences>();
  return {
    "X-API-Key": apiKey,
    "Accept": "application/json",
  };
}

// --- Typy (rozszerz po zobaczeniu rzeczywistych odpowiedzi API) ---

export interface Product {
  id: number;
  sku: string;
  name: string;
  [key: string]: unknown; // dodatkowe pola zależne od `include`
}

export interface ProductsResponse {
  data: Product[];
  meta?: {
    total?: number;
    page?: number;
  };
}

export interface ProductResponse {
  data: Product;
}

// --- Funkcje API ---

export async function fetchProducts(params?: {
  lang?: "pl" | "en" | "de";
  updated_since?: string;
  fields?: string;
  include?: string[];
}): Promise<ProductsResponse> {
  const query = new URLSearchParams();
  if (params?.lang) query.set("lang", params.lang);
  if (params?.updated_since) query.set("updated_since", params.updated_since);
  if (params?.fields) query.set("fields", params.fields);
  if (params?.include?.length) query.set("include", params.include.join(","));

  const url = `${BASE_URL}/api/v1/products${query.toString() ? "?" + query : ""}`;
  const res = await fetch(url, { headers: getHeaders() });

  if (!res.ok) throw new Error(`HTTP ${res.status}: ${res.statusText}`);
  return res.json();
}

export async function fetchProduct(
  id: number,
  params?: {
    lang?: "pl" | "en" | "de";
    fields?: string;
    include?: string[];
  }
): Promise<ProductResponse> {
  const query = new URLSearchParams();
  if (params?.lang) query.set("lang", params.lang);
  if (params?.fields) query.set("fields", params.fields);
  if (params?.include?.length) query.set("include", params.include.join(","));

  const url = `${BASE_URL}/api/v1/products/${id}${query.toString() ? "?" + query : ""}`;
  const res = await fetch(url, { headers: getHeaders() });

  if (!res.ok) throw new Error(`HTTP ${res.status}: ${res.statusText}`);
  return res.json();
}

export async function fetchProductLlmReady(
  id: number,
  lang?: "pl" | "en" | "de"
): Promise<unknown> {
  const query = new URLSearchParams();
  if (lang) query.set("lang", lang);

  const url = `${BASE_URL}/api/v1/products/${id}/llm-ready${query.toString() ? "?" + query : ""}`;
  const res = await fetch(url, { headers: getHeaders() });

  if (!res.ok) throw new Error(`HTTP ${res.status}: ${res.statusText}`);
  return res.json();
}
```

---

### `src/search-products.tsx` — komenda: lista produktów

```typescript
import { List, ActionPanel, Action, showToast, Toast } from "@raycast/api";
import { useState, useEffect } from "react";
import { fetchProducts, Product } from "./api";

export default function SearchProducts() {
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchText, setSearchText] = useState("");

  useEffect(() => {
    async function load() {
      try {
        setIsLoading(true);
        const res = await fetchProducts({
          lang: "pl",
          include: ["main_details", "price"],
          fields: "id,sku,name",
        });
        setProducts(res.data);
      } catch (err) {
        await showToast({
          style: Toast.Style.Failure,
          title: "Błąd pobierania produktów",
          message: err instanceof Error ? err.message : String(err),
        });
      } finally {
        setIsLoading(false);
      }
    }
    load();
  }, []);

  const filtered = products.filter((p) =>
    p.name?.toString().toLowerCase().includes(searchText.toLowerCase()) ||
    p.sku?.toString().toLowerCase().includes(searchText.toLowerCase())
  );

  return (
    <List
      isLoading={isLoading}
      onSearchTextChange={setSearchText}
      searchBarPlaceholder="Szukaj po nazwie lub SKU..."
      throttle
    >
      {filtered.map((product) => (
        <List.Item
          key={product.id}
          title={String(product.name ?? "—")}
          subtitle={String(product.sku ?? "")}
          accessories={[{ text: `ID: ${product.id}` }]}
          actions={
            <ActionPanel>
              <Action.Push
                title="Szczegóły produktu"
                // target={<ProductDetail id={product.id} />}
                // odkomentuj po stworzeniu ProductDetail
              />
            </ActionPanel>
          }
        />
      ))}
    </List>
  );
}
```

---

### `src/product-detail.tsx` — widok szczegółów produktu

```typescript
import { Detail, ActionPanel, Action, showToast, Toast } from "@raycast/api";
import { useState, useEffect } from "react";
import { fetchProduct, Product } from "./api";

interface Props {
  id: number;
}

export default function ProductDetail({ id }: Props) {
  const [product, setProduct] = useState<Product | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const res = await fetchProduct(id, {
          lang: "pl",
          include: ["main_details", "description_data", "price", "media", "attributes"],
        });
        setProduct(res.data);
      } catch (err) {
        await showToast({
          style: Toast.Style.Failure,
          title: "Błąd pobierania produktu",
          message: err instanceof Error ? err.message : String(err),
        });
      } finally {
        setIsLoading(false);
      }
    }
    load();
  }, [id]);

  const markdown = product
    ? `# ${product.name}\n\n**SKU:** ${product.sku}\n\n**ID:** ${product.id}`
    : "";

  return (
    <Detail
      isLoading={isLoading}
      markdown={markdown}
      actions={
        <ActionPanel>
          <Action.CopyToClipboard
            title="Kopiuj SKU"
            content={String(product?.sku ?? "")}
          />
        </ActionPanel>
      }
    />
  );
}
```

---

### `package.json` — minimalna konfiguracja Raycast extension

```json
{
  "name": "beautifly",
  "title": "Beautifly Products",
  "description": "Przeglądaj i wyszukuj produkty Beautifly",
  "icon": "icon.png",
  "author": "twoj-login-raycast",
  "categories": ["Productivity"],
  "license": "MIT",
  "commands": [
    {
      "name": "search-products",
      "title": "Szukaj produktów",
      "subtitle": "Beautifly",
      "description": "Wyszukaj produkty Beautifly po nazwie lub SKU",
      "mode": "view"
    }
  ],
  "preferences": [
    {
      "name": "apiKey",
      "title": "Beautifly API Key",
      "description": "Klucz API (X-API-Key) do Beautifly",
      "type": "password",
      "required": true
    },
    {
      "name": "lang",
      "title": "Język danych",
      "description": "Język zwracanych danych produktowych",
      "type": "dropdown",
      "required": false,
      "default": "pl",
      "data": [
        { "title": "Polski", "value": "pl" },
        { "title": "English", "value": "en" },
        { "title": "Deutsch", "value": "de" }
      ]
    }
  ],
  "dependencies": {
    "@raycast/api": "^1.0.0"
  },
  "devDependencies": {
    "@raycast/utils": "^1.0.0",
    "typescript": "^5.0.0"
  }
}
```

---

## 8. Przykładowa struktura projektu Raycast

```
raycast-beautifly/
├── package.json              ← konfiguracja, preferencje, komendy
├── tsconfig.json
├── icon.png                  ← ikona 512×512 PNG
├── assets/
│   └── icon.png
└── src/
    ├── api.ts                ← fetch helpers, typy
    ├── search-products.tsx   ← komenda: lista / wyszukiwarka
    └── product-detail.tsx    ← widok szczegółów
```

### Inicjalizacja projektu

```bash
# Przez CLI Raycast (zalecane)
npx create-raycast-extension@latest

# Lub ręcznie
mkdir raycast-beautifly && cd raycast-beautifly
npm init -y
npm install @raycast/api
npm install -D @raycast/utils typescript
```

---

## 9. Testowanie przez lokalny proxy

Serwer dev (`server.js`) wystawia proxy na `http://localhost:3000/proxy/*` → `https://devbeautifly.host486049.xce.pl/*`. Możesz testować zapytania lokalnie bez konieczności uderzania bezpośrednio w API:

```bash
# Uruchom serwer
node server.js

# Testuj przez proxy
curl "http://localhost:3000/proxy/api/v1/products?lang=pl&include=price"
curl "http://localhost:3000/proxy/api/v1/products/123?lang=pl&include=main_details,price"
curl "http://localhost:3000/proxy/api/v1/products/123/llm-ready?lang=pl"
```

> Klucz API jest automatycznie dołączany przez proxy — nie musisz go podawać w curl przy testach lokalnych.

---

## 10. Szybka ściąga (cheat sheet)

```
# Pełny produkt
GET /api/v1/products/123?lang=pl&include=main_details,description_data,media,categories,families,attributes,parameters,price

# Tylko cena + nazwa
GET /api/v1/products/123?fields=id,sku,name&include=price&lang=pl

# Lista zaktualizowanych
GET /api/v1/products?updated_since=2026-03-01&lang=pl

# Dla AI / LLM
GET /api/v1/products/123/llm-ready?lang=pl
```

---

## 11. Wyszukiwanie produktów po nazwie — przepływ krok po kroku

API nie obsługuje parametru `search` — filtrowanie po nazwie odbywa się lokalnie po stronie klienta. Wymagany jest trzyetapowy flow: pobierz bazę, przefiltruj, pobierz szczegóły.

### Krok 1 — Pobierz bazę produktów (wszystkie strony)

Endpoint listy może zwracać dane stronicami. Pobieraj kolejne strony (`?page=N`) dopóki `meta.total` nie jest osiągnięte. Jeśli API nie zwraca `meta`, wystarczy jedna strona.

Używaj `fields=id,sku,name` — ogranicza rozmiar odpowiedzi do minimum potrzebnego do wyszukiwania.

```typescript
async function fetchAllProducts(lang: 'pl' | 'en' | 'de' = 'pl'): Promise<Product[]> {
  const all: Product[] = [];
  let page = 1;
  let hasMore = true;

  while (hasMore) {
    const params = new URLSearchParams({ fields: 'id,sku,name', lang, page: String(page) });
    const res = await fetch(`${BASE_URL}/api/v1/products?${params}`, { headers: getHeaders() });
    const data = await res.json();

    const items: Product[] = Array.isArray(data) ? data : (data.data ?? []);
    all.push(...items);

    const total = data.meta?.total ?? data.meta?.total_count ?? null;
    hasMore = items.length > 0 && total !== null && all.length < total;
    page++;
  }

  return all;
}
```

### Krok 2 — Filtruj lokalnie po nazwie lub SKU

```typescript
function searchProducts(products: Product[], query: string): Product[] {
  const term = query.toLowerCase();
  return products.filter(p =>
    String(p.name ?? '').toLowerCase().includes(term) ||
    String(p.sku ?? '').toLowerCase().includes(term)
  );
}
```

### Krok 3 — Pobierz pełne dane wybranego produktu po ID

Po wybraniu produktu z listy wyników pobierz jego pełne dane przez `/products/{id}` z wszystkimi `include`:

```typescript
const full = await fetchProduct(selectedProduct.id, {
  lang: 'pl',
  include: ['main_details', 'description_data', 'media', 'categories', 'families', 'attributes', 'parameters', 'price'],
});
```

Funkcja `fetchProduct` zdefiniowana jest w sekcji 7.

---

### Pełny flow — curl (ręcznie)

```bash
# Krok 1 — pobierz lekką listę (tylko id/sku/name)
curl -H "X-API-Key: KLUCZ" \
  "https://devbeautifly.host486049.xce.pl/api/v1/products?fields=id,sku,name&lang=pl&page=1"

# Jeśli odpowiedź zawiera meta.total > liczba pobranych — powtórz z ?page=2, ?page=3 …

# Krok 3 — po znalezieniu produktu (np. ID 42) pobierz pełne dane
curl -H "X-API-Key: KLUCZ" \
  "https://devbeautifly.host486049.xce.pl/api/v1/products/42?lang=pl&include=main_details,description_data,media,categories,families,attributes,parameters,price"
```

---

### Gotowy helper dla Raycast

```typescript
async function searchAndFetch(
  query: string,
  lang: 'pl' | 'en' | 'de' = 'pl'
): Promise<ProductResponse[]> {
  const all = await fetchAllProducts(lang);       // krok 1: pobierz bazę
  const results = searchProducts(all, query);     // krok 2: filtruj lokalnie
  if (!results.length) return [];
  return Promise.all(
    results.map(p =>
      fetchProduct(p.id, {
        lang,
        include: ['main_details', 'price', 'media'],
      })
    )
  );                                              // krok 3: pełne dane po ID
}
```

> **Wskazówka:** W Raycast wywołaj `fetchAllProducts` raz (np. przy starcie lub przy `onSearchTextChange`) i cache'uj wynik w stanie komponentu — nie wysyłaj nowego żądania przy każdym znaku wpisanym w wyszukiwarce.
