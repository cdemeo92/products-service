# Products Service

[semantic-release: 📦🚀](https://github.com/semantic-release/semantic-release)
[Conventional Commits](https://conventionalcommits.org)
[purchase-cart-service:latest](https://github.com/cdemeo92/products-service/pkgs/container/products-service)

NestJS backend microservice for an e-commerce platform to manage products in the database.

## Requirements & scope

**Objective:** Build a NestJS microservice that manages products for an e-commerce platform, using Sequelize as the ORM and MySQL as the database. The service exposes CRUD over products with validation, error handling, and pagination for listing.

## Assumptions

- The project is runnable with a single command (e.g. `docker compose up`); that setup starts MySQL and the app and provisions the database and schema.
- The application can be run as a single container (or process) by configuring env vars to connect to an existing MySQL; the user ensures the database and schema exist (see docs).
- Authentication or authorization are out of scope.
- `productToken` is the unique business identifier and idempotency key for a product (client-provided in create). Duplicate `productToken` on create → 409 Conflict.

## Potential evolutions

To make this service robust and production-ready, the following would be added or extended:

- **Security** – Authentication and authorization (e.g. JWT or API keys) and HTTPS only.

## Project structure

This project follows a **hexagonal architecture** (also known as ports and adapters) to ensure business logic remains independent from frameworks and infrastructure. The core application layer (`application/`) is completely reusable and can be integrated with different databases or HTTP frameworks by simply swapping adapters in the `infrastructure/` layer. This separation provides better testability, maintainability, and flexibility for future changes.

```
├── postman/
│   └── Products-Service.postman_collection.json   Postman collection (all API scenarios)
├── src/
│   ├── application/          Core business logic (framework-agnostic)
│   │   ├── domain/           Domain layer
│   │   │   ├── entities/     Domain entities (Order, Product, OrderItem)
│   │   │   ├── exceptions/   Domain exceptions
│   │   │   └── value-objects/ Value objects (Money)
│   │   ├── ports/            Interfaces (repository and HTTP server contracts)
│   │   └── use-cases/        Application use cases
│   ├── infrastructure/       Infrastructure adapters
│   │   ├── repositories/     Sequelize based repository implementations
│   │   ├── database/         MySQL database initialization
│   │   └── adapters/
│   │       └── nest/         Nest HTTP adapter
│   └── main.ts               Composition root
├── test/
│   ├── unit/                 Unit tests (business logic)
│   ├── integ/                Integration tests (component integration)
│   └── e2e/                  End-to-end tests (full flows)
```

## Testing strategy

- **Unit tests** (`test/unit/`) — Fast, focused tests that cover domain entities, value objects, use cases, and adapters. They give quick feedback on business rules and edge cases without starting the full stack.
- **Integration tests** (`test/integ/`) — Use a real SQLite database and real repositories. They verify that the use case and persistence layer work together.
- **E2E tests** (`test/e2e/`) — Hit the real HTTP API. They validate the full stack from request to response.
- **Smoke test** (CI, after deploy) — A single request to the root URL to confirm the deployed container is up.

## Live demo

The project is deployed automatically via [GitHub Actions](https://github.com/cdemeo92/products-service/actions) on every release to `main`. A live instance is available at **[https://products-service-production.up.railway.app/](https://products-service-production.up.railway.app/)**. The root URL redirects to `/docs`, where you can try the API interactively (Swagger UI).

## Demo

With [Docker](https://docs.docker.com/engine/install/) installed, from the project root:

```bash
./scripts/run.sh      # build all Docker Compose assets and start the full stack (app + DB) with default configuration
./scripts/tests.sh    # build image and run all test suites in the container (unit, integ, e2e)
```

> **Note:** The first image build may take up to a minute while Node dependencies are installed.

**Customizing configuration via environment variables:**

You can override the default port, and database parameters using environment variables.

E.g.:
```bash
# Custom port
PORT=8080 ./scripts/run.sh
```

For the full list of supported variables, see [Environment variables](#environment-variables) below. 

## Usage

**API Documentation**: Once the service is running, interactive API documentation is available at `http://localhost:3000/docs` (Swagger UI). You can explore endpoints, view request/response schemas, and test the API directly from the browser.

Use an HTTP client such as [Postman](https://www.postman.com/) or `curl` to call the API. A **Postman collection** with all scenarios is available in [`postman/Products-Service.postman_collection.json`](./postman/Products-Service.postman_collection.json). Import it into Postman and set the `baseUrl` variable to `http://localhost:3000` (default) if needed. 
With the service running (e.g. on `http://localhost:3000`), you can try the following cases.

## Getting started

### Local Developmenet

#### (Optional) Dev Container

1. **Open the project** in VS Code or Cursor
2. **Open the Command Palette** (⇧⌘P on macOS, Ctrl+Shift+P on Windows/Linux) and run `Dev Containers: Rebuild and Reopen in Container`
3. **Wait for the container to build** – everything is set up automatically:
   - The container builds with all required tools preinstalled
   - Dependencies are installed automatically via `npm ci` (postCreateCommand; runs on first open)
   - No manual configuration is required – the container is fully preconfigured and ready to use

##### Benefits

- **Consistent environment across all developers** – everyone works in the same setup
- **Matches production environment** – the Dev Container uses the same `node:24` image as Docker, so local development matches the production environment
- **No local tool installation required** – you don't need to install Node.js, npm, or other tools; everything is preconfigured in the container
- **Isolated from system dependencies** – avoids conflicts with other projects or system packages

#### Installation

##### Prerequisites

- **[Node.js](https://nodejs.org/en)** >= 24  
- **npm** >= 11  
- [Docker](https://docs.docker.com/engine/install/)

##### 1. Clone and install

```bash
git clone https://github.com/cdemeo92/products-service.git
cd purchase-cart-service
npm i
```

##### 2. Start the DB

(TBD)

##### 3. Build and run

```bash
TBD: set env var
npm run build
npm start
```

### 4. Run tests

```bash
npm run test
npm run test:integ
npm run test:e2e
npm run test:all
```

#### Scripts

| Script | Description |
|--------|-------------|
| `npm run build` | Compile TypeScript to `dist/` |
| `npm start` | Run the app (`node dist/index.js`) |
| `npm test` | Run unit tests with Jest |
| `npm run test:integ` | Run integration tests |
| `npm run test:e2e` | Run E2E tests |
| `npm run test:all` | Run unit, integ, and e2e in sequence |
| `npm run test:ci` | Unit tests with coverage and JUnit output |
| `npm run lint` | Lint and fix with ESLint |
| `npm run format` | Format with Prettier |
| `npm run format:check` | Check formatting |

## Environment variables

| Variable | Description | Default |
|----------|-------------|---------|
| `PORT` | HTTP server port | `3000` |

## Tech stack

- [TypeScript](https://www.typescriptlang.org/), [Node.js](https://nodejs.org/)
- [NestJS](https://nestjs.com/)
- [Sequelize](https://sequelize.org/)
- [MySQL](https://www.mysql.com/)
- [Docker](https://docs.docker.com/)
- [GitHub Actions](https://docs.github.com/en/actions)

## Conventions

- [Conventional Commits](https://www.conventionalcommits.org/).
- Versions and changelog: [Semantic Release](https://github.com/semantic-release/semantic-release).

## License

ISC