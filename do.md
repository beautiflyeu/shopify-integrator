# Shopify taxonomy search w Next.js

Ta instrukcja pokazuje, jak zrobić prostą wyszukiwarkę kategorii Shopify w Next.js.

## Co to robi

- wpisujesz nazwę produktu po polsku,
- Next.js wysyła zapytanie do Shopify Admin GraphQL,
- dostajesz listę pasujących kategorii z `id` i `name`.

Shopify `taxonomy` pozwala szukać kategorii po `search` i zwraca wyniki z taksonomii produktów. [web:69][web:70]

## Jak to działa

1. Użytkownik wpisuje np. `koszula`.
2. Front wysyła tekst do endpointu w Next.js.
3. Endpoint łączy się z Shopify Admin API.
4. Shopify zwraca pasujące kategorie.

## Gdzie szukać

Najpierw testuj w [Shopify Taxonomy Explorer](https://shopify.github.io/product-taxonomy/), bo to oficjalne źródło taksonomii Shopify. [web:69][web:70]

## Jak szukać po polsku

- Zacznij od prostych słów: `koszula`, `bluza`, `biurko`.
- Jeśli wynik jest słaby, użyj prostszego hasła.
- Gdy dalej nic nie pasuje, spróbuj angielskiej nazwy.

Shopify wspiera wyszukiwanie po `search`, ale najlepsze wyniki zwykle daje prosta nazwa produktu albo angielski odpowiednik. [web:69][web:70]

## Co zapisać

Po znalezieniu wyniku zapisuj:

- `id` kategorii,
- `name`,
- ewentualnie pełną ścieżkę kategorii.

To jest wygodne do CSV, importu i późniejszej automatyzacji. [web:66][web:69]

## Uwaga

Token do Admin API trzymaj tylko po stronie serwera, nie w przeglądarce.  
Do produkcyjnego użycia najlepiej robić request przez route handler w Next.js.

## Najprostszy workflow

- test w Taxonomy Explorer,
- potem wyszukiwanie przez GraphQL,
- na końcu zapis ID kategorii do CSV lub bazy.
