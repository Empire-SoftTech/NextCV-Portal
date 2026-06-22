# AGENTS.md — NexCV Project Instructions

This file provides guidance to OpenAI Codex and other agent-based AI coding tools working in this repository.

**Your first action in every session must be to read `.ai/instructions.md` completely before producing any code.**

That file is the authoritative source for project architecture, design tokens, folder structure, available UI screens, commands, and the mandatory feature implementation sequence.

Also read:
- `rules.md` — all coding, architecture, security, testing, and git standards (mandatory compliance)
- `skills.md` — domain expertise, architecture patterns, and project roadmap

## Critical rules (do not proceed without knowing these)

- **Build tool:** Spring Boot backend uses Maven (`./mvnw`). Never generate Gradle files.
- **Flutter state:** Riverpod with `riverpod_annotation` + code generation. Never declare providers manually.
- **Navigation:** GoRouter only in Flutter. No `Navigator.push` in feature code.
- **Tokens:** `flutter_secure_storage` only. Never SharedPreferences or localStorage.
- **Layer boundaries:** Domain layer (Flutter/Java) must have zero framework imports. Dependencies flow inward only.
- **API responses:** Every backend endpoint returns `ApiResponse<T>`. Never return raw objects.
- **Database changes:** Flyway SQL migration first — always — before any JPA entity or service code.
- **UI implementation:** Recreate `stitch_nexcv_ats_builder/{screen}/screen.png` using Flutter widgets. The `code.html` files are structural reference only — never copy HTML into Dart.
- **Feature sequence:** Follow the 8-step order in `.ai/instructions.md` §"Feature Implementation Sequence" without skipping steps.
