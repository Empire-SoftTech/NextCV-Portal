# NexCV — AI Development Instructions

> Single source of truth for all AI coding assistants working on this project.
> Referenced by: CLAUDE.md · GEMINI.md · AGENTS.md · .cursor/rules/nexcv.mdc · .github/copilot-instructions.md

---

## Project Overview

NexCV is an AI-powered Resume Builder platform built by Empire Softtech.
Package name: `com.empire.product.nexcv`

**Monorepo structure:**

```
/nexcv
├── nexcv-application/   Flutter Android/iOS app (currently: scaffold only)
├── nexcv-backend/       Spring Boot backend     (not yet created)
├── nexcv-portal/        Angular admin portal    (not yet created)
├── stitch_nexcv_ats_builder/   UI design exports (Stitch)
├── rules.md             Engineering standards — read before every task
└── skills.md            Architecture patterns + project roadmap
```

**Before implementing any feature:** read `rules.md` and `skills.md` in full. Every engineering decision must conform to those documents.

---

## nexcv-application (Flutter)

### Current State
Flutter scaffold only — `lib/main.dart` is the default counter app. No feature packages added yet. Add the full package stack before writing any feature code.

### Required Packages

```yaml
dependencies:
  flutter_riverpod: ^2.x
  riverpod_annotation: ^2.x
  go_router: ^14.x
  dio: ^5.x
  firebase_core: ^3.x
  firebase_auth: ^5.x
  firebase_analytics: ^11.x
  firebase_crashlytics: ^4.x
  google_sign_in: ^6.x
  flutter_secure_storage: ^9.x
  freezed_annotation: ^2.x
  json_annotation: ^4.x
  cached_network_image: ^3.x
  connectivity_plus: ^6.x

dev_dependencies:
  riverpod_generator: ^2.x
  build_runner: ^2.x
  freezed: ^2.x
  json_serializable: ^6.x
  mockito: ^5.x
  mocktail: ^1.x
```

### Commands

```bash
# Run from nexcv-application/
flutter pub get
flutter pub run build_runner build --delete-conflicting-outputs   # codegen (Freezed + Riverpod)
flutter pub run build_runner watch --delete-conflicting-outputs   # codegen watch mode

flutter run
flutter run --flavor dev

flutter test
flutter test test/features/auth/          # single feature
flutter test --coverage

flutter analyze                           # must pass zero issues
dart format .

flutter build appbundle --release --obfuscate --split-debug-info=symbols/
flutter build ipa --release --obfuscate --split-debug-info=symbols/
```

### Architecture

Clean Architecture, feature-first. Dependency direction: `presentation → data → domain` (strictly enforced — domain has zero Flutter/framework imports).

```
lib/features/{feature}/
├── domain/        # Pure Dart: entities, repository interfaces, use cases
├── data/          # Freezed models, repository impls, remote/local datasources
└── presentation/  # Riverpod providers, GoRouter screens, feature-scoped widgets
```

**Non-negotiable patterns:**
- Use cases: single `call()` method, return `Future<Either<Failure, T>>`.
- Providers: `riverpod_annotation` code generation only — no manual provider declarations.
- HTTP: `core/network/dio_client.dart` → `RemoteDataSource` → repository → use case. Never Dio in providers or widgets.
- Firebase Auth: always via `FirebaseAuthDataSource`. Never `FirebaseAuth.instance` directly.
- Tokens: `flutter_secure_storage` only. Never SharedPreferences.
- Navigation: GoRouter only. No `Navigator.push` in feature code.
- After any `await`: check `mounted` before using `BuildContext`.

---

## UI Design References — Stitch Exports

**Location:** `stitch_nexcv_ats_builder/`

Each sub-folder = one screen. Contents:
- `screen.png` — pixel-perfect visual reference (source of truth)
- `code.html` — Stitch-generated HTML (structural/spacing reference only)

**Available screens:**

| Folder | Screen |
|---|---|
| `splash_screen` | Splash |
| `onboarding_1` | Onboarding step 1 |
| `onboarding_2_ats_optimization` | Onboarding step 2 |
| `onboarding_3_active_state` | Onboarding step 3 — active |
| `onboarding_3_loading_state` | Onboarding step 3 — loading |
| `onboarding_3_ai_enhancement` | Onboarding step 3 — AI |
| `sign_in` | Sign in |
| `sign_up` | Sign up |
| `home_dashboard` | Home dashboard |
| `my_resumes_dashboard` | My resumes |
| `resume_templates` | Template gallery |
| `personal_info_builder` | Resume builder — personal info |
| `professional_summary_builder` | Resume builder — summary |
| `experience_builder` | Resume builder — experience |
| `education_builder` | Resume builder — education |
| `skills_builder` | Resume builder — skills |
| `certifications_activities` | Resume builder — certifications |
| `nexcv_preview_redesign` | Resume preview |
| `ats_score_analysis` | ATS score analysis |
| `profile_dashboard` | Profile |

