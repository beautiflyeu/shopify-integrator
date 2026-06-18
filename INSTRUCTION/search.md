# Jak ogarnąć 6000 kategorii Shopify bez zwłoki — krótka instrukcja

## Cel
- Pobierać wszystkie kategorie raz na start aplikacji,
- Przypisywać kategorię pod każdym produktem,
- Filtrować listę podczas wpisywania bez lagów.

---

## 1. Pobierz wszystkie kategorie (paginacja GraphQL)

Shopify GraphQL ma limit **250 na stronę**, więc musisz:
- pobrać pierwszą stronę,
- potem kolejno kolejne strony przez kursor (`endCursor`),
- aż `hasNextPage === false`.

Wynik: pełna lista 6000 kategorii w pamięci.

---

## 2. Optymalizuj strukturę kategorii

Zamiast trzymać pełne obiekty z API, zrób prostą listę:

```ts
type SimpleCategory = {
  id: string;
  name: string;
  handle: string;
};
```

Przetwórz wszystkie kategorie na tę formę — mniej danych, szybciej szuka.

---

## 3. Użyj `useMemo` do cache’owania listy

W React:

```tsx
const categoriesForSearch = useMemo(() => {
  return allCategories.map(cat => ({
    id: cat.id,
    name: cat.name,
    handle: cat.handle,
  }));
}, [allCategories]);
```

To:
- przelicza listę tylko raz,
- nie robi tego od nowa przy każdym renderze. [web:10][web:24]

---

## 4. Filtrowanie podczas wpisywania

Użyj:
- `useState` dla tekstu z inputa,
- `useMemo` dla przefiltrowanej listy.

```tsx
const [query, setQuery] = useState("");

const filteredCategories = useMemo(() => {
  const q = query.toLowerCase().trim();
  if (!q) return categoriesForSearch;
  return categoriesForSearch.filter(cat =>
    cat.name.toLowerCase().includes(q)
  );
}, [categoriesForSearch, query]);
```

---

## 5. Przypisanie kategorii do produktu

Jeśli masz funkcję szukającą kategorii:

```ts
function findCategoryForProduct(productTitle: string) {
  const q = productTitle.toLowerCase();
  return categoriesForSearch.find(cat =>
    cat.name.toLowerCase().includes(q)
  );
}
```

Działa szybko, bo:
- lista już jest w pamięci,
- `useMemo` nie przelicza jej za każdym razem.

---

## 6. Dodatkowe optymalizacje (opcjonalnie)

- Stwórz **indeks tekstowy** wszystkich nazw dla szybszego searchu.
- Jeśli przypisujesz przez ID, użyj **mapy ID → kategoria** zamiast `find()` na liście.
- Jeśli search jest bardzo często, dodaj **debounce** (np. 200–300ms).

---

## Podsumowanie

- Pobierz wszystkie kategorie raz przez paginację GraphQL. [web:16][web:17]
- Zmapuj na prostą strukturę.
- Cache’uj przez `useMemo`. [web:10]
- Filtrowanie przez `filter()` + `includes()` w `useMemo`. [web:4]
- Użyj tej listy do przypisywania kategorii pod każdym produktem.

To działa płynnie nawet przy 6000 kategoriach.