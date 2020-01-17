# DBK Redux API

The open-source RESTful API for retrieving article and other content published by The Diamondback
Newspaper, powering the [DBK News](https://dbknews.com).

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
| `REDIS_PASSWORD` | Password for accessing the Redis database | `false` |
| `DB_HOST` | Hostname for a MySQL instance (for salary data) | `true` |
| `DB_PORT`| Port the MySQL instance is listening on | `true` |
| `DB_NAME` | Name of the database on the MySQL instance to access | `true` |
| `DB_USER` | Username for logging onto the MySQL instance | `true` |
| `DB_PASSWORD` | Password for logging onto the MySQL instance | `true` |

### SSL Certificate

Since we want HTTPS enabled in production, we provide paths to our SSL certificate files.
The `https` module allows us to create a server with a certificate and our Express application.

HTTPS is not necessary for development purposes, but you can provide your own SSL certificate if
you choose to.

### MySQL

Since the MySQL variables _are_ development variables, you'll have to connect to your own MySQL
database; either remotely, such as AWS RDS, or locally through [MySQL Community Server](https://dev.mysql.com/downloads/mysql/).

#### Table Structure

Every table in the database should follow the name format `YYYYData`, and has the following fields:

| Field | Type | Null | Default |
|-|-|-|-|
| `Employee` | `varchar` | YES | `NULL` |
| `Department` | `varchar` | YES | `NULL` |
| `Division` | `varchar` | YES | `NULL` |
| `Title` | `varchar` | YES | `NULL` |
| `Salary` | `varchar` | YES | `NULL` |

### Redis

We use [Redis](https://redis.io/) in production for caching queries. For example, the front page
of our news site fetches a lot of article data by hitting this API's endpoints. Having the API cache
those common queries allows us to server content much quicker to our readers.

Each cached result expires after a set amount of time (in seconds), and the expiration timer depends
on what the request was. For example, a featured article will be cached for 60 seconds, while a
normal article for 30 seconds.

Because Redis is strictly used for caching, it is not necessary for development purposes and thus
disabled. If you wish to use Redis in development, you will have to provide your own Redis
configuration through environment variables (hostname, port, and password). If any of the variables
for Redis configuration/authentication are missing, then the Redis client will be (loosely) mocked.

## Development

Run `npm run dev`, which will start the server, with environment variables imported from the `.env`
file.

## Documentation

REST endpoints are documented via [Swagger UI](https://swagger.io/tools/swagger-ui/) and are
provided by the `/docs` endpoint when the server is running. (The `/` endpoint will also redirect
to the documentation).
