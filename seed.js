// Run from the sparcs-tracker directory: node seed.js
const Database = require("better-sqlite3");
const path = require("path");
const { createHash } = require("crypto");

const DB_PATH = path.join(__dirname, "sparcs.db");
const SCHEMA_VERSION = 2;

const db = new Database(DB_PATH);
db.pragma("journal_mode = WAL");
db.pragma("foreign_keys = ON");

// Ensure schema is at version 2
const version = db.pragma("user_version", { simple: true });
if (version < SCHEMA_VERSION) {
  db.exec(`
    DROP TABLE IF EXISTS location_logs;
    DROP TABLE IF EXISTS movement_history;
    DROP TABLE IF EXISTS products;

    CREATE TABLE products (
      id                    TEXT    PRIMARY KEY,
      activation_date       TEXT    NOT NULL,
      tax_status            TEXT    NOT NULL DEFAULT 'Paid',
      security_hash         TEXT    NOT NULL,
      status                TEXT    NOT NULL DEFAULT 'VALID',
      manufacturer          TEXT    NOT NULL,
      factory_name          TEXT    NOT NULL,
      factory_city          TEXT    NOT NULL,
      factory_country       TEXT    NOT NULL DEFAULT 'Philippines',
      facility_id           TEXT    NOT NULL,
      factory_lat           REAL    NOT NULL DEFAULT 0,
      factory_lng           REAL    NOT NULL DEFAULT 0,
      production_line       TEXT    NOT NULL,
      production_timestamp  TEXT    NOT NULL,
      intended_destination  TEXT    NOT NULL,
      current_warehouse_id  TEXT    NOT NULL DEFAULT '',
      current_location_name TEXT    NOT NULL DEFAULT '',
      shipment_id           TEXT    NOT NULL,
      brand                 TEXT    NOT NULL,
      variant               TEXT    NOT NULL,
      sku_code              TEXT    NOT NULL,
      intended_market       TEXT    NOT NULL DEFAULT 'Philippines Domestic',
      is_duplicate_detected INTEGER NOT NULL DEFAULT 0,
      reported_stolen       INTEGER NOT NULL DEFAULT 0,
      geofencing_violation  INTEGER NOT NULL DEFAULT 0,
      last_scanned_lat      REAL,
      last_scanned_lng      REAL,
      distance_deviation_km REAL    NOT NULL DEFAULT 0,
      created_at            TEXT    NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE movement_history (
      id         INTEGER PRIMARY KEY AUTOINCREMENT,
      product_id TEXT    NOT NULL REFERENCES products(id) ON DELETE CASCADE,
      stage      TEXT    NOT NULL,
      location   TEXT    NOT NULL,
      lat        REAL    NOT NULL,
      lng        REAL    NOT NULL,
      timestamp  TEXT    NOT NULL DEFAULT (datetime('now')),
      status     TEXT    NOT NULL
    );
  `);
  db.pragma(`user_version = ${SCHEMA_VERSION}`);
}

function hash(id, ts) {
  return createHash("sha1").update(id + ts).digest("hex");
}

const insertProduct = db.prepare(`
  INSERT OR IGNORE INTO products (
    id, activation_date, tax_status, security_hash, status,
    manufacturer, factory_name, factory_city, factory_country,
    facility_id, factory_lat, factory_lng, production_line, production_timestamp,
    intended_destination, current_warehouse_id, current_location_name,
    shipment_id, brand, variant, sku_code, intended_market,
    is_duplicate_detected, reported_stolen, geofencing_violation,
    last_scanned_lat, last_scanned_lng, distance_deviation_km
  ) VALUES (
    @id, @activation_date, @tax_status, @security_hash, @status,
    @manufacturer, @factory_name, @factory_city, @factory_country,
    @facility_id, @factory_lat, @factory_lng, @production_line, @production_timestamp,
    @intended_destination, @current_warehouse_id, @current_location_name,
    @shipment_id, @brand, @variant, @sku_code, @intended_market,
    @is_duplicate_detected, @reported_stolen, @geofencing_violation,
    @last_scanned_lat, @last_scanned_lng, @distance_deviation_km
  )
`);

const insertMovement = db.prepare(`
  INSERT INTO movement_history (product_id, stage, location, lat, lng, timestamp, status)
  VALUES (@product_id, @stage, @location, @lat, @lng, @timestamp, @status)
`);

// ─────────────────────────────────────────────────────────────────────────────
// 1. TOBACCO — Mountain Fresh Menthol 20s  (VALID, fully delivered to Cebu)
// ─────────────────────────────────────────────────────────────────────────────
const tobaccoId = "PH-2026-TBC-441021";
const tobaccoTs = "2026-05-10T14:45:12Z";
insertProduct.run({
  id: tobaccoId,
  activation_date: "2026-05-10T08:30:00Z",
  tax_status: "Paid",
  security_hash: hash(tobaccoId, tobaccoTs),
  status: "VALID",
  manufacturer: "Global Tobacco Corp",
  factory_name: "Plant Delta-09",
  factory_city: "Batangas",
  factory_country: "Philippines",
  facility_id: "FAC-88221",
  factory_lat: 14.1200,
  factory_lng: 121.0800,
  production_line: "Line_04_HighSpeed",
  production_timestamp: tobaccoTs,
  intended_destination: "Region VII - Central Visayas",
  current_warehouse_id: "WH-CEBU-FINAL-05",
  current_location_name: "Mandaue City Logistics Hub",
  shipment_id: "SHIP-77665544-B",
  brand: "Mountain Fresh",
  variant: "Menthol 20s",
  sku_code: "SKU-5544",
  intended_market: "Philippines Domestic",
  is_duplicate_detected: 0,
  reported_stolen: 0,
  geofencing_violation: 0,
  last_scanned_lat: 10.3317,
  last_scanned_lng: 123.9311,
  distance_deviation_km: 0.01,
});
[
  { stage: "Factory Exit",              location: "Plant Delta-09, Batangas",            lat: 14.1200, lng: 121.0800, timestamp: "2026-05-10T16:00:00Z", status: "Released" },
  { stage: "Warehouse A (Primary Hub)", location: "Quezon City, Metro Manila",           lat: 14.6760, lng: 121.0437, timestamp: "2026-05-11T09:15:00Z", status: "Transferred" },
  { stage: "Warehouse B (Port Transit)",location: "Port of Manila, Terminal 3",          lat: 14.5950, lng: 120.9650, timestamp: "2026-05-11T22:30:00Z", status: "In-Transit (Sea)" },
  { stage: "Final Warehouse",           location: "Mandaue City, Cebu",                 lat: 10.3317, lng: 123.9311, timestamp: "2026-05-12T08:45:00Z", status: "Received at Destination" },
].forEach((m) => insertMovement.run({ product_id: tobaccoId, ...m }));

