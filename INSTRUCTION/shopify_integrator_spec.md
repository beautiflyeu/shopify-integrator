# Shopify Integrator

## Zarys aplikacji

Ta aplikacja ma być lokalnym narzędziem typu **Shopify Integrator**. Jej zadaniem nie jest budowanie sklepu, tylko pobieranie danych produktowych z zewnętrznego API, mapowanie ich do struktury Shopify i pozwalanie na kontrolowane publikowanie danych do sklepu.

Aplikacja ma wspierać dwa równoległe wyjścia publikacji:

- **Eksport do CSV Shopify** — do ręcznego importu przez panel Shopify.
- **Publikację przez Shopify Admin API** — do bezpośredniego tworzenia i aktualizacji produktów bez użycia pliku CSV.

Na start aplikacja może działać lokalnie jako localhost, a później zostać wdrożona jako normalna aplikacja webowa.

## Tech Stack

### Warstwa aplikacji

- **Framework:** Next.js
- **Język:** TypeScript
- **Architektura routingu:** App Router
- **Backend w aplikacji:** Route Handlers lub Server Actions do komunikacji z API źródłowym i Shopify

### UI i design system

- **Stylowanie:** Tailwind CSS
- **Komponenty UI:** shadcn/ui
- **Tabela i selekcja rekordów:** TanStack Table
- **Formularze:** React Hook Form
- **Walidacja formularzy i schematów:** Zod
- **Ikony:** Lucide

### Stan i logika klienta

- **Stan lokalny UI:** Zustand
- **Cache i fetch po stronie klienta:** TanStack Query, jeśli pojawi się potrzeba odświeżania i cache’owania większej liczby widoków

### Dane i trwałość

- **Baza danych aplikacji:** SQLite na start lub PostgreSQL po wdrożeniu
- **ORM:** Prisma albo Drizzle
- **Tabele pomocnicze:** sync state, export history, publish jobs, mapping rules, error logs

### Integracje

- **Źródło danych produktów:** Beautifly API
- **Kanał publikacji 1:** eksport CSV zgodny z Shopify product import template
- **Kanał publikacji 2:** Shopify Admin API

### Narzędzia developerskie

- **Środowisko pracy:** Visual Studio Code
- **Kontrola wersji:** Git + GitHub
- **Uruchamianie lokalne:** localhost
- **Docelowy model pracy:** lokalny development, review w integratorze, potem eksport CSV albo push do Shopify API

## Główne moduły

Aplikacja powinna składać się z następujących modułów:

- **API connector** — pobiera dane z zewnętrznego API produktowego.
- **Normalizer** — zamienia dane źródłowe na wspólny model wewnętrzny.
- **Mapper** — przekształca strukturę API do modelu danych zgodnego z Shopify.
- **CSV builder** — buduje finalny układ rekordów i wariantów do eksportu.
- **Shopify API publisher** — wysyła zatwierdzone dane bezpośrednio do Shopify Admin API.
- **Diff viewer** — pokazuje różnice między danymi źródłowymi, modelem po mapowaniu i stanem docelowym.
- **Preview layer** — pozwala porównać dane API, znormalizowany model, wynik CSV i docelowy payload publikacji.
- **Sync / export queue** — zarządza kolejką rekordów do przeliczenia, zatwierdzenia i publikacji.

Do tego warto dodać moduły pomocnicze: logi, historia przeliczeń, mapa pól, statusy rekordów i walidacja błędów.

## Proponowany stack

Najlepszym wyborem będzie Next.js jako pełna aplikacja full-stack. Dostajesz wtedy UI, backendowe endpointy, możliwość pracy lokalnej i prostą ścieżkę do deploymentu później.

Do interakcji z tabelami, selekcją rekordów i porównaniami dobrze sprawdza się podejście oparte na:

- tabeli z row selection,
- panelu szczegółów produktu,
- panelu diffów pól,
- widoku preview CSV,
- widoku preview payloadu do Shopify API,
- lokalnym store dla filtrów, zaznaczeń i stanu synchronizacji.

## Zewnętrzne źródła danych

Aplikacja ma korzystać z dwóch głównych źródeł wejściowych.

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

### 3. Shopify Admin API

Trzecim źródłem referencyjnym i docelowym kanałem publikacji jest Shopify Admin API. Ten kanał ma służyć do bezpośredniego tworzenia, aktualizowania i synchronizacji produktów bez potrzeby ręcznego importu CSV.

W modelu docelowym aplikacja ma umieć:

- pobierać dane istniejące w Shopify,
- porównywać je z modelem pochodzącym z API źródłowego,
- przygotowywać payloady do publikacji,
- wysyłać wybrane zmiany do Shopify,
- rejestrować rezultat publikacji.

## Jak aplikacja działa

Na poziomie użytkowym flow powinien być prosty i przewidywalny:

