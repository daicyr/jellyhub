<div align="center">
    <img src="./public/icon.png" alt="JellyHub Logo" width="100"/>
        <h1>
            JellyHub
        </h1>
        <h3>The jellyfin servers media indexer</h3>
</div>
<br>

<h2>About the project</h2>
JellyHub is a web app that allow you to fetch media from all of your jellyfin servers and regroup it in one place, so there is one place to search for specific media and tells you on wich server the desired media is located.

<br>
<h2>Installation</h2>

To test the source locally with Docker Compose, copy `.env.example` to `.env`,
generate `AUTH_SECRET` and `SECRET_KEY` with `openssl rand -base64 32`, set
`ALLOW_SIGNUP=true`, then run:

```sh
docker compose up -d --build
```

Open http://localhost:3000 to create an account. If port 3000 is already in use,
set `APP_PORT=3001` and `APP_URL=http://localhost:3001` in `.env`.
Compose starts PostgreSQL with a
persistent volume and applies migrations before starting the app. Set
`POSTGRES_PASSWORD` in `.env`; keep the same password in `DATABASE_URL` if you
also run the app directly with Bun. Compose uses the `postgres` hostname
internally, while local Bun commands use `localhost` from `DATABASE_URL`.

Stop the services with `docker compose down`; the database volume is preserved.

To be able to run JellyHub, first you must have **[Docker](https://www.docker.com/)** installed on your system.
<br>

JellyHub requires a PostgreSQL database. Create a database and user, then set
`DATABASE_URL` to a PostgreSQL connection URL reachable from the app container,
such as `postgresql://jellyhub:password@your-postgres-host:5432/jellyhub`.
Persist the data on the PostgreSQL server.

Then you can run the app with the following command, make sure to replace the `AUTH_SECRET` and `SECRET_KEY` values with valid ones (You can generate a key for each with `openssl rand -base64 32`).

```sh
docker run -d --name jellyhub \
        -e DATABASE_URL=postgresql://jellyhub:password@your-postgres-host:5432/jellyhub \
        -e ALLOW_SIGNUP=false \
        -e AUTH_SECRET= \
        -e APP_URL=http://localhost:3000 \
        -e SECRET_KEY= \
        --restart unless-stopped \
        -p 3000:3000 \
        zigleur/jellyhub:latest
```

Now you can access the app at http://localhost:3000 _(adapt the host and port depending on how you configured it)_

The container applies PostgreSQL migrations automatically at startup. Existing
SQLite migrations are retained in `drizzle/`; PostgreSQL migrations are stored in
`drizzle/postgresql/`. These migrations create the PostgreSQL schema; they do not
transfer data from an existing SQLite database.

For local development, install Bun, copy `.env.example` to `.env`, fill in the
connection URL and secrets, then run:

```sh
bun install --frozen-lockfile
bun run db:migrate
bun run dev
```

After changing the schema, run `bun run db:generate` to generate a PostgreSQL
migration and `bun run db:migrate` to apply it.

<details>

<summary><h2>Screenshots</h2></summary>

Home Page
![Screenshot_0](./.github/README/home_page.png)

Movies Pages
![Screenshot_1](./.github/README/movies_page.png)

TV Shows Pages
![Screenshot_2](./.github/README/tv-shows_page.png)

Albums Pages
![Screenshot_3](./.github/README/albums_page.png)

Movie Details Dialog
![Screenshot_4](./.github/README/movie_details.png)

TV Show Details Dialog
![Screenshot_5](./.github/README/tv-show_details.png)

Album Details Dialog
![Screenshot_6](./.github/README/album_details.png)

Servers List
![Screenshot_7](./.github/README/servers_list.png)

Users List
![Screenshot_8](./.github/README/users_list.png)

SSO List
![Screenshot_9](./.github/README/sso_list.png)

Login Page
![Screenshot_7](./.github/README/login_page.png)

</details>
