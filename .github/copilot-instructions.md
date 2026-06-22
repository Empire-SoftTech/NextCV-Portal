# GitHub Copilot Instructions — NexCV

Read `.ai/instructions.md` before writing any code in this repository. It contains the complete project context, design tokens, folder structure, available Stitch screens, all commands, and the mandatory feature implementation sequence.

Also read `rules.md` (engineering standards) and `skills.md` (architecture patterns).

## Project summary

NexCV is an AI-powered Resume Builder monorepo:
- `nexcv-application/` — Flutter (Riverpod + GoRouter + Clean Architecture)
- `nexcv-backend/` — Spring Boot 3, Java 21, **Maven**, PostgreSQL, Redis
- `nexcv-portal/` — Angular 17+ standalone components, Angular Material, NgRx

## Critical constraints Copilot must follow

**Flutter**
- State: `riverpod_annotation` code generation. Never raw `StateNotifier` or `ChangeNotifier`.
- Navigation: `GoRouter` only. Never `Navigator.push` or `Navigator.pushNamed`.
- HTTP: `Dio` through a `RemoteDataSource` class per feature. Never raw `Dio` calls in providers or widgets.
- Storage: `flutter_secure_storage` for tokens. Never `SharedPreferences` for sensitive data.
- Models: `Freezed` + `json_serializable`. Always run `build_runner` after changes to model files.
- Layer rule: `domain/` has zero imports from Flutter, Dio, Firebase, or any infrastructure package.

**Spring Boot**
- Build: Maven only (`./mvnw`). Do not suggest or generate Gradle config.
- Schema: every change is a Flyway migration file. Never alter an existing migration.
- Response envelope: every endpoint returns `ApiResponse<T>`.
- Exceptions: throw domain-specific exceptions; `GlobalExceptionHandler` maps them to HTTP codes.
- DTOs: Java records with Bean Validation annotations.

**Angular**
- Components: standalone (`standalone: true`). `OnPush` change detection.
- HTTP: always through `ApiService`. Attach auth token via `auth.interceptor.ts`.
- State: NgRx for shared state. Angular signals for local component state.
- Subscriptions: `takeUntilDestroyed()` or `async` pipe — never `subscription.unsubscribe()` in `ngOnDestroy`.

**UI Design**
- Stitch exports in `stitch_nexcv_ats_builder/`. Use `screen.png` as the pixel-perfect reference.
- Never copy `code.html` content into Dart/Flutter code.
- Design tokens (colors, fonts, spacing, radii) are in `.ai/instructions.md`. Use those exact values.