1. Uruchamiasz aplikację lokalnie.
2. Wybierasz tryb pracy: pełny import, import zmian od daty albo pojedynczy produkt.
3. Aplikacja pobiera dane z API.
4. System normalizuje dane do wspólnego modelu wewnętrznego.
5. Mapper podstawia wartości pod model Shopify.
6. Aplikacja pokazuje porównanie: dane z API vs model po mapowaniu vs wynik publikacji.
7. Zaznaczasz produkty lub konkretne pola do uwzględnienia.
8. Wybierasz kanał wyjścia: CSV albo Shopify API.
9. Zatwierdzasz eksport lub publikację.
10. Aplikacja zapisuje historię, status i rezultat walidacji.

## Tryby pracy

W pierwszej wersji aplikacja powinna obsługiwać trzy tryby pobierania danych:

- **Full import** — pobranie całego katalogu z API i przeliczenie całości.
- **Import zmian** — pobranie tylko produktów zmienionych od wskazanej daty przez `updated_since`.
- **Pojedynczy produkt** — pobranie jednego produktu po ID albo przez wybór z listy wyszukiwania.

Niezależnie od sposobu pobrania danych użytkownik powinien mieć dwa tryby publikacji:

- **Export to CSV** — przygotowanie pliku importowego Shopify.
- **Push to Shopify API** — bezpośrednie wysłanie zatwierdzonych danych do sklepu.

## Model danych wewnętrznych

Warto od początku rozdzielić cztery poziomy danych:

- **Source model** — surowa odpowiedź z API.
- **Normalized model** — wewnętrzny model aplikacji, uproszczony i przewidywalny.
- **Shopify CSV row model** — końcowy układ rekordów gotowych do eksportu do CSV.
- **Shopify API publish model** — końcowy model danych gotowy do wysłania przez Shopify Admin API.

To bardzo ważne, bo API źródłowe, CSV Shopify i payloady Shopify API mają różne struktury i różne ograniczenia.

## Mapowanie API do Shopify

Środek całej aplikacji powinien stanowić mapper pól. To on odpowiada za przekształcenie danych wejściowych do docelowego układu danych.

Przykładowe obszary mapowania:

- `main_details` → `Title`, `SKU`, podstawowe pola produktu,
- `description_data` → `Description`, `SEO title`, `SEO description`,
- `media` → obrazy produktu, obrazy wariantów, alt text,
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

## Dwa kanały publikacji

### 1. Publikacja przez CSV

Ten tryb służy do przygotowania poprawnego pliku importowego Shopify. Użytkownik przegląda wynik, zatwierdza go i pobiera gotowe CSV do ręcznego importu w panelu sklepu.

Zalety tego trybu:

- bezpieczny start,
- łatwy audyt danych,
- szybka kontrola mapowania,
- prostsze wdrożenie pierwszej wersji.

### 2. Publikacja przez Shopify Admin API

Ten tryb służy do bezpośredniego wysłania danych do Shopify bez używania pliku CSV. Użytkownik przegląda różnice, wybiera rekordy i zatwierdza publikację, a aplikacja wysyła dane do sklepu przez API.

Zalety tego trybu:

- brak ręcznego importu,
- szybsza aktualizacja pojedynczych produktów,
- możliwość inkrementalnych aktualizacji,
- potencjał do pełnej synchronizacji w przyszłości.

## Wariants i struktura wielu rekordów

CSV Shopify wymaga obsługi wariantów przez powtarzalne wiersze produktu. Shopify API również wymaga zrozumienia relacji między produktem głównym, wariantami, opcjami i mediami.

Aplikacja musi rozumieć różnicę między:

- produktem głównym,
- wariantem,
- opcją wariantu,
- obrazem głównym produktu,
- obrazem wariantu,
- polami wspólnymi,
- polami tylko dla konkretnego wariantu.

Jeśli API zwraca atrybuty typu kolor, rozmiar, pojemność albo inny podział wariantów, aplikacja musi umieć przekształcić to zarówno do modelu CSV, jak i do modelu publikacji API.

## Widok porównania

Jednym z najważniejszych ekranów aplikacji powinien być widok porównawczy.

Aplikacja ma pokazywać:

- co przyszło z API,
- jak zostało znormalizowane,
- jak wygląda wynikowy rekord albo zestaw rekordów CSV,
- jak wygląda wynikowy payload do Shopify API,
- które pola są poprawnie zmapowane,
- które pola są puste,
- które pola wymagają ręcznego uzupełnienia,
- które pola nie mają jeszcze reguły mapowania.

Najbardziej praktyczny układ to tabela typu:

- pole API,
- wartość z API,
- docelowe pole Shopify,
- wynik po mapowaniu,
- kanał publikacji: CSV / API / oba,
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

To jest ważne, bo nie zawsze chcesz przeliczać lub publikować cały produkt.

## Selekcja działań

W UI powinieneś przewidzieć co najmniej pięć trybów działań:

- **Preview only** — tylko analiza i porównanie bez generowania finalnego wyniku.
- **Export all to CSV** — wszystko, co zostało poprawnie zmapowane.
- **Export selected products to CSV** — tylko zaznaczone produkty.
- **Push selected products to Shopify API** — bezpośrednia publikacja zaznaczonych produktów.
- **Push selected fields to Shopify API** — publikacja tylko wybranych pól w obrębie jednego produktu.

