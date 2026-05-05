# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
yarn dev          # Start with hot-reload (development)
yarn build        # Build admin panel
yarn start        # Start without hot-reload (production)
```

No test suite configured. No linter configured beyond TypeScript.

## Stack

Strapi 5 (headless CMS) + PostgreSQL. `DATABASE_CLIENT=postgres` in production; defaults to SQLite locally (`.tmp/data.db`). Node >=20 required.

## Architecture

Multi-tenant wedding event API. Each authenticated user (admin) manages one or more `Event` records. All resources (Guest, Table, Companion) are scoped to an event.

### Security model

`api::event.event-scope` middleware (at `src/api/event/middlewares/event-scope.ts`) is the gatekeeper for every route on every collection type. It:

1. Requires authenticated user (`ctx.state.user`)
2. Fetches all events where `event.admins` contains the user → stores in `ctx.state.events`
3. If a `filters[event][documentId][$eq]` query param is present, validates the user owns that event and **force-injects** the filter into `ctx.query` — prevents unauthorized cross-event reads
4. Stores `ctx.state.event` and `ctx.state.eventDocumentId` for downstream use

All routes for `event`, `guest`, `table`, and `companion` register this middleware. Controllers then verify `ctx.state.events` ownership before mutations on `findOne`, `update`, and `delete`.

**Critical invariant:** `update` handlers always strip the `event` field from request body to prevent re-assigning a resource to a different event.

### Data model

```
Event (1) ──< Guest (1) ──< Companion
  │                └── Table (captain_guest)
  └──< Table ──── Companion (captain_companion)
  └── admins: manyToMany → users-permissions.user
```

- `Event` has embedded components: `schedule` (schedule-item), `locations` (location), `gift_registry` (gift-registry)
- `Guest.unique_code` is unique across all guests
- `Guest.status`: `pending | yes | no`
- `Companion` carries its own `event` relation (denormalized) for direct scoping without joining through `guest`

### Adding a new collection type

1. Create schema at `src/api/<name>/content-types/<name>/schema.json` — add `event` relation (`manyToOne`) if event-scoped
2. Wire `api::event.event-scope` middleware in the router for all routes
3. In the controller, implement ownership check pattern from `guest.ts` or `table.ts` for `findOne`, `update`, `delete`
4. Strip `event` from body in `update` to prevent reassignment
