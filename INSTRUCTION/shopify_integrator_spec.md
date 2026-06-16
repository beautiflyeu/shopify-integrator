# Shopify Integrator

## Zarys aplikacji

Ta aplikacja ma być lokalnym narzędziem typu **Shopify Integrator**. Jej zadaniem nie jest budowanie sklepu, tylko pobieranie danych produktowych z zewnętrznego API, mapowanie ich do struktury importowej Shopify CSV, pokazywanie różnic oraz pozwalanie na ręczne zatwierdzanie synchronizacji.

Na start aplikacja może działać lokalnie jako localhost, a później zostać wdrożona jako normalna aplikacja webowa. Głównym celem pierwszej wersji nie jest bezpośredni push do Shopify Admin API, tylko przygotowanie poprawnego, czytelnego i kontrolowanego CSV do importu.

## Główne moduły

Aplikacja powinna składać się z następujących modułów:

- **API connector** — pobiera dane z zewnętrznego API produktowego.
- **Mapper** — przekształca strukturę API do modelu danych zgodnego z Shopify CSV.
- **CSV builder** — buduje finalny układ rekordów i wariantów do eksportu.
- **Diff viewer** — pokazuje różnice między danymi źródłowymi a wynikiem mapowania.
- **Preview layer** — pozwala porównać dane API, znormalizowany model i gotowy wynik CSV.
- **Sync / export queue** — zarządza kolejką rekordów do przeliczenia, zatwierdzenia i eksportu.

Do tego warto dodać moduły pomocnicze: logi, historia przeliczeń, mapa pól, statusy rekordów i walidacja błędów.

## Proponowany stack

Najlepszym wyborem będzie Next.js jako pełna aplikacja full-stack. Dostajesz wtedy UI, backendowe endpointy, możliwość pracy lokalnej i prostą ścieżkę do deploymentu później.

Do interakcji z tabelami, selekcją rekordów i porównaniami dobrze sprawdza się podejście oparte na:

- tabeli z row selection,
- panelu szczegółów produktu,
- panelu diffów pól,
- widoku preview CSV,
- lokalnym store dla filtrów, zaznaczeń i stanu synchronizacji.

## Zewnętrzne źródła danych

Aplikacja ma korzystać z dwóch głównych źródeł wejściowych:

### 1. Beautifly API

Beautifly API działa w wersji v1, zwraca dane w JSON i używa autoryzacji przez nagłówek `X-API-Key`. Na obecnym etapie dokumentacja przewiduje odczytowe endpointy `GET`, przede wszystkim:

- `GET /api/v1/products` — lista produktów,
- `GET /api/v1/products/{id}` — szczegóły pojedynczego produktu,
- `GET /api/v1/products/{id}/llm-ready` — pełne dane w formacie przyjaznym dla AI.

Dostępne parametry query to między innymi:

- `lang`,
- `updated_since`,
- `fields`,
- `include`.

Sekcje `include`, które trzeba uwzględnić w projekcie mapowania:

- `main_details`,
- `description_data`,
- `media`,
- `categories`,
- `families`,
- `attributes`,
- `parameters`,
- `price`.

### 2. Shopify CSV template

Drugim źródłem referencyjnym jest szablon CSV importu do Shopify. To nie jest zwykła tabela 1:1, tylko docelowy model zapisu produktu, wariantów, cen, zdjęć, SEO i części metafields.

Najważniejsza cecha tego pliku: jeden produkt może zajmować wiele wierszy. Pierwszy wiersz zwykle zawiera dane główne produktu, a kolejne wiersze rozwijają warianty przy użyciu tego samego `handle` i pól `Option1`, `Option2`, `Option3`.

## Jak aplikacja działa

Na poziomie użytkowym flow powinien być prosty i przewidywalny:

1. Uruchamiasz aplikację lokalnie.
2. Wybierasz tryb pracy: pełny import, import zmian od daty albo pojedynczy produkt.
3. Aplikacja pobiera dane z API.
4. System normalizuje dane do wspólnego modelu wewnętrznego.
5. Mapper podstawia wartości pod strukturę Shopify CSV.
6. System buduje wynikowy układ rekordów, w tym warianty i wiele wierszy dla jednego produktu.
7. Aplikacja pokazuje porównanie: dane z API vs model po mapowaniu vs wynik CSV.
8. Zaznaczasz produkty lub konkretne pola do uwzględnienia.
9. Zatwierdzasz eksport lub zapis wyniku.
10. Aplikacja zapisuje historię, status i rezultat walidacji.

## Tryby pracy

W pierwszej wersji aplikacja powinna obsługiwać trzy tryby:

