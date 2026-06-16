# Jak to uruchomić?

Po pierwsze, upewnij się, że masz zainstalowany [Bun.js](https://bun.sh/).

Po drugie, upewnij się, że masz zainstalowany [Docker Desktop](https://docs.docker.com/desktop/), bądź jakąkolwiek inną formę docker'a umożliwiającą uruchomienie `docker-compose`.

Następnie w terminalu wykonuj poniższe polecenia:

- pobierz repozytorium
```bash
git clone https://github.com/afedaruk/bookstore.git
cd bookstore
```

- stwórz i uruchom bazę danych
```bash
docker-compose up -d
```

- zainstaluj zależności
```bash
bun i
```

- wykonaj migracje do bazy danych
```bash
bun run db:push
```

- (opcjonalnie) uruchom automatyczne testy
```bash
bun test
```

- (opcjonalnie) wypełnij bazę danych przykładowymi danymi
```bash
bun run db:seed
```

- uruchom aplikacje
```bash
bun run start
```

W tym momencie w terminalu powinien wypisać się następujący tekst:
```
Started development server: http://localhost:3000
```

Aby przetestować działanie aplikacji udaj się na stronę `http://localhost:3000/ui`.

Natomiast na stronie `http://localhost:3000/doc` znajdziesz dokumentację openapi w formie JSON'a.
