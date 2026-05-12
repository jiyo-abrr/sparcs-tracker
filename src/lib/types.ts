export type ProductStatus = "VALID" | "INVALID" | "FLAGGED";
export type TaxStatus = "Paid" | "Unpaid" | "Pending";

export const REPORT_REASONS = [
  "Wrong product label",
  "For export products",
  "Wrong location label",
] as const;
export type ReportReason = (typeof REPORT_REASONS)[number];

export interface Coordinates {
  lat: number;
  lng: number;
}

export interface MovementEntry {
  id: number;
  product_id: string;
  stage: string;
  location: string;
  coordinates: Coordinates;
  timestamp: string;
  status: string;
}

export interface ProductReport {
  id: number;
  product_id: string;
  reason: ReportReason;
  timestamp: string;
}

export interface Product {
  status: ProductStatus;
  uid_details: {
    unique_id: string;
    activation_date: string;
    tax_status: TaxStatus;
    security_hash: string;
  };
  origin_details: {
    manufacturer: string;
    factory_name: string;
    factory_location: {
      city: string;
      country: string;
      facility_id: string;
      coordinates: Coordinates;
    };
    production_line: string;
    production_timestamp: string;
  };
  logistics_details: {
    intended_destination: string;
    current_warehouse_id: string;
    current_location_name: string;
    shipment_id: string;
    movement_history: MovementEntry[];
  };
  product_specs: {
    brand: string;
    variant: string;
    sku_code: string;
    intended_market: string;
  };
  reports: ProductReport[];
  created_at: string;
}

// Flat SQLite row types
export interface ProductRow {
  id: string;
  activation_date: string;
  tax_status: string;
  security_hash: string;
  status: string;
  manufacturer: string;
  factory_name: string;
  factory_city: string;
  factory_country: string;
  facility_id: string;
  factory_lat: number;
  factory_lng: number;
  production_line: string;
  production_timestamp: string;
  intended_destination: string;
  current_warehouse_id: string;
  current_location_name: string;
  shipment_id: string;
  brand: string;
  variant: string;
  sku_code: string;
  intended_market: string;
  created_at: string;
}

export interface ReportRow {
  id: number;
  product_id: string;
  reason: string;
  timestamp: string;
}

export interface MovementRow {
  id: number;
  product_id: string;
  stage: string;
  location: string;
  lat: number;
  lng: number;
  timestamp: string;
  status: string;
}

export function rowToProduct(
  row: ProductRow,
  movements: MovementRow[] = [],
  reports: ReportRow[] = [],
): Product {
  return {
    status: row.status as ProductStatus,
    uid_details: {
      unique_id: row.id,
      activation_date: row.activation_date,
      tax_status: row.tax_status as TaxStatus,
      security_hash: row.security_hash,
    },
    origin_details: {
      manufacturer: row.manufacturer,
      factory_name: row.factory_name,
      factory_location: {
        city: row.factory_city,
        country: row.factory_country,
        facility_id: row.facility_id,
        coordinates: { lat: row.factory_lat, lng: row.factory_lng },
      },
      production_line: row.production_line,
      production_timestamp: row.production_timestamp,
    },
    logistics_details: {
      intended_destination: row.intended_destination,
      current_warehouse_id: row.current_warehouse_id,
      current_location_name: row.current_location_name,
      shipment_id: row.shipment_id,
      movement_history: movements.map((m) => ({
        id: m.id,
        product_id: m.product_id,
        stage: m.stage,
        location: m.location,
        coordinates: { lat: m.lat, lng: m.lng },
        timestamp: m.timestamp,
        status: m.status,
      })),
    },
    product_specs: {
      brand: row.brand,
      variant: row.variant,
      sku_code: row.sku_code,
      intended_market: row.intended_market,
    },
    reports: reports.map((r) => ({
      id: r.id,
      product_id: r.product_id,
      reason: r.reason as ReportReason,
      timestamp: r.timestamp,
    })),
    created_at: row.created_at,
  };
}