- **Full import** — pobranie całego katalogu z API i przeliczenie całości do CSV.
- **Import zmian** — pobranie tylko produktów zmienionych od wskazanej daty przez `updated_since`.
- **Pojedynczy produkt** — pobranie jednego produktu po ID albo przez wybór z listy wyszukiwania.

To pozwala używać narzędzia zarówno do pierwszego masowego przygotowania danych, jak i do codziennych aktualizacji.

## Model danych wewnętrznych

Warto od początku rozdzielić trzy poziomy danych:

- **Source model** — surowa odpowiedź z API.
- **Normalized model** — wewnętrzny model aplikacji, uproszczony i przewidywalny.
- **Shopify CSV row model** — końcowy układ rekordów gotowych do eksportu do CSV.

To bardzo ważne, bo API i Shopify CSV mają zupełnie inne struktury. API jest sekcyjne i logiczne, natomiast CSV jest płaskie, kolumnowe i wielowierszowe.

## Mapowanie API do Shopify CSV

Środek całej aplikacji powinien stanowić mapper pól. To on odpowiada za przekształcenie danych wejściowych do docelowego układu CSV.

Przykładowe obszary mapowania:

- `main_details` → `Title`, `SKU`, podstawowe pola produktu,
- `description_data` → `Description`, `SEO title`, `SEO description`,
- `media` → `Product image URL`, `Variant image URL`, `Image alt text`,
- `categories` i `families` → `Product category`, `Type`, część `Tags`,
- `attributes` → `Option1`, `Option2`, `Option3`, wybrane metafields,
- `parameters` → pola techniczne, np. waga, jednostki, dodatkowe opisy,
- `price` → `Price`, `Compare-at price`, `Cost per item`, `Charge tax`.

Aplikacja nie powinna zakładać, że wszystkie pola z API mają bezpośrednie odwzorowanie 1:1. Część pól trzeba będzie:

- łączyć,
- upraszczać,
- przepisywać do tagów,
- przepisywać do metafields,
- pomijać,
- oznaczać jako wymagające ręcznej decyzji.

## Wariants i struktura wielu wierszy

CSV Shopify wymaga obsługi wariantów przez powtarzalne wiersze produktu. To znaczy, że aplikacja musi rozumieć różnicę między:

- produktem głównym,
- wariantem,
- opcją wariantu,
- obrazem głównym produktu,
- obrazem wariantu,
- polami wspólnymi,
- polami tylko dla konkretnego wariantu.

Jeśli API zwraca atrybuty typu kolor, rozmiar, pojemność albo inny podział wariantów, aplikacja musi umieć przekształcić to do modelu `Option1`, `Option2`, `Option3` w CSV.

## Widok porównania

Jednym z najważniejszych ekranów aplikacji powinien być widok porównawczy.

Aplikacja ma pokazywać:

- co przyszło z API,
- jak zostało znormalizowane,
- jak wygląda wynikowy rekord albo zestaw rekordów CSV,
- które pola są poprawnie zmapowane,
- które pola są puste,
- które pola wymagają ręcznego uzupełnienia,
- które pola nie mają jeszcze reguły mapowania.

Najbardziej praktyczny układ to tabela typu:

- pole API,
- wartość z API,
- docelowa kolumna Shopify CSV,
- wynik po mapowaniu,
- status,
- uwaga / reguła.

## Selektywność danych

Tu warto od razu przewidzieć kilka poziomów kontroli.

Na pierwszym poziomie użytkownik może zaznaczyć cały katalog zmian. Na drugim poziomie może zaznaczyć wiele produktów przez checkboxy. Na trzecim poziomie może wejść w pojedynczy produkt i zaznaczyć tylko konkretne pola do przeliczenia lub uwzględnienia.

Dodatkowo przy pojedynczym produkcie warto wspierać selekcję fragmentów danych, na przykład:

- tylko opisy,
- tylko media,
- tylko ceny,
- tylko warianty,
- tylko SEO,
- tylko wybrane metafields.

To jest ważne, bo nie zawsze chcesz przeliczać lub nadpisywać cały produkt.

## Selekcja synchronizacji

W UI powinieneś przewidzieć co najmniej cztery tryby działań:

- **Export all** — wszystko, co zostało poprawnie zmapowane.
- **Export selected products** — tylko zaznaczone produkty.
- **Export selected fields** — tylko wybrane pola w obrębie jednego produktu.
- **Preview only** — tylko analiza i porównanie bez generowania finalnego wyniku.

To daje pełną kontrolę operacyjną i minimalizuje ryzyko przypadkowego przygotowania złych danych do importu.

## Widoki w aplikacji

W panelu warto mieć kilka głównych ekranów:

- **Dashboard** — liczba produktów nowych, zmienionych i problematycznych.
- **Search & Filter** — wyszukiwarka po SKU, nazwie, ID i statusie mapowania.
- **API Source List** — lista rekordów pobranych z API.
- **Product Detail** — szczegóły jednego produktu w widoku źródłowym.
- **Mapping Preview** — podgląd mapowania pola po polu.
- **CSV Preview** — wynikowy układ wierszy zgodny z szablonem Shopify CSV.
- **Diff List** — tabela różnic i braków.
- **Export Queue** — kolejka rekordów do eksportu.
- **Logs** — historia operacji i błędów.

Taki podział sprawi, że aplikacja będzie czytelna nawet przy dużej liczbie produktów.

## Wyszukiwanie i pobieranie danych

Dokumentacja API pokazuje ważne ograniczenie: API nie wspiera parametru `search`. To oznacza, że aplikacja musi zastosować trzyetapowy przepływ:

1. pobrać lekką listę produktów, np. `id`, `sku`, `name`,
2. przefiltrować ją lokalnie po nazwie lub SKU,
3. po wyborze produktu pobrać jego pełne dane po `id`.

Jeśli endpoint listy jest stronicowany, aplikacja musi pobierać kolejne strony do momentu osiągnięcia pełnej listy albo do wyczerpania `meta.total`.

## Walidacja danych

Przed eksportem CSV aplikacja powinna walidować co najmniej:

- obecność pól wymaganych dla Shopify,
- poprawność struktury wariantów,
- poprawność cen,
- poprawność URL-i obrazów,
- zgodność wag i jednostek,
- spójność `handle` między wierszami jednego produktu,
- kompletność danych SEO, jeśli są wymagane,
- kompletność kolumn, które mają trafić do importu.

Każdy błąd powinien mieć status i czytelny komunikat, nie tylko czerwony znacznik.

## Faza wdrożenia

Najlepiej wdrażać to etapami.

### Etap 1 — odczyt i analiza

- podłączenie do API,
- pobranie lekkiej listy produktów,
- widok listy i wyszukiwarki,
- widok szczegółów produktu,
- zapis surowych danych do source model.

### Etap 2 — normalizacja

- zbudowanie normalized model,
- ujednolicenie struktury danych,
- rozdzielenie pól wspólnych, wariantowych i technicznych,
- przygotowanie do mapowania.

### Etap 3 — mapowanie do CSV

- stworzenie reguł mapowania,
- budowanie wierszy CSV,
- obsługa wariantów,
- obsługa braków i wyjątków,
- preview wynikowego CSV.

### Etap 4 — diff i akceptacja

- widok API vs mapping vs CSV,
- checkboxy i selekcja pól,
- eksport wybranych rekordów,
- logowanie statusów.

### Etap 5 — późniejsza rozbudowa

- integracja z Shopify Admin API,
- zapis historii synchronizacji,
- potencjalny import zwrotny lub porównanie z danymi już istniejącymi w Shopify,
- automatyzacja inkrementalnych aktualizacji.

## Plan pod Shopify API

Na teraz możesz budować apkę bez pełnej integracji z Shopify Admin API, ale projektuj ją tak, jakby integracja miała dojść później.

W przyszłości connector Shopify powinien umieć:

- pobrać produkty z Shopify,
- pobrać metafields,
- pobrać media,
- porównać dane Shopify z przygotowanym modelem CSV,
- wykryć rozjazdy między API, CSV i Shopify,
- wysłać aktualizacje tylko dla wybranych rekordów i pól.

Na pierwszym etapie jednak najważniejsze jest przygotowanie poprawnego modelu przejścia **API -> normalized model -> Shopify CSV**.

## Shopify połączenie

Gdy przyjdzie czas na integrację z Shopify Admin API, aplikacja będzie potrzebować dostępu do Shopify Admin API i tokenu autoryzacyjnego. Najpierw konfiguruje się uprawnienia aplikacji, a potem wykonuje zapytania do GraphQL Admin API.

Do testów można używać GraphiQL, ale w pierwszej wersji projektu bardziej praktyczny będzie stabilny eksport CSV zgodny ze strukturą importową Shopify.

## Standard dokumentacyjny projektu

W dokumentacji aplikacji warto trzymać osobno:

- opis endpointów API,
- mapę pól API -> normalized model,
- mapę normalized model -> Shopify CSV,
- listę pól wymaganych,
- listę pól opcjonalnych,
- listę wyjątków i reguł ręcznych,
- checklistę walidacji przed eksportem.

To pozwoli rozwijać narzędzie bez chaosu i bez gubienia logiki mapowania.

## Nazwa projektu

Docelowa nazwa tej aplikacji to **Shopify Integrator**.