To daje pełną kontrolę operacyjną i minimalizuje ryzyko przypadkowego przygotowania albo opublikowania złych danych.

## Widoki w aplikacji

W panelu warto mieć kilka głównych ekranów:

- **Dashboard** — liczba produktów nowych, zmienionych i problematycznych.
- **Search & Filter** — wyszukiwarka po SKU, nazwie, ID i statusie mapowania.
- **API Source List** — lista rekordów pobranych z API.
- **Product Detail** — szczegóły jednego produktu w widoku źródłowym.
- **Mapping Preview** — podgląd mapowania pola po polu.
- **CSV Preview** — wynikowy układ wierszy zgodny z szablonem Shopify CSV.
- **API Publish Preview** — podgląd tego, co zostanie wysłane do Shopify API.
- **Diff List** — tabela różnic i braków.
- **Export / Publish Queue** — kolejka rekordów do eksportu albo publikacji.
- **Logs** — historia operacji i błędów.

## Wyszukiwanie i pobieranie danych

Dokumentacja API pokazuje ważne ograniczenie: API nie wspiera parametru `search`. To oznacza, że aplikacja musi zastosować trzyetapowy przepływ:

1. pobrać lekką listę produktów, np. `id`, `sku`, `name`,
2. przefiltrować ją lokalnie po nazwie lub SKU,
3. po wyborze produktu pobrać jego pełne dane po `id`.

Jeśli endpoint listy jest stronicowany, aplikacja musi pobierać kolejne strony do momentu osiągnięcia pełnej listy albo do wyczerpania `meta.total`.

## Walidacja danych

Przed eksportem CSV albo publikacją przez Shopify API aplikacja powinna walidować co najmniej:

- obecność pól wymaganych dla Shopify,
- poprawność struktury wariantów,
- poprawność cen,
- poprawność URL-i obrazów,
- zgodność wag i jednostek,
- spójność `handle` lub identyfikatora produktu między rekordami,
- kompletność danych SEO, jeśli są wymagane,
- kompletność pól, które mają trafić do wybranego kanału publikacji,
- gotowość danych do publikacji API,
- brak konfliktów między danymi źródłowymi a stanem docelowym.

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

### Etap 3 — mapowanie do Shopify

- stworzenie reguł mapowania,
- budowanie modelu CSV,
- budowanie modelu publikacji API,
- obsługa wariantów,
- obsługa braków i wyjątków,
- preview wyników dla obu kanałów.

### Etap 4 — diff i akceptacja

- widok API vs mapping vs CSV vs API publish,
- checkboxy i selekcja pól,
- eksport wybranych rekordów,
- przygotowanie publikacji API,
- logowanie statusów.

### Etap 5 — publikacja do Shopify

- podłączenie do Shopify Admin API,
- konfiguracja tokenu i uprawnień,
- publikacja pojedynczych produktów,
- publikacja wybranych pól,
- zapis rezultatów publikacji.

### Etap 6 — późniejsza rozbudowa

- zapis historii synchronizacji,
- porównanie z danymi już istniejącymi w Shopify,
- automatyzacja inkrementalnych aktualizacji,
- potencjalny tryb pełnej synchronizacji dwukierunkowej.

## Plan pod Shopify API

Na pierwszym etapie możesz budować apkę z bezpiecznym wyjściem CSV, ale architektura od początku ma wspierać także publikację bezpośrednią przez Shopify Admin API.

W przyszłości connector Shopify powinien umieć:

- pobrać produkty z Shopify,
- pobrać metafields,
- pobrać media,
- porównać dane Shopify z przygotowanym modelem,
- wykryć rozjazdy między API źródłowym, CSV i Shopify,
- wysłać aktualizacje tylko dla wybranych rekordów i pól,
- zwrócić status publikacji do interfejsu integratora.

## Shopify połączenie

Gdy przyjdzie czas na integrację z Shopify Admin API, aplikacja będzie potrzebować dostępu do Shopify Admin API i tokenu autoryzacyjnego. Najpierw konfiguruje się uprawnienia aplikacji, a potem wykonuje zapytania do GraphQL Admin API.

W praktyce oznacza to dwa niezależne wyjścia biznesowe aplikacji:

- **CSV workflow** — przygotowujesz plik i importujesz go ręcznie do Shopify.
- **API workflow** — przygotowujesz dane i publikujesz je bezpośrednio do Shopify z poziomu integratora.

## Standard dokumentacyjny projektu

W dokumentacji aplikacji warto trzymać osobno:

- opis endpointów API,
- mapę pól API -> normalized model,
- mapę normalized model -> Shopify CSV,
- mapę normalized model -> Shopify API publish model,
- listę pól wymaganych,
- listę pól opcjonalnych,
- listę wyjątków i reguł ręcznych,
- checklistę walidacji przed eksportem,
- checklistę walidacji przed publikacją API.

To pozwoli rozwijać narzędzie bez chaosu i bez gubienia logiki mapowania.

## Nazwa projektu

Docelowa nazwa tej aplikacji to **Shopify Integrator**.