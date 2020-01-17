# DBK Redux API

An open-source RESTful API for retrieving article and other content published by The Diamondback
Newspaper.

## Environment Variables

Environment variables are primarily loaded through a `.env` file, but can also be specified through
the command line. Command line variables take higher priority.

Variables are indicated whether or not they are necessary for development (and consequently
production).

| Variable | Description | Development?
|-|-|-|
| `PORT` | Port for server to listen to (default is `8080`) | `true` |
| `PRIVATE_KEY_PATH` | Path to a private key for an SSL certificate | `false` |
| `CERTIFICATE_PATH` | Path to a certificate file for an SSL certificate | `false` |
| `REDIS_HOST` | Host for a Redis database | `false` |
| `REDIS_PORT` | Port for the Redis database | `false` |
| `REDIS_PASSWORD` | Password for accessing the Redis database | `false`
| `DB_HOST` | Hostname for a MySQL instance (for salary data) | `true`
| `DB_PORT`| Port the MySQL instance is listening on | `true`
| `DB_NAME` | Name of the database on the MySQL instance to access | `true`
| `DB_USER` | Username for logging onto the MySQL instance | `true`
| `DB_PASSWORD` | Password for logging onto the MySQL instance | `true`

### MySQL

Since the MySQL variables _are_ development variables, you'll have to connect to your own MySQL
database; either remotely, such as AWS RDS, or locally through [MySQL Community Server](https://dev.mysql.com/downloads/mysql/).

## Development

Run `npm run dev`, which will start the server, with environment variables imported from the `.env`
file.

## Documentation

REST endpoints are documented via [Swagger UI](https://swagger.io/tools/swagger-ui/) and are
provided by the `/docs` endpoint when the server is running. (The `/` endpoint will also redirect
to the documentation)