// ─────────────────────────────────────────────────────────────────────────────
// 2. BEVERAGE — ClearSpring Mineral Water 500mL  (VALID, in-transit to Davao)
// ─────────────────────────────────────────────────────────────────────────────
const bevId = "PH-2026-BVG-882034";
const bevTs = "2026-05-09T07:20:00Z";
insertProduct.run({
  id: bevId,
  activation_date: "2026-05-09T06:00:00Z",
  tax_status: "Paid",
  security_hash: hash(bevId, bevTs),
  status: "VALID",
  manufacturer: "PhilBev Industries Inc.",
  factory_name: "Bottling Plant Laguna-03",
  factory_city: "Santa Rosa",
  factory_country: "Philippines",
  facility_id: "FAC-30145",
  factory_lat: 14.2867,
  factory_lng: 121.1114,
  production_line: "Line_02_BeverageFill",
  production_timestamp: bevTs,
  intended_destination: "Region XI - Davao",
  current_warehouse_id: "WH-MNL-SOUTH-02",
  current_location_name: "Muntinlupa South Distribution Center",
  shipment_id: "SHIP-22334455-C",
  brand: "ClearSpring",
  variant: "Mineral Water 500mL",
  sku_code: "SKU-8821",
  intended_market: "Philippines Domestic",
  is_duplicate_detected: 0,
  reported_stolen: 0,
  geofencing_violation: 0,
  last_scanned_lat: 14.4081,
  last_scanned_lng: 121.0415,
  distance_deviation_km: 0.00,
});
[
  { stage: "Factory Exit",               location: "Bottling Plant Laguna-03, Santa Rosa", lat: 14.2867, lng: 121.1114, timestamp: "2026-05-09T10:00:00Z", status: "Released" },
  { stage: "Regional Distribution Hub",  location: "Muntinlupa South DC, Metro Manila",    lat: 14.4081, lng: 121.0415, timestamp: "2026-05-10T06:30:00Z", status: "Transferred" },
].forEach((m) => insertMovement.run({ product_id: bevId, ...m }));

// ─────────────────────────────────────────────────────────────────────────────
// 3. ALCOHOLIC BEVERAGE — Gran Reserva Premium Rum  (FLAGGED — geofencing violation)
// ─────────────────────────────────────────────────────────────────────────────
const alcId = "PH-2026-ALC-339901";
const alcTs = "2026-05-08T09:10:00Z";
insertProduct.run({
  id: alcId,
  activation_date: "2026-05-08T08:00:00Z",
  tax_status: "Paid",
  security_hash: hash(alcId, alcTs),
  status: "FLAGGED",
  manufacturer: "Distileria del Norte Corp.",
  factory_name: "Distillery Bulacan-07",
  factory_city: "Meycauayan",
  factory_country: "Philippines",
  facility_id: "FAC-55902",
  factory_lat: 14.7356,
  factory_lng: 120.9610,
  production_line: "Line_01_Spirits",
  production_timestamp: alcTs,
  intended_destination: "Region I - Ilocos Norte",
  current_warehouse_id: "WH-HOLD-BGS-01",
  current_location_name: "BIR Customs Hold — NAIA Terminal 3",
  shipment_id: "SHIP-99001122-A",
  brand: "Gran Reserva",
  variant: "Premium Rum 750mL",
  sku_code: "SKU-1190",
  intended_market: "Philippines Domestic",
  is_duplicate_detected: 0,
  reported_stolen: 0,
  geofencing_violation: 1,
  last_scanned_lat: 14.5086,
  last_scanned_lng: 121.0194,
  distance_deviation_km: 38.5,
});
[
  { stage: "Factory Exit",        location: "Distillery Bulacan-07, Meycauayan",      lat: 14.7356, lng: 120.9610, timestamp: "2026-05-08T11:00:00Z", status: "Released" },
  { stage: "Customs Clearance",   location: "Bureau of Customs, Manila Port Zone",    lat: 14.5839, lng: 120.9716, timestamp: "2026-05-09T08:45:00Z", status: "Transferred" },
  { stage: "Flagged — Geofence",  location: "NAIA Terminal 3, Pasay City",            lat: 14.5086, lng: 121.0194, timestamp: "2026-05-10T14:20:00Z", status: "Held" },
].forEach((m) => insertMovement.run({ product_id: alcId, ...m }));

console.log("✓ Seed complete — 3 products inserted:");
console.log(`  ${tobaccoId}  Mountain Fresh Menthol 20s       [VALID]`);
console.log(`  ${bevId}    ClearSpring Mineral Water 500mL  [VALID]`);
console.log(`  ${alcId}    Gran Reserva Premium Rum 750mL   [FLAGGED]`);

db.close();
