# Polaris Frontend Agent Guide

## Project Context

- This is a Vue 3 + TypeScript + Vite frontend.
- Use Vue single-file components with `<script setup lang="ts">`.
- Use relative imports between project files; this project does not use path aliases.
- Shared types live in `src/types`.
- Shared constants live in `src/constants` when they are reused across files.
- API access goes through `src/services`.

## Visual And UI Rules

- Always read and follow `styles.md` before creating or changing UI.
- Use Tailwind CSS and the existing theme tokens from the project.
- Preserve the dark theme, spacing rhythm, borders, radius, hover states, and typography patterns described in `styles.md`.
- Use `lucide-vue-next` for icons when an icon is needed.
- Do not introduce new visual palettes unless the color comes from the backend or is explicitly required.

## Components And Reuse

- Split UI into reusable components when behavior, layout, or styling is repeated.
- Prefer shared components in `src/components/ui` for generic controls and layout primitives.
- Keep feature-specific components close to their feature folder under `src/components`.
- Avoid redundant logic, repeated Tailwind class groups, duplicated DTO shapes, and repeated constants.
- Extract repeated behavior into composables, helpers, constants, or typed components when it improves clarity.
- Keep components focused: props in, events out, and no unnecessary coupling to unrelated feature state.

## Creation Actions

- All actions that create new records must be exposed through the global `Novo` button in the page header.
- This includes items, gifts, people, categories, events, users, and all list types.
- Sidebars and contextual navigation may expose navigation, filtering, renaming, and deletion, but must not add separate creation buttons.

## API Contract

- Before creating or changing services, DTOs, request payloads, response types, or backend-integrated flows, consult the API Swagger:
  `http://polaris:8089/api/v1/v3/api-docs`
- Treat Swagger as the source of truth for endpoint paths, methods, payload fields, response fields, enums, and optionality.
- Keep `src/services/api.ts` as the shared Axios client and respect its current base URL unless the API contract requires a change.
- If Swagger is unavailable, document the assumption in the final response and keep changes conservative.

## Commits

- Make focused commits when there are multiple unrelated edits instead of one large catch-all commit.
- Group each commit around a single logical part of the work, even if other changes remain in the working tree.
- For example, if the sidebar changed, commit the sidebar and its related files together, then commit other feature areas separately.

## Verification

- Run `npm run lint` after code changes.
- Run `npm run build` after changes that affect TypeScript types, Vue components, services, routing, or build behavior.
- Use `npm run dev` for manual UI validation when the change affects user-facing screens.
- Before starting `npm run dev`, always stop any previous Vite/dev-server instances for this project, especially processes holding ports `5173`, `5174`, `5175`, or any alternate port used in the current session.
- Do not leave `npm run dev` running after validation; stop the session/process before finishing the task unless the user explicitly asks to keep it running.
- Documentation-only changes do not require lint or build unless they also modify source files.
