# GEMINI.md — NexCV Project Instructions

This file provides guidance to Gemini CLI when working with code in this repository.

**Start every session by reading `.ai/instructions.md` in full before writing any code.**

That file is the single source of truth for project architecture, coding standards, design tokens, available screens, and the feature implementation sequence. All rules in that file are non-negotiable.

Key reminders for Gemini:
- Engineering standards are in `rules.md`. Architecture patterns are in `skills.md`. Read both.
- UI designs are in `stitch_nexcv_ats_builder/` — `screen.png` is the source of truth; `code.html` is structural reference only, never copy HTML into Flutter/Dart.
- Spring Boot backend uses **Maven** (`./mvnw`), not Gradle.
- Flutter state management is **Riverpod with code generation** (`riverpod_annotation`). No manual provider declarations.
- All API responses use `ApiResponse<T>` wrapper. All exceptions go through `GlobalExceptionHandler`.
- Follow the 8-step feature implementation sequence in `.ai/instructions.md` exactly — database migration first, UI last.
