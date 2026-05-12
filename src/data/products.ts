import { Product } from "@/lib/types";

export const INITIAL_PRODUCTS: Product[] = [
  {
    status: "VALID",
    uid_details: {
      unique_id: "PH-2026-TBC-441021",
      activation_date: "2026-05-10T08:30:00Z",
      tax_status: "Paid",
      security_hash: "ca0b1a70ff8d93f6121bd836a583bdc792b6cd80",
    },
    origin_details: {
      manufacturer: "Global Tobacco Corp",
      factory_name: "Plant Delta-09",
      factory_location: {
        city: "Batangas",
        country: "Philippines",
        facility_id: "FAC-88221",
        coordinates: { lat: 14.12, lng: 121.08 },
      },
      production_line: "Line_04_HighSpeed",
      production_timestamp: "2026-05-10T14:45:12Z",
    },
    logistics_details: {
      intended_destination: "Region VII - Central Visayas",
      current_warehouse_id: "WH-CEBU-FINAL-05",
      current_location_name: "Mandaue City Logistics Hub",
      shipment_id: "SHIP-77665544-B",
      movement_history: [
        { id: 1, product_id: "PH-2026-TBC-441021", stage: "Factory Exit",               location: "Plant Delta-09, Batangas",      coordinates: { lat: 14.12,   lng: 121.08   }, timestamp: "2026-05-10T16:00:00Z", status: "Released" },
        { id: 2, product_id: "PH-2026-TBC-441021", stage: "Warehouse A (Primary Hub)",  location: "Quezon City, Metro Manila",     coordinates: { lat: 14.676,  lng: 121.0437 }, timestamp: "2026-05-11T09:15:00Z", status: "Transferred" },
        { id: 3, product_id: "PH-2026-TBC-441021", stage: "Warehouse B (Port Transit)", location: "Port of Manila, Terminal 3",    coordinates: { lat: 14.595,  lng: 120.965  }, timestamp: "2026-05-11T22:30:00Z", status: "In-Transit (Sea)" },
        { id: 4, product_id: "PH-2026-TBC-441021", stage: "Final Warehouse",            location: "Mandaue City, Cebu",            coordinates: { lat: 10.3317, lng: 123.9311 }, timestamp: "2026-05-12T08:45:00Z", status: "Received at Destination" },
      ],
    },
    product_specs: {
      brand: "Mountain Fresh",
      variant: "Menthol 20s",
      sku_code: "SKU-5544",
      intended_market: "Philippines Domestic",
    },
    security_alerts: {
      is_duplicate_detected: false,
      reported_stolen: false,
      geofencing_violation: false,
      last_scanned_coordinates: { lat: 10.3317, lng: 123.9311 },
      distance_deviation_km: 0.01,
    },
    created_at: "2026-05-10T08:30:00Z",
  },
  {
    status: "VALID",
    uid_details: {
      unique_id: "PH-2026-BVG-882034",
      activation_date: "2026-05-09T06:00:00Z",
      tax_status: "Paid",
      security_hash: "2ac862e1271af5b234dc58ddae4862271a882ea1",
    },
    origin_details: {
      manufacturer: "PhilBev Industries Inc.",
      factory_name: "Bottling Plant Laguna-03",
      factory_location: {
        city: "Santa Rosa",
        country: "Philippines",
        facility_id: "FAC-30145",
        coordinates: { lat: 14.2867, lng: 121.1114 },
      },
      production_line: "Line_02_BeverageFill",
      production_timestamp: "2026-05-09T07:20:00Z",
    },
    logistics_details: {
      intended_destination: "Region XI - Davao",
      current_warehouse_id: "WH-MNL-SOUTH-02",
      current_location_name: "Muntinlupa South Distribution Center",
      shipment_id: "SHIP-22334455-C",
      movement_history: [
        { id: 5, product_id: "PH-2026-BVG-882034", stage: "Factory Exit",              location: "Bottling Plant Laguna-03, Santa Rosa", coordinates: { lat: 14.2867, lng: 121.1114 }, timestamp: "2026-05-09T10:00:00Z", status: "Released" },
        { id: 6, product_id: "PH-2026-BVG-882034", stage: "Regional Distribution Hub", location: "Muntinlupa South DC, Metro Manila",    coordinates: { lat: 14.4081, lng: 121.0415 }, timestamp: "2026-05-10T06:30:00Z", status: "Transferred" },
      ],
    },
    product_specs: {
      brand: "ClearSpring",
      variant: "Mineral Water 500mL",
      sku_code: "SKU-8821",
      intended_market: "Philippines Domestic",
    },
    security_alerts: {
      is_duplicate_detected: false,
      reported_stolen: false,
      geofencing_violation: false,
      last_scanned_coordinates: { lat: 14.4081, lng: 121.0415 },
      distance_deviation_km: 0.0,
    },
    created_at: "2026-05-09T06:00:00Z",
  },
  {
    status: "FLAGGED",
    uid_details: {
      unique_id: "PH-2026-ALC-339901",
      activation_date: "2026-05-08T08:00:00Z",
      tax_status: "Paid",
      security_hash: "8f3871896996be799bf751aee0b7d48728907704",
    },
    origin_details: {
      manufacturer: "Distileria del Norte Corp.",
      factory_name: "Distillery Bulacan-07",
      factory_location: {
        city: "Meycauayan",
        country: "Philippines",
        facility_id: "FAC-55902",
        coordinates: { lat: 14.7356, lng: 120.961 },
      },
      production_line: "Line_01_Spirits",
      production_timestamp: "2026-05-08T09:10:00Z",
    },
    logistics_details: {
      intended_destination: "Region I - Ilocos Norte",
      current_warehouse_id: "WH-HOLD-BGS-01",
      current_location_name: "BIR Customs Hold — NAIA Terminal 3",
      shipment_id: "SHIP-99001122-A",
      movement_history: [
        { id: 7, product_id: "PH-2026-ALC-339901", stage: "Factory Exit",       location: "Distillery Bulacan-07, Meycauayan",   coordinates: { lat: 14.7356, lng: 120.961  }, timestamp: "2026-05-08T11:00:00Z", status: "Released" },
        { id: 8, product_id: "PH-2026-ALC-339901", stage: "Customs Clearance",  location: "Bureau of Customs, Manila Port Zone", coordinates: { lat: 14.5839, lng: 120.9716 }, timestamp: "2026-05-09T08:45:00Z", status: "Transferred" },
        { id: 9, product_id: "PH-2026-ALC-339901", stage: "Flagged — Geofence", location: "NAIA Terminal 3, Pasay City",         coordinates: { lat: 14.5086, lng: 121.0194 }, timestamp: "2026-05-10T14:20:00Z", status: "Held" },
      ],
    },
    product_specs: {
      brand: "Gran Reserva",
      variant: "Premium Rum 750mL",
      sku_code: "SKU-1190",
      intended_market: "Philippines Domestic",
    },
    security_alerts: {
      is_duplicate_detected: false,
      reported_stolen: false,
      geofencing_violation: true,
      last_scanned_coordinates: { lat: 14.5086, lng: 121.0194 },
      distance_deviation_km: 38.5,
    },
    created_at: "2026-05-08T08:00:00Z",
  },
];