**Translation rules (Stitch → Flutter):**
- `screen.png` is the reference. `code.html` is for understanding layout hierarchy and spacing values only — never copy HTML into Dart.
- Rebuild every element using Flutter widgets and the design tokens below. No `HtmlWidget` or WebView for static screens.
- Reusable patterns (cards, buttons, inputs, chips) → `lib/shared/widgets/`. Never duplicate widget code across features.
- All spacing must be a multiple of 4px (the design system grid).

---

## App Theme — ResumeNova Design System

Full spec: `stitch_nexcv_ats_builder/resumenova/DESIGN.md`
Implementation target: `lib/core/theme/`

### Fonts
- Headings: **Plus Jakarta Sans** (700 for xl/lg, 600 for md)
- Body & UI: **Inter** (400 body, 600 labels)

### Type Scale (`AppTextStyles`)

| Token | Font | Size | Weight | Line Height |
|---|---|---|---|---|
| `headlineXl` | Plus Jakarta Sans | 32 | 700 | 40 |
| `headlineXlMobile` | Plus Jakarta Sans | 28 | 700 | 36 |
| `headlineLg` | Plus Jakarta Sans | 24 | 700 | 32 |
| `headlineMd` | Plus Jakarta Sans | 20 | 600 | 28 |
| `bodyLg` | Inter | 16 | 400 | 26 |
| `bodyMd` | Inter | 14 | 400 | 22 |
| `labelMd` | Inter | 12 | 600 | 16 |

Use `headlineXlMobile` (28px) for screen titles on mobile — fits content above the fold.

### Color Palette (`AppColors`)

```dart
// Brand
primary                = Color(0xFF004AC6)
primaryContainer       = Color(0xFF2563EB)  // gradient end, AI/magic CTAs
onPrimary              = Color(0xFFFFFFFF)
secondary              = Color(0xFF4B41E1)
onSecondary            = Color(0xFFFFFFFF)

// Surfaces
background             = Color(0xFFFAF8FF)
surface                = Color(0xFFFAF8FF)
surfaceContainer       = Color(0xFFEAEDFF)  // card + input resting bg
surfaceContainerLowest = Color(0xFFFFFFFF)

// Text
onSurface              = Color(0xFF131B2E)
onSurfaceVariant       = Color(0xFF434655)
outline                = Color(0xFF737686)
outlineVariant         = Color(0xFFC3C6D7)

// Semantic
tertiary               = Color(0xFF006242)  // ATS success / section complete
error                  = Color(0xFFBA1A1A)
```

### Spacing (`AppDimensions`)

```dart
containerMargin = 20.0   // horizontal page margin
gutter          = 16.0
stackSm         =  8.0
stackMd         = 16.0
stackLg         = 24.0
```

### Border Radius (`AppDimensions`)

```dart
radiusSm   =   4.0
radiusMd   =  12.0   // buttons, inputs
radiusLg   =  16.0
radiusXl   =  24.0   // cards, modals
radiusFull = 999.0   // pills, chips
```

### Component Rules

| Component | Spec |
|---|---|
| **Primary button** | `primary` → `secondary` gradient, white text, `radiusMd`. Only for primary CTAs and AI/magic actions. |
| **Ghost button** | White fill, `primary` text, 1px `outlineVariant` border, `radiusMd`. |
| **Input field** | `surfaceContainer` bg, no border at rest; `primary` 1px border + glow on focus. |
| **Card** | Full content width, `surfaceContainer` bg, 1px `outlineVariant` stroke, `radiusXl`, shadow (y=4, blur=12, `onSurface` @ 5%). |
| **AI action card** | Same as card + `primary`-tinted border + sparkle icon. |
| **Progress chip** | Pill (`radiusFull`). Complete → `tertiary` bg. Pending → `surfaceContainerLowest`. |
| **Bottom nav** | `radiusXl` top corners, 60% opacity backdrop blur, `primary` for active icon. |
| **Overlay / modal** | Glassmorphism: 80% white opacity, 12–20px background blur. |

---

## nexcv-backend (Spring Boot)

### Current State
Not yet created. Initialize via Spring Initializr:
- Java 21, Spring Boot 3.x, **Maven**
- Dependencies: Spring Web, Spring Security, Spring Data JPA, Spring Data Redis, Validation, Actuator, Flyway

### Commands

