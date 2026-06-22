# NexCV — Engineering Rules & Standards

> **Authority:** These rules are mandatory for all contributors across `nexcv-application`, `nexcv-portal`, and `nexcv-backend`. No exceptions without a written ADR (Architecture Decision Record).

---

## Table of Contents

1. [Coding Standards](#1-coding-standards)
2. [Architecture Standards](#2-architecture-standards)
3. [Folder Structure Standards](#3-folder-structure-standards)
4. [Naming Conventions](#4-naming-conventions)
5. [Git Commit Standards](#5-git-commit-standards)
6. [Branching Strategy](#6-branching-strategy)
7. [API Design Standards](#7-api-design-standards)
8. [Security Guidelines](#8-security-guidelines)
9. [Logging Standards](#9-logging-standards)
10. [Error Handling Standards](#10-error-handling-standards)
11. [Database Standards](#11-database-standards)
12. [Testing Standards](#12-testing-standards)
13. [Documentation Standards](#13-documentation-standards)
14. [Flutter Best Practices](#14-flutter-best-practices)
15. [Angular Best Practices](#15-angular-best-practices)
16. [Spring Boot Best Practices](#16-spring-boot-best-practices)
17. [Firebase Integration Standards](#17-firebase-integration-standards)
18. [Clean Architecture Rules](#18-clean-architecture-rules)
19. [Riverpod Rules](#19-riverpod-rules)
20. [Code Review Checklist](#20-code-review-checklist)
21. [Performance Guidelines](#21-performance-guidelines)
22. [Production Release Guidelines](#22-production-release-guidelines)

---

## 1. Coding Standards

### General (All Languages)

- Every file must have a single, clear responsibility.
- Maximum file length: **400 lines**. Split if exceeded.
- Maximum function/method length: **40 lines**. Extract if exceeded.
- Maximum function parameters: **4**. Use a data class/object beyond that.
- No magic numbers or magic strings — use named constants or enums.
- No commented-out code in commits. Delete it.
- No `TODO` comments without a linked Jira/GitHub issue ID.
- No dead code, unused imports, or unused variables in committed code.
- All public APIs must have documentation comments.
- Cyclomatic complexity per method must not exceed **10**.

### Dart / Flutter

- Dart SDK constraint: `>=3.3.0 <4.0.0`
- Always use `const` constructors where possible.
- Prefer `final` over `var` everywhere. Use `var` only when type is obvious from the right-hand side.
- Never use `dynamic` unless interfacing with untyped external data — and always cast immediately.
- Use `sealed` classes for exhaustive pattern matching on domain states.
- Use `extension` methods to add behavior to external types rather than utility classes.
- Null-safe code only. No `!` (bang operator) on nullable values unless provably non-null — document why.
- Use `async`/`await` over raw `Future` chains. Never `.then()` chains longer than one level.
- All `Stream`s must be closed. Riverpod `ref.onDispose` handles this in providers.

### Java / Spring Boot

- Java version: **21** (use records, sealed classes, pattern matching, virtual threads where appropriate).
- Use `final` on all fields that don't change after construction.
- Use records for DTOs and value objects.
- Never use `null` as a return value — use `Optional<T>` or throw a domain exception.
- All collections returned from service/repository methods must be immutable (`List.copyOf`, `Collections.unmodifiableList`).
- Never catch `Exception` or `Throwable` generically — catch specific types.
- No `System.out.println` — use SLF4J.
- Avoid `static` mutable state entirely.

### TypeScript / Angular

- TypeScript strict mode: `"strict": true` in `tsconfig.json` — no exceptions.
- No `any` type. Use `unknown` and narrow, or define a proper interface.
- Prefer `interface` over `type` for object shapes. Use `type` for unions/intersections.
- All `Observable` subscriptions in components must be unsubscribed via `takeUntilDestroyed()` or `async` pipe.
- No business logic in components — delegate to services.
- Use Angular signals for local component state; use NgRx for shared/global state.

---

## 2. Architecture Standards

### Overall System Architecture

```
Mobile App (Flutter)
       │
       ▼
Spring Boot Backend (REST + WebSocket)
       │
       ├── PostgreSQL (primary data store)
       ├── Redis (cache + session)
       ├── Firebase (auth verification + push)
       └── External: Stripe, AI Provider, PDF Engine
       
Admin Portal (Angular)
       │
       ▼
Spring Boot Backend (Admin REST APIs — separate route prefix)
```

### Layer Enforcement

All three sub-projects must enforce **Clean Architecture** layering:

```
Presentation → Application (Use Cases) → Domain → Infrastructure
```

- **Domain layer** has zero dependencies on frameworks, databases, or HTTP.
- **Application layer** depends only on Domain.
- **Infrastructure layer** implements Domain interfaces; it depends on frameworks.
- **Presentation layer** depends only on Application (use cases / providers).
- Dependency direction is always inward. Never import outward.

### SOLID Principles

- **S** — Every class has one reason to change.
- **O** — Extend behavior via new classes, not modification.
- **L** — Subtypes must be substitutable for their base types.
- **I** — No client should depend on methods it does not use (small, focused interfaces).
- **D** — Depend on abstractions, not concretions. All cross-layer communication is via interfaces/abstract classes.

---

## 3. Folder Structure Standards

### Flutter — `nexcv-application/`

```
lib/
├── core/
│   ├── constants/          # App-wide constants (colors, dimensions, strings)
│   ├── errors/             # Failure types, exception mappers
│   ├── extensions/         # Dart extensions on built-in types
│   ├── network/            # Dio client factory, interceptors
│   ├── router/             # GoRouter configuration and route definitions
│   ├── storage/            # Secure storage, SharedPreferences wrappers
│   ├── theme/              # ThemeData, text styles, color scheme
│   └── utils/              # Pure utility functions (no Flutter deps)
├── features/
│   ├── auth/
│   │   ├── data/
│   │   │   ├── datasources/    # Remote (API) and local datasources
│   │   │   ├── models/         # JSON-serializable models (Freezed)
│   │   │   └── repositories/   # Repository implementations
│   │   ├── domain/
│   │   │   ├── entities/       # Pure Dart entities
│   │   │   ├── repositories/   # Abstract repository contracts
│   │   │   └── usecases/       # Single-purpose use case classes
│   │   └── presentation/
│   │       ├── providers/      # Riverpod providers
│   │       ├── screens/        # Full-screen widgets
│   │       └── widgets/        # Feature-scoped reusable widgets
│   ├── resume/             # Same sub-structure as auth
│   ├── template/
│   ├── ats/
│   ├── payment/
│   └── profile/
├── shared/
│   ├── widgets/            # App-wide reusable widgets
│   ├── providers/          # App-wide Riverpod providers
│   └── models/             # Shared domain/data models
└── main.dart
```

### Angular — `nexcv-portal/`

```
src/
├── app/
│   ├── core/
│   │   ├── guards/             # Auth, role guards
│   │   ├── interceptors/       # HTTP auth, error interceptors
│   │   ├── models/             # Core interfaces and types
│   │   ├── services/           # Singleton services (auth, api, storage)
│   │   └── core.module.ts      # Imported once in AppModule
│   ├── shared/
│   │   ├── components/         # Dumb/presentational components
│   │   ├── directives/         # Custom directives
│   │   ├── pipes/              # Custom pipes
│   │   └── shared.module.ts
│   ├── features/
│   │   ├── dashboard/
│   │   │   ├── components/
│   │   │   ├── services/
│   │   │   ├── store/          # NgRx feature store (actions, reducers, effects, selectors)
│   │   │   └── dashboard.routes.ts
│   │   ├── users/
│   │   ├── templates/
│   │   ├── subscriptions/
│   │   ├── analytics/
│   │   └── settings/
│   ├── layout/                 # Shell, sidebar, topbar components
│   ├── app.routes.ts
│   └── app.config.ts
├── assets/
├── environments/
└── styles/
    ├── _variables.scss
    ├── _mixins.scss
    └── styles.scss
```

### Spring Boot — `nexcv-backend/`

```
src/main/java/com/empire/nexcv/
├── NexcvApplication.java
├── config/                     # Spring configuration classes
│   ├── SecurityConfig.java
│   ├── RedisConfig.java
│   ├── SwaggerConfig.java
│   └── WebConfig.java
├── common/
│   ├── exception/              # GlobalExceptionHandler, domain exceptions
│   ├── response/               # ApiResponse<T> wrapper, ErrorResponse
│   ├── constants/              # AppConstants, ErrorCodes
│   └── util/                   # Shared utility classes
├── features/
│   ├── auth/
│   │   ├── controller/         # AuthController (REST endpoints)
│   │   ├── service/            # AuthService interface + impl
│   │   ├── repository/         # Spring Data JPA repositories
│   │   ├── entity/             # JPA @Entity classes
│   │   ├── dto/                # Request/Response DTOs (Java records)
│   │   └── mapper/             # Entity <-> DTO mappers
│   ├── user/
│   ├── resume/
│   ├── template/
│   ├── subscription/
│   ├── payment/
│   ├── ats/
│   └── admin/
└── infrastructure/
    ├── firebase/               # Firebase Admin SDK integration
    ├── storage/                # File storage service
    ├── ai/                     # AI provider client
    ├── email/                  # Email service
    └── pdf/                    # PDF generation service

src/main/resources/
├── application.yml
├── application-dev.yml
├── application-prod.yml
└── db/migration/               # Flyway SQL migration files (V1__, V2__, ...)
```

---

## 4. Naming Conventions

### Universal

| Concept | Convention | Example |
|---|---|---|
| Files | Match class/widget name exactly | `AuthScreen`, `auth_screen.dart` |
| Constants | `SCREAMING_SNAKE_CASE` | `MAX_RETRY_COUNT` |
| Environment vars | `SCREAMING_SNAKE_CASE` | `JWT_SECRET_KEY` |
| Abbreviations | Treat as words | `HttpClient`, not `HTTPClient` |

### Dart / Flutter

| Concept | Convention | Example |
|---|---|---|
| Classes / Widgets | `UpperCamelCase` | `ResumePreviewScreen` |
| Files | `snake_case.dart` | `resume_preview_screen.dart` |
| Variables / functions | `lowerCamelCase` | `fetchResume()` |
| Riverpod providers | `lowerCamelCase` + suffix | `resumeListProvider`, `authStateProvider` |
| Freezed models | `UpperCamelCase` | `ResumeModel`, `AuthState` |
| Use cases | `Verb + Noun + UseCase` | `FetchResumeListUseCase` |
| Repository abstractions | `Noun + Repository` | `ResumeRepository` |

### Java / Spring Boot

| Concept | Convention | Example |
|---|---|---|
| Classes | `UpperCamelCase` | `ResumeService` |
| Interfaces | `UpperCamelCase` (no `I` prefix) | `ResumeRepository` |
| Methods | `lowerCamelCase` | `findResumeById()` |
| DTOs (records) | `Noun + Request/Response` | `CreateResumeRequest`, `ResumeResponse` |
| Entities | `UpperCamelCase` (no suffix) | `Resume`, `UserSubscription` |
| Database tables | `snake_case`, plural | `resumes`, `user_subscriptions` |
| Flyway scripts | `V{n}__{description}.sql` | `V3__add_ats_score_table.sql` |

### TypeScript / Angular

| Concept | Convention | Example |
|---|---|---|
| Components | `UpperCamelCase` + `Component` | `UserListComponent` |
| Services | `UpperCamelCase` + `Service` | `TemplateService` |
| Interfaces | `UpperCamelCase` (no `I` prefix) | `UserProfile` |
| Enums | `UpperCamelCase`, values `UPPER_SNAKE` | `SubscriptionStatus.ACTIVE` |
| NgRx actions | `[Feature] Event description` | `[Auth] Login Success` |
| Route paths | `kebab-case` | `/resume-builder`, `/user-management` |

---

## 5. Git Commit Standards

### Format

```
<type>(<scope>): <short summary>

[optional body — explain WHY, not WHAT]

[optional footer: BREAKING CHANGE, Closes #issue]
```

### Types

| Type | When to use |
|---|---|
| `feat` | New feature |
| `fix` | Bug fix |
| `refactor` | Code change without feature/fix |
| `perf` | Performance improvement |
| `test` | Add or update tests |
| `docs` | Documentation only |
| `chore` | Tooling, deps, CI |
| `style` | Formatting (no logic change) |
| `revert` | Revert a previous commit |

### Scopes

`auth`, `resume`, `template`, `ats`, `payment`, `profile`, `admin`, `core`, `ci`, `deps`

### Rules

- Subject line: **≤72 characters**, imperative mood ("add", not "adds" or "added").
- No period at end of subject line.
- Body lines: **≤100 characters**.
- Reference issues: `Closes #42`, `Refs #17`.
- Every commit must build and pass lint. **Never commit broken code.**
- Squash WIP commits before merging to `develop`.

### Examples

```
feat(auth): add Google sign-in via Firebase

Integrates GoogleSignIn package with Firebase Auth. The ID token from
Google is exchanged for a Firebase credential, which is then sent to
the backend for JWT issuance.

Closes #12
```

```
fix(resume): prevent crash when template fields are empty

Null-check added in ResumePreviewWidget before rendering field values.
Failing to do so caused a RangeError on empty String fields.

Closes #34
```

---

## 6. Branching Strategy

### Branch Model: GitFlow (Strict)

```
main          → Production. Tagged releases only. Never commit directly.
develop       → Integration branch. All feature work targets here.
feature/*     → One branch per Jira/GitHub issue.
bugfix/*      → Non-urgent bug fixes targeting develop.
hotfix/*      → Urgent production fixes branched from main.
release/*     → Release stabilization. No new features.
```

### Branch Naming

```
feature/NCV-42-google-sign-in
bugfix/NCV-88-resume-download-crash
hotfix/NCV-99-payment-webhook-null-pointer
release/1.2.0
```

### Rules

- `main` and `develop` are **protected branches** — no direct push.
- All changes to `main` and `develop` require a **Pull Request with at least 1 approval**.
- Feature branches must be rebased on `develop` before opening a PR (no merge commits in feature branches).
- Delete branches after merge.
- `hotfix/*` branches are merged into **both** `main` and `develop`.
- `release/*` branches are cut from `develop`, merged into `main` and `develop` on release.
- Tags on `main` follow **SemVer**: `v1.2.3`.

---

## 7. API Design Standards

### URL Design

- Base URL: `/api/v1/` for public APIs, `/api/admin/v1/` for admin APIs.
- Resources are **plural nouns**: `/resumes`, `/templates`, `/users`.
- Nested resources for ownership: `/users/{userId}/resumes`.
- No verbs in URLs. Use HTTP methods to express action.
- Query parameters for filtering, sorting, pagination: `?status=active&sort=createdAt,desc&page=0&size=20`.

### HTTP Methods

| Operation | Method | Example |
|---|---|---|
| Fetch list | GET | `GET /resumes` |
| Fetch single | GET | `GET /resumes/{id}` |
| Create | POST | `POST /resumes` |
| Full replace | PUT | `PUT /resumes/{id}` |
| Partial update | PATCH | `PATCH /resumes/{id}` |
| Delete | DELETE | `DELETE /resumes/{id}` |

### Response Envelope

All responses use a consistent `ApiResponse<T>` wrapper:

```json
{
  "success": true,
  "message": "Resume created successfully",
  "data": { ... },
  "timestamp": "2025-01-15T10:30:00Z",
  "requestId": "550e8400-e29b-41d4-a716-446655440000"
}
```

Error response:

```json
{
  "success": false,
  "message": "Resume not found",
  "errorCode": "RESUME_NOT_FOUND",
  "errors": [],
  "timestamp": "2025-01-15T10:30:00Z",
  "requestId": "550e8400-e29b-41d4-a716-446655440000"
}
```

### Pagination Response

```json
{
  "success": true,
  "data": {
    "content": [...],
    "page": 0,
    "size": 20,
    "totalElements": 150,
    "totalPages": 8,
    "last": false
  }
}
```

### HTTP Status Codes

| Situation | Code |
|---|---|
| Success with body | 200 OK |
| Created | 201 Created |
| Success no body | 204 No Content |
| Bad request / validation | 400 Bad Request |
| Unauthenticated | 401 Unauthorized |
| Forbidden | 403 Forbidden |
| Not found | 404 Not Found |
| Conflict | 409 Conflict |
| Unprocessable | 422 Unprocessable Entity |
| Server error | 500 Internal Server Error |

### Versioning

- API version in URL path: `/api/v1/`, `/api/v2/`.
- Breaking changes always require a new version.
- Old versions must be supported for **minimum 6 months** post-deprecation notice.

### Validation

- All request bodies validated with Bean Validation annotations.
- Validation errors return `400` with per-field error details:

```json
{
  "errors": [
    { "field": "email", "message": "must be a valid email address" },
    { "field": "password", "message": "must be at least 8 characters" }
  ]
}
```

---

## 8. Security Guidelines

### Authentication

- Firebase ID tokens verified server-side using Firebase Admin SDK on every request.
- JWTs issued by backend; access token TTL: **15 minutes**. Refresh token TTL: **7 days**.
- Refresh tokens stored in Redis with user binding. Revocable.
- Never store tokens in `localStorage` (Angular portal) — use `httpOnly` cookies or in-memory with `sessionStorage` fallback.
- Flutter: tokens stored in `flutter_secure_storage` only. Never in SharedPreferences.

### Authorization

- Role-based access control (RBAC): roles `USER`, `PREMIUM_USER`, `ADMIN`, `SUPER_ADMIN`.
- Every endpoint must have an explicit authorization annotation. No implicit public endpoints.
- Admin APIs require `ADMIN` role minimum. Super admin actions require `SUPER_ADMIN`.
- Resource-level ownership checks: a user cannot access another user's resumes.

### Input Validation & Sanitization

- Validate ALL inputs at the API boundary — never trust client data.
- Sanitize HTML content before storage to prevent stored XSS.
- Use parameterized queries only. No string concatenation in SQL.
- File uploads: validate MIME type server-side (not just extension), scan for malware, enforce size limits.

### Secrets Management

- No secrets in source code — ever.
- Use environment variables injected at runtime (Docker secrets, CI/CD secrets).
- `.env` files only for local dev; never committed (`.gitignore`).
- Rotate secrets on any suspected compromise immediately.

### HTTPS / Transport

- All traffic HTTPS. No HTTP endpoints in production.
- HSTS header enabled.
- TLS 1.2 minimum; TLS 1.3 preferred.

### OWASP Top 10 Compliance

- SQL Injection: parameterized queries, JPA only.
- XSS: Angular's DomSanitizer, Content-Security-Policy header.
- CSRF: SameSite cookies, CSRF tokens for state-changing form submissions.
- IDOR: ownership checks on every resource access.
- Sensitive data exposure: no PII in logs, no credentials in error messages.

### Rate Limiting

- Public endpoints (login, register): max **10 req/min per IP**.
- Authenticated endpoints: max **60 req/min per user**.
- File upload endpoints: max **10 req/min per user**.
- Implement using Redis-backed bucket in Spring Boot.

---

## 9. Logging Standards

### Log Levels

| Level | When to use |
|---|---|
| `TRACE` | Fine-grained debug (disabled in prod) |
| `DEBUG` | Developer diagnostics (disabled in prod) |
| `INFO` | Normal business events (start, completion of significant operations) |
| `WARN` | Unexpected but recoverable situations |
| `ERROR` | Errors requiring investigation; always include stack trace |

### Rules

- Production log level: `INFO`.
- Development log level: `DEBUG`.
- Use **structured JSON logging** in production (Logback with `logstash-logback-encoder`).
- Every log entry must include: `timestamp`, `level`, `service`, `requestId`, `userId` (if authenticated), `message`.
- Never log: passwords, tokens, card numbers, PII beyond user ID.
- Log entry at `INFO` for every significant business event (resume created, payment processed, template published).
- Log entry at `ERROR` for every exception that reaches the global handler.
- Correlation ID (`X-Request-ID` header) must be propagated through all log entries in a request lifecycle.

### Log Format (JSON, Production)

```json
{
  "timestamp": "2025-01-15T10:30:00.123Z",
  "level": "INFO",
  "service": "nexcv-backend",
  "requestId": "550e8400-e29b-41d4-a716-446655440000",
  "userId": "user_abc123",
  "feature": "resume",
  "event": "RESUME_CREATED",
  "message": "Resume created successfully",
  "durationMs": 142
}
```

---

## 10. Error Handling Standards

### Flutter

- Use `Either<Failure, T>` pattern (or a sealed `Result` class) for all use case return types.
- Never expose raw exceptions to UI — map to user-friendly `Failure` subtypes.
- Riverpod `AsyncValue` error state drives UI error rendering.
- Network errors must distinguish: no internet, server error (5xx), client error (4xx), timeout.
- Show actionable error messages — not "Something went wrong". Tell the user what to do.

### Spring Boot

- Single `@RestControllerAdvice` global exception handler — no try/catch in controllers.
- Domain exceptions are specific sealed classes: `ResumeNotFoundException`, `InsufficientSubscriptionException`.
- All domain exceptions map to specific HTTP status codes and error codes.
- Unexpected exceptions (`RuntimeException`) log at `ERROR` with full stack trace and return `500`.
- Validation exceptions (`MethodArgumentNotValidException`) return `400` with per-field errors.
- Never expose stack traces or internal system details in API error responses.

### Angular

- `HttpInterceptor` handles all HTTP errors globally.
- `401` → redirect to login with return URL.
- `403` → navigate to access-denied page.
- `5xx` → show toast notification; log to Firebase Crashlytics (if integrated).
- Component-level errors caught by `ErrorBoundary` pattern (Angular error handler).

---

## 11. Database Standards

### Schema Design

- Every table must have: `id UUID PRIMARY KEY DEFAULT gen_random_uuid()`, `created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()`, `updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()`.
- Use `TIMESTAMPTZ` (timezone-aware), never `TIMESTAMP`.
- Soft delete with `deleted_at TIMESTAMPTZ NULL` — never hard delete user-facing data.
- Foreign keys must have explicit `ON DELETE` behavior (never implicit). Prefer `RESTRICT` over `CASCADE` for critical data.
- All `VARCHAR` columns must have a maximum length. No unbounded `TEXT` for short fields.

### Migrations (Flyway)

- Every schema change is a Flyway migration. Never modify existing migration files.
- Migration naming: `V{sequential_number}__{snake_case_description}.sql`.
- Migrations must be idempotent where possible (`CREATE TABLE IF NOT EXISTS`, `CREATE INDEX CONCURRENTLY IF NOT EXISTS`).
- Large table migrations (adding columns, adding indexes) use `CONCURRENTLY` to avoid locking.
- Test migrations on a production-size dataset before deploying.

### Indexing

- Index every foreign key column.
- Index all columns used in `WHERE` clauses in frequently-run queries.
- Use composite indexes when queries filter on multiple columns together.
- Monitor query performance with `EXPLAIN ANALYZE` — no query should do a full table scan on a table with >10k rows.

### Redis

- TTL on every Redis key — no persistent keys without justification.
- Key naming: `nexcv:{feature}:{entity}:{id}` (e.g., `nexcv:resume:preview:abc123`).
- Use Redis for: JWT refresh token store, rate limiting, short-lived cache, session data.
- Do not use Redis as a primary data store.

### Connection Pooling

- Use HikariCP (Spring Boot default).
- Pool size: `max = (2 * CPU cores) + 1` as a starting point, tune under load.
- Never open database connections in loops.

---

## 12. Testing Standards

### Flutter

| Layer | Test Type | Tool | Target Coverage |
|---|---|---|---|
| Use Cases | Unit | `flutter_test` | 100% |
| Repositories | Unit (mocked datasource) | `mockito` | 90%+ |
| Providers | Unit | `riverpod_test` | 90%+ |
| Widgets | Widget test | `flutter_test` | Key widgets |
| E2E flows | Integration | `integration_test` | Critical paths |

- Use `mocktail` or `mockito` for mocking dependencies.
- No business logic in widgets — if you can't unit test something, it's in the wrong layer.
- Every use case class must have a corresponding `_test.dart` file.

### Spring Boot

| Layer | Test Type | Annotation | Target Coverage |
|---|---|---|---|
| Service | Unit | `@ExtendWith(MockitoExtension)` | 90%+ |
| Controller | Slice | `@WebMvcTest` | All endpoints |
| Repository | Slice | `@DataJpaTest` | All queries |
| Integration | Full context | `@SpringBootTest` | Critical flows |

- Use `Testcontainers` for PostgreSQL and Redis in integration tests.
- Use `WireMock` for external HTTP dependencies.
- No mocking of the database in integration tests.
- Minimum overall line coverage: **80%**. Enforced by Jacoco in CI.

### Angular

| Layer | Test Type | Tool | Target Coverage |
|---|---|---|---|
| Services | Unit | Jest | 90%+ |
| Components | Unit | Jest + Angular TestBed | All components |
| E2E | E2E | Playwright | Critical user journeys |

- Test in isolation: mock all HTTP calls with `HttpClientTestingModule`.
- Every NgRx reducer and selector must have unit tests.

### General Testing Rules

- Tests are **not optional**. PRs without tests for new features will not be approved.
- Test names describe behavior: `should return failure when network is unavailable`.
- Do not test implementation details — test behavior and contracts.
- CI must run all tests and fail the build if coverage drops below thresholds.

---

## 13. Documentation Standards

### Code Documentation

- Public classes, methods, and non-obvious fields must have documentation comments.
- Dart: use `///` doc comments.
- Java: use Javadoc `/** */` comments.
- TypeScript: use JSDoc `/** */` comments.
- Do not write comments that restate what the code does. Comment the **why**: constraints, non-obvious decisions, known limitations.

### API Documentation

- All REST endpoints documented in OpenAPI/Swagger.
- Swagger UI accessible at `/swagger-ui.html` in non-production environments.
- Every endpoint must have: summary, description, request body schema, all response codes with schemas.
- DTOs must have field-level descriptions and validation annotations.

### Architecture Decision Records (ADRs)

- Significant architectural decisions are documented as ADRs in `/docs/adr/`.
- ADR template: Context → Decision → Consequences.
- ADRs are never deleted — superseded ADRs are marked "Superseded by ADR-XXX".

### README Standards

Each sub-project must have a `README.md` covering:
1. Project overview and purpose.
2. Prerequisites and local setup steps.
3. Environment variable reference.
4. How to run tests.
5. How to build for production.
6. Common troubleshooting.

---

## 14. Flutter Best Practices

- **Feature-first** folder structure (see Section 3). Never organize by layer across features.
- Use `GoRouter` exclusively. No `Navigator.push` calls in feature code.
- All screens are `ConsumerWidget` or `ConsumerStatefulWidget`. No raw `StatefulWidget` for state that belongs in a provider.
- Images: use `CachedNetworkImage` for all remote images.
- Lists: use `ListView.builder` (lazy) for all lists. Never `ListView(children: [...])` for dynamic data.
- Use `Freezed` + `JsonSerializable` for all data models. No hand-written `fromJson`/`toJson`.
- Use `Dio` with interceptors for HTTP. No `http` package usage.
- All API calls go through a `RemoteDataSource` — never call Dio directly from a repository.
- Platform channels wrapped in a service layer — never called directly from business logic.
- Localization: use `flutter_localizations` and `intl`. No hardcoded user-visible strings.
- Avoid `setState` in non-trivial components. Prefer `Riverpod` state.
- Never call `BuildContext` methods after `await` without checking `mounted`.

---

## 15. Angular Best Practices

- Use **standalone components** (Angular 17+). No `NgModule` for feature code.
- Lazy-load every feature route. No eagerly-loaded feature modules.
- Smart/Dumb component pattern: smart components get data (via store/services), dumb components receive inputs and emit outputs.
- Use `OnPush` change detection on all dumb (presentational) components.
- HTTP calls only through service classes. No `HttpClient` in components.
- Unsubscribe all `Observable` subscriptions: use `takeUntilDestroyed()` or `async` pipe — never manual `unsubscribe()`.
- Use Angular Material as the component library. No mixing of UI libraries.
- `environment.ts` for environment-specific config — no hardcoded URLs.
- Use `inject()` function for dependency injection over constructor injection in standalone components.
- Route guards implemented as functional guards (`CanActivateFn`).
- Angular animations only for meaningful UX transitions — not decorative.

---

## 16. Spring Boot Best Practices

- Configuration via `application.yml` (not `.properties`). Environment-specific overrides in `application-{profile}.yml`.
- Use `@ConfigurationProperties` for typed config — not `@Value` for complex config.
- All service implementations are package-private. Only the interface is public.
- Transactional boundaries at service layer, not repository or controller.
- Use Spring Data JPA projections for read-only queries that don't need full entities.
- Redis caching via `@Cacheable`, `@CacheEvict`, `@CachePut` — never manual `RedisTemplate` calls for simple caching.
- `ResponseEntity` only in controllers. Services return domain objects.
- Use `@Valid` on all request body parameters in controllers.
- `@Async` methods require a custom `ThreadPoolTaskExecutor` — never use the default executor in production.
- Actuator endpoints (`/actuator/**`) must be secured and not publicly accessible.
- Docker image: use multi-stage builds. Final image must be non-root and minimal (distroless or Alpine JRE).

---

## 17. Firebase Integration Standards

### Authentication

- Firebase Authentication used for social sign-in (Google, Apple).
- Firebase ID tokens sent in `Authorization: Bearer <token>` header.
- Backend verifies token with Firebase Admin SDK on every request — no shortcuts.
- Token verification failure is always `401 Unauthorized`.

### Flutter Integration

- Use `firebase_auth` package only through a `FirebaseAuthDataSource` class.
- Listen to `authStateChanges()` stream in a top-level provider.
- Handle `FirebaseAuthException` codes explicitly (not generically).

### Firebase Analytics

- Use `firebase_analytics` for user behavior tracking.
- Define event schema before implementation — document all custom events.
- Do not log PII in analytics events.

### Firebase Crashlytics

- Enabled in production builds only.
- Set `userId` in Crashlytics when user logs in — clear on logout.
- Use `FirebaseCrashlytics.instance.recordError()` in the global error zone.
- Non-fatal errors logged with `fatal: false`.

### Push Notifications (FCM)

- FCM tokens stored in backend user table.
- Refresh token on every app launch and update backend if changed.
- Notification handling in `FirebaseMessaging.onBackgroundMessage` via a top-level function.

---

## 18. Clean Architecture Rules

### The Dependency Rule

> Source code dependencies must always point inward — toward higher-level policy.

```
Presentation → Application → Domain ← Infrastructure
```

- `Domain` knows nothing about Dart, Flutter, Spring, Angular, HTTP, or databases.
- `Application` (use cases) only imports from `Domain`.
- `Infrastructure` implements `Domain` interfaces — it knows about databases, HTTP, Firebase.
- `Presentation` uses application use cases and infrastructure bindings.

### Use Case Rules

- One use case per class.
- Use case class name: `VerbNounUseCase` (e.g., `CreateResumeUseCase`, `FetchTemplatesUseCase`).
- Use cases have a single public `call()` method (making them callable as functions).
- Use cases return `Either<Failure, T>` or `Future<Either<Failure, T>>`.
- Use cases do not have framework dependencies.

### Entity Rules

- Entities are pure Dart/Java objects — no annotations, no framework dependencies.
- Entities contain core business rules.
- Entities do not know about persistence or transport formats.

### Repository Rules

- Repository interfaces live in `Domain`.
- Repository implementations live in `Infrastructure`/`Data`.
- One repository interface per aggregate root.

---

## 19. Riverpod Rules

- Use `riverpod_annotation` with code generation for all providers. No manual provider declarations.
- Provider granularity: one provider per distinct piece of state or async operation.
- Use `AsyncNotifierProvider` for async state with mutations (lists, complex state).
- Use `FutureProvider` for read-only async data.
- Use `StateProvider` only for simple, non-derived state (e.g., a toggle).
- Use `Provider` for synchronous derived values.
- Never call `ref.read()` inside `build()` — use `ref.watch()`.
- Use `ref.read()` only in event handlers (button taps, etc.).
- Every provider must be placed in its feature's `presentation/providers/` directory.
- Providers should never directly import UI code.
- `ProviderScope` is initialized once at the root widget. No nested `ProviderScope`s.
- Use `ref.onDispose()` to cancel subscriptions, close streams, and release resources.
- Prefer `keepAlive: false` (default) for data that should refresh when screen is left.
- Use `keepAlive: true` only for global/cross-feature state that must persist.

---

## 20. Code Review Checklist

Before approving a PR, reviewers must verify:

### Architecture

- [ ] No layer boundary violations (domain imports framework, UI imports repository directly, etc.)
- [ ] New use cases are single-purpose
- [ ] No business logic in controllers (Spring), screens (Flutter), or components (Angular)

### Code Quality

- [ ] No magic numbers or magic strings
- [ ] No unused code, imports, or variables
- [ ] No `dynamic` / `any` / raw `Object` types without justification
- [ ] Functions are ≤40 lines and have a single responsibility
- [ ] Error cases are handled — not just happy path

### Security

- [ ] No secrets or credentials in code
- [ ] All new endpoints have authorization annotations
- [ ] User input is validated before use
- [ ] No PII in logs

### Testing

- [ ] New features have unit tests
- [ ] New API endpoints have controller tests
- [ ] Tests are meaningful (not just coverage padding)
- [ ] CI passes (lint, tests, coverage thresholds)

### Database (if applicable)

- [ ] Schema changes are Flyway migrations
- [ ] New queries have appropriate indexes
- [ ] No N+1 queries introduced

### API (if applicable)

- [ ] Response follows `ApiResponse<T>` envelope
- [ ] Correct HTTP status codes
- [ ] Swagger documentation updated

### General

- [ ] PR description explains WHY the change is needed
- [ ] No unrelated changes bundled in the PR
- [ ] Commit messages follow Conventional Commits standard
- [ ] No merge commits (rebased on target branch)

---

## 21. Performance Guidelines

### Flutter

- Profile with Flutter DevTools before declaring a screen "done".
- Target **60fps** on mid-range Android devices (120fps on capable devices).
- No `setState` triggering a full tree rebuild — scope rebuilds with `Consumer` or `Selector`.
- Avoid rebuilding expensive widgets with `const` constructors and `Select`.
- Use `RepaintBoundary` to isolate frequently-updating subtrees.
- Avoid expensive operations in `build()` — compute in providers.
- Network images: always use `CachedNetworkImage` with appropriate `memCacheHeight`/`memCacheWidth`.
- Compress images before upload; serve appropriately-sized images from backend.

### Spring Boot

- Database queries: use `EXPLAIN ANALYZE` on all new queries in review.
- N+1 prevention: use `JOIN FETCH` or `@EntityGraph` in JPA queries.
- Response caching: cache read-heavy, infrequently-changing data in Redis with appropriate TTL.
- Virtual threads (Java 21): enable with `spring.threads.virtual.enabled=true` for improved I/O throughput.
- Avoid blocking calls in reactive/virtual thread contexts.
- Paginate all list endpoints — no unbounded queries.

### Angular

- Use `OnPush` change detection for presentational components.
- Lazy-load all feature modules/routes.
- Use `trackBy` in all `*ngFor` directives over lists.
- Minimize bundle size: `ng build --stats-json` + `webpack-bundle-analyzer` before each release.
- Use Angular CDK `VirtualScrollViewport` for long lists (>50 items).
- Avoid subscribing to Observables in `ngOnInit` without unsubscribing.

---

## 22. Production Release Guidelines

### Pre-Release Checklist

- [ ] All feature branches merged and tested on `develop`
- [ ] Release branch created from `develop`
- [ ] Full regression test suite passes
- [ ] Security scan completed (OWASP dependency check)
- [ ] Performance benchmarks meet targets
- [ ] Database migrations tested on production-size dataset
- [ ] All environment variables verified in production config
- [ ] Firebase configuration (google-services.json, GoogleService-Info.plist) is production build
- [ ] Flutter build uses `--release` flag and obfuscation enabled
- [ ] Crashlytics and Analytics verified sending data in staging
- [ ] API backward compatibility verified (no breaking changes without version bump)
- [ ] Rollback plan documented

### Flutter Release

```bash
# Android
flutter build appbundle --release --obfuscate --split-debug-info=symbols/

# iOS
flutter build ipa --release --obfuscate --split-debug-info=symbols/
```

- Upload debug symbols to Crashlytics.
- Version bump follows SemVer: `pubspec.yaml` `version: major.minor.patch+buildNumber`.
- App store metadata reviewed before submission.

### Backend Release

- Docker image tagged with Git SHA and SemVer: `nexcv-backend:1.2.3-abc1234`.
- Flyway migrations run automatically on startup (never manually).
- Zero-downtime deployment: rolling update in Kubernetes or blue/green.
- Smoke tests run against production immediately post-deploy.
- Monitor error rate and latency for 15 minutes post-deploy.
- Rollback trigger: error rate >1% or p99 latency >2s for 5 consecutive minutes.

### Post-Release

- Tag `main` with the release version.
- Merge `release/*` branch into `develop`.
- Update changelog.
- Close all Jira/GitHub issues in the release milestone.
- Announce release in team channel with changelog summary.
