# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Repository state

This repository currently contains **no application code** — only planning documents in `INSTRUCTION/`. There is no `package.json`, no `src/`, no build tooling yet. The `.gitignore` is pre-configured for a Next.js project, confirming Next.js as the intended stack, but nothing has been scaffolded.

Before writing code here, read the relevant file(s) in `INSTRUCTION/` — they are the spec for what to build, not background reading.

## What's being built

**Shopify Integrator** (`INSTRUCTION/shopify_integrator_spec.md`): a local-first tool that diffs product data between a PIM and Shopify, then lets a user selectively approve which records/fields to sync. It does not build a storefront — it's an internal sync/diff dashboard.

Key design points to preserve when implementing:

- **Three-level selection granularity** is core to the UX: sync everything, sync selected products (checkboxes), or sync selected fields within a single product (e.g. only title + images, not the whole record). Don't collapse this into a single "sync all" action.
- **Diffing is per-record and per-field.** Each product needs a PIM id, a mapped `shopify_id`, and its own sync state (last synced hash, last synced date, status) so the app can distinguish new / changed / removed / needs-manual-decision.
- **Suggested layered structure** (from the spec, follow this separation rather than flattening into one folder):
  - `app/` — pages/layouts
  - `components/` — table, diff viewer, filters, status badges
  - `modules/` — domain logic per concern: `pim`, `shopify`, `sync`, `diff`
  - `services/` — API communication, mapping, transport
  - `stores/` — UI/app state (selections, filters)
  - `types/` — data contracts
  - `config/` — field maps, sync settings
  - `lib/` — generic helpers
- **Build order matters**: PIM import + table display first (read-only) → add Shopify comparison (read-only) → add record/field selection UI → add actual write-sync to Shopify + sync history. Don't jump straight to building the write path.
- Shopify side will eventually use the Admin GraphQL API (token-based auth, scoped permissions) for reading products/metafields/media and writing selected updates. Use Shopify's GraphiQL for exploring queries/mutations before wiring up the connector.
- Scaffolding command for the UI, per `INSTRUCTION/shopify-integrator-design-link.md`:
  ```
  npx shadcn@latest init --preset bIkf1TW --template next --pointer
  ```
  Treat this preset as the starting baseline rather than hand-rolling a different component setup.

## Beautifly API reference (`INSTRUCTION/BEAUTIFLY_API.md`)

This is documentation for the **PIM side** — a separate read-only REST API (`https://devbeautifly.host486049.xce.pl/api/v1`) that will act as the PIM connector's data source. Notes if/when implementing the PIM connector module:

- Auth via `X-API-Key` header.
- Three endpoints: `GET /products` (list), `GET /products/{id}` (single), `GET /products/{id}/llm-ready` (AI-optimized, no `include` support).
- `include` controls which data sections are returned (`main_details`, `description_data`, `media`, `categories`, `families`, `attributes`, `parameters`, `price`); `fields` restricts returned fields by CSV; `lang` is `pl|en|de`.
- **There is no server-side search/filter by name.** The documented pattern is: fetch the full product list with `fields=id,sku,name` (paginating via `?page=N` until `meta.total` is reached), filter client-side, then re-fetch full details for matched IDs via `/products/{id}` with the needed `include` values. Reuse this three-step flow rather than re-deriving it.
- The doc's code samples (`src/api.ts`, `search-products.tsx`, `product-detail.tsx`) were written for a Raycast extension, not this Next.js app — adapt the fetch/typing logic rather than the Raycast-specific UI when building the PIM connector module here.