```bash
# Run from nexcv-backend/
./mvnw spring-boot:run -Dspring-boot.run.profiles=dev

./mvnw test                                                    # all tests
./mvnw test -Dtest=ResumeServiceTest                           # single class
./mvnw test -Dtest=AuthControllerTest#shouldReturnUnauthorized # single method
./mvnw test -Dtest="com.empire.nexcv.features.auth.*"          # full package

./mvnw verify                     # tests + Jacoco 80% gate
./mvnw jacoco:report              # HTML report → target/site/jacoco/
./mvnw package -DskipTests        # JAR only

docker build -t nexcv-backend:local .
docker compose up -d              # postgres + redis locally
```

### Architecture

Feature vertical slices under `com.empire.nexcv.features.{feature}/`:

```
{feature}/
├── controller/   # @RestController — @Valid only, delegates to service
├── service/      # Interface + Impl — business logic, @Transactional
├── repository/   # Spring Data JPA
├── entity/       # @Entity — UUID PK, created_at, updated_at, deleted_at
├── dto/          # Java records (Bean Validation on requests)
└── mapper/       # MapStruct entity ↔ DTO
```

**Non-negotiable patterns:**
- All responses: `common/response/ApiResponse<T>` wrapper.
- All exceptions: `GlobalExceptionHandler` (`@RestControllerAdvice`). No try/catch in controllers.
- Auth: Firebase ID token → `FirebaseTokenFilter` → backend JWT (15 min) + Redis refresh token (7 days).
- Schema changes: Flyway migrations only (`db/migration/V{n}__{desc}.sql`). Never modify existing files.
- Caching: `@Cacheable`/`@CacheEvict`. Key pattern: `nexcv:{feature}:{entity}:{id}`.
- Routes: public app → `/api/v1/`, admin → `/api/admin/v1/` (requires `ADMIN` role).
- Virtual threads: `spring.threads.virtual.enabled=true`.

### Database Conventions
- Every table: UUID PK via `gen_random_uuid()`, `created_at TIMESTAMPTZ`, `updated_at TIMESTAMPTZ`, `deleted_at TIMESTAMPTZ` (soft delete — never hard delete user data).
- Index every FK column. No unbounded `TEXT` for short string fields.

---

## nexcv-portal (Angular)

### Current State
Not yet created. Bootstrap:

```bash
ng new nexcv-portal --routing --style=scss --strict
cd nexcv-portal && ng add @angular/material
```

### Commands

```bash
# Run from nexcv-portal/
npm install
npm start                              # dev server → localhost:4200
npm run build                          # production build
npm test                               # Jest unit tests
npm run test:watch
npm run e2e                            # Playwright
npm run lint

ng generate component features/users/components/user-list --standalone
ng generate service features/users/services/user
```

### Architecture

Standalone components (Angular 17+), lazy-loaded feature routes, no NgModules for features.

```
src/app/
├── core/          # Guards, interceptors, singleton services, core models
├── shared/        # Dumb/presentational components, directives, pipes
├── features/
│   └── {feature}/
│       ├── components/
│       ├── services/
│       ├── store/         # NgRx: actions, reducer, effects, selectors
│       └── {feature}.routes.ts
└── layout/        # Shell, sidebar, topbar
```

**Non-negotiable patterns:**
- Smart/Dumb split: smart → store/services. Dumb → `@Input()`/`@Output()` only.
- `OnPush` change detection on all presentational components.
- HTTP: `core/services/api.service.ts` only — never `HttpClient` in components.
- Auth interceptor attaches JWT. Error interceptor: 401 → login, 403 → access denied.
- Subscriptions: `takeUntilDestroyed()` or `async` pipe. No manual `unsubscribe()`.
- Guards: functional `CanActivateFn`. See `core/guards/`.
- API URLs: `environments/environment.ts` only — never hardcoded.

---

## Cross-Cutting Concerns

### Feature Implementation Sequence
Always in this order — never skip steps:
1. Flyway migration SQL
2. Domain entity + repository interface
3. Request/Response DTOs with validation
4. Repository impl + service layer
5. REST controller + Swagger `@Operation` docs
6. Flutter: datasource → repository impl → use cases → providers → screens

### Git Workflow
- Branch names: `feature/NCV-{id}-{slug}`, `bugfix/NCV-{id}-{slug}`, `hotfix/NCV-{id}-{slug}`
- All feature work targets `develop`. Direct commits to `main` or `develop` are blocked.
- Commit format: `feat(auth): add Google sign-in via Firebase` (Conventional Commits, ≤72 chars, imperative mood)

### Environment Files
| Sub-project | File | Rule |
|---|---|---|
| Flutter | `.env.json` per flavor | Never committed. Pass via `--dart-define-from-file` |
| Spring Boot | `application-dev.yml` / `application-prod.yml` | Secrets via env vars only, not in YAML |
| Angular | `environments/environment.ts` | No secrets. API base URL only |
