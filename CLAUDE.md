# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

> **Next.js version note (from AGENTS.md):** This project uses Next.js 16, which has breaking changes from prior versions. APIs, conventions, and file structure may differ from training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.

## Commands

```bash
npm run dev       # start dev server (http://localhost:3000)
npm run build     # production build
npm run start     # run production build
npm run lint      # ESLint
```

No test suite is configured.

## Architecture

**Stack:** Next.js 16 App Router · React 19 · TypeScript · Tailwind CSS v4 · shadcn/ui · better-sqlite3 · Leaflet · html5-qrcode · qrcode

**Database:** SQLite file at `sparcs.db` (project root). The singleton connection is created on first call to `getDb()` in `src/lib/db.ts` with WAL mode and foreign keys enabled. Schema is auto-created on startup with a version check (`PRAGMA user_version = 2`). Bumping `SCHEMA_VERSION` in `db.ts` drops and recreates all tables.

**Two tables:**

`products` — flat row mirroring the nested API response. Key columns:
- `id` (TEXT PK) — unique stamp ID in format `PH-{year}-{AAA}-{999999}`, generated server-side
- `security_hash` — SHA-1 of `id + production_timestamp`, auto-generated
- `status` — `VALID` | `INVALID` | `FLAGGED`
- Factory origin: `manufacturer`, `factory_name`, `factory_city`, `factory_country`, `facility_id`, `factory_lat/lng`, `production_line`, `production_timestamp`
- Logistics: `intended_destination`, `current_warehouse_id`, `current_location_name`, `shipment_id`
- Product: `brand`, `variant`, `sku_code`, `intended_market`
- Security: `is_duplicate_detected`, `reported_stolen`, `geofencing_violation` (integers 0/1), `last_scanned_lat/lng`, `distance_deviation_km`

`movement_history` — GPS checkpoints linked to a product via `product_id` (CASCADE delete). Columns: `stage`, `location`, `lat`, `lng`, `timestamp`, `status` (e.g. "Released", "Transferred", "In-Transit (Sea)").

**`src/lib/types.ts`** defines:
- `Product` — nested interface matching the JSON API shape (uid_details, origin_details, logistics_details, product_specs, security_alerts)
- `ProductRow` / `MovementRow` — flat SQLite row types
- `rowToProduct(row, movements)` — converts flat DB rows → nested `Product`; used in every API route and server page

**Page structure:**
- `/` — Server Component; queries DB directly with movement_history join, calls `rowToProduct`, passes result to `<Dashboard>` (client)
- `/products/[id]` — Server Component; fetches one product + movements, passes to `<ProductPageClient>`

**API routes (`src/app/api/`):**
- `GET/POST /api/products` — list all / create; POST auto-generates `id` and `security_hash`
- `GET/PATCH/DELETE /api/products/[id]` — read, update (status, security flags, current warehouse), delete
- `POST /api/locations` — append a movement entry; also updates `last_scanned_lat/lng` on the product
- `GET /api/scan?id=N` — full product + movement history (QR scan target)

All API responses return the nested `Product` shape (not flat DB rows).

**QR flow:** `<QRCodeDisplay>` encodes `{id: product.uid_details.unique_id}`. `<QRScanner>` decodes and navigates to `/products/${id}`. The product detail page then allows logging movements via `<AddLocationForm>`.

**Leaflet SSR workaround:** `<LocationMap>` wraps `<LocationMapInner>` with `next/dynamic` and `ssr: false`. `LocationMapInner` accepts `MovementEntry[]` (not the old `LocationLog[]`).

**UI components:** shadcn/ui primitives in `src/components/ui/`. Feature components in `src/components/`. Client components are marked `"use client"`.

**`src/lib/utils.ts`** exports `cn()` (clsx + tailwind-merge) for conditional class names.
