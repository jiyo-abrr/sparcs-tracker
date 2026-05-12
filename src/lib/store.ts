"use client";

import { useSyncExternalStore } from "react";
import { Product, MovementEntry, ProductReport, ProductStatus, ReportReason } from "@/lib/types";
import { INITIAL_PRODUCTS } from "@/data/products";

const STORAGE_KEY = "sparcs:products:v1";
const CHANGE_EVENT = "sparcs:products-changed";

function readStore(): Product[] {
  if (typeof window === "undefined") return INITIAL_PRODUCTS;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return INITIAL_PRODUCTS;
    const parsed = JSON.parse(raw) as Product[];
    return Array.isArray(parsed) ? parsed : INITIAL_PRODUCTS;
  } catch {
    return INITIAL_PRODUCTS;
  }
}

function writeStore(products: Product[]): void {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(products));
  window.dispatchEvent(new Event(CHANGE_EVENT));
}

function subscribe(callback: () => void): () => void {
  const onChange = () => callback();
  window.addEventListener(CHANGE_EVENT, onChange);
  window.addEventListener("storage", onChange);
  return () => {
    window.removeEventListener(CHANGE_EVENT, onChange);
    window.removeEventListener("storage", onChange);
  };
}

function sha1Hex(input: string): string {
  // Lightweight non-cryptographic placeholder hash; security_hash is decorative for the demo.
  let h1 = 0xdeadbeef ^ 0;
  let h2 = 0x41c6ce57 ^ 0;
  for (let i = 0, ch: number; i < input.length; i++) {
    ch = input.charCodeAt(i);
    h1 = Math.imul(h1 ^ ch, 2654435761);
    h2 = Math.imul(h2 ^ ch, 1597334677);
  }
  h1 = Math.imul(h1 ^ (h1 >>> 16), 2246822507) ^ Math.imul(h2 ^ (h2 >>> 13), 3266489909);
  h2 = Math.imul(h2 ^ (h2 >>> 16), 2246822507) ^ Math.imul(h1 ^ (h1 >>> 13), 3266489909);
  const out = (h2 >>> 0).toString(16).padStart(8, "0") + (h1 >>> 0).toString(16).padStart(8, "0");
  return out.repeat(3).slice(0, 40);
}

function generateId(): string {
  const year = new Date().getFullYear();
  const letters = Array.from({ length: 3 }, () =>
    String.fromCharCode(65 + Math.floor(Math.random() * 26))
  ).join("");
  const digits = Math.floor(100000 + Math.random() * 900000);
  return `PH-${year}-${letters}-${digits}`;
}

export interface CreateProductInput {
  manufacturer: string;
  factory_name: string;
  factory_city: string;
  factory_country?: string;
  facility_id: string;
  factory_lat: number;
  factory_lng: number;
  production_line: string;
  production_timestamp: string;
  intended_destination: string;
  current_warehouse_id?: string;
  current_location_name?: string;
  shipment_id: string;
  brand: string;
  variant: string;
  sku_code: string;
  intended_market?: string;
  tax_status?: "Paid" | "Unpaid" | "Pending";
  activation_date?: string;
}

export function getAllProducts(): Product[] {
  return readStore();
}

export function getProductById(id: string): Product | null {
  return readStore().find((p) => p.uid_details.unique_id === id) ?? null;
}

export function createProduct(input: CreateProductInput): Product {
  const id = generateId();
  const ts = input.production_timestamp || new Date().toISOString();
  const product: Product = {
    status: "VALID",
    uid_details: {
      unique_id: id,
      activation_date: input.activation_date || new Date().toISOString(),
      tax_status: input.tax_status ?? "Paid",
      security_hash: sha1Hex(id + ts),
    },
    origin_details: {
      manufacturer: input.manufacturer,
      factory_name: input.factory_name,
      factory_location: {
        city: input.factory_city,
        country: input.factory_country || "Philippines",
        facility_id: input.facility_id,
        coordinates: { lat: input.factory_lat, lng: input.factory_lng },
      },
      production_line: input.production_line,
      production_timestamp: ts,
    },
    logistics_details: {
      intended_destination: input.intended_destination,
      current_warehouse_id: input.current_warehouse_id ?? "",
      current_location_name: input.current_location_name ?? "",
      shipment_id: input.shipment_id,
      movement_history: [],
    },
    product_specs: {
      brand: input.brand,
      variant: input.variant,
      sku_code: input.sku_code,
      intended_market: input.intended_market ?? "Philippines Domestic",
    },
    reports: [],
    created_at: new Date().toISOString(),
  };
  const next = [product, ...readStore()];
  writeStore(next);
  return product;
}

export type ProductPatch = Partial<{
  status: ProductStatus;
  current_warehouse_id: string;
  current_location_name: string;
}>;

export function updateProduct(id: string, patch: ProductPatch): Product | null {
  const products = readStore();
  let updated: Product | null = null;
  const next = products.map((p) => {
    if (p.uid_details.unique_id !== id) return p;
    updated = {
      ...p,
      status: patch.status ?? p.status,
      logistics_details: {
        ...p.logistics_details,
        current_warehouse_id: patch.current_warehouse_id ?? p.logistics_details.current_warehouse_id,
        current_location_name: patch.current_location_name ?? p.logistics_details.current_location_name,
      },
    };
    return updated;
  });
  if (updated) writeStore(next);
  return updated;
}

export function deleteProduct(id: string): void {
  const next = readStore().filter((p) => p.uid_details.unique_id !== id);
  writeStore(next);
}

export interface AddMovementInput {
  stage: string;
  location: string;
  lat: number;
  lng: number;
  status: string;
  timestamp?: string;
}

export function addMovement(productId: string, input: AddMovementInput): Product | null {
  const products = readStore();
  const maxId = products
    .flatMap((p) => p.logistics_details.movement_history.map((m) => m.id))
    .reduce((a, b) => Math.max(a, b), 0);

  const entry: MovementEntry = {
    id: maxId + 1,
    product_id: productId,
    stage: input.stage,
    location: input.location,
    coordinates: { lat: input.lat, lng: input.lng },
    timestamp: input.timestamp ?? new Date().toISOString(),
    status: input.status,
  };

  let updated: Product | null = null;
  const next = products.map((p) => {
    if (p.uid_details.unique_id !== productId) return p;
    updated = {
      ...p,
      logistics_details: {
        ...p.logistics_details,
        movement_history: [...p.logistics_details.movement_history, entry],
      },
    };
    return updated;
  });
  if (updated) writeStore(next);
  return updated;
}

export function addReport(productId: string, reason: ReportReason): Product | null {
  const products = readStore();
  const maxId = products
    .flatMap((p) => p.reports.map((r) => r.id))
    .reduce((a, b) => Math.max(a, b), 0);

  const report: ProductReport = {
    id: maxId + 1,
    product_id: productId,
    reason,
    timestamp: new Date().toISOString(),
  };

  let updated: Product | null = null;
  const next = products.map((p) => {
    if (p.uid_details.unique_id !== productId) return p;
    updated = {
      ...p,
      status: "FLAGGED",
      reports: [...p.reports, report],
    };
    return updated;
  });
  if (updated) writeStore(next);
  return updated;
}

export function resetToSeed(): void {
  writeStore(INITIAL_PRODUCTS);
}

export function useProducts(): Product[] {
  const products = useSyncExternalStore(
    subscribe,
    () => readStore(),
    () => INITIAL_PRODUCTS,
  );
  return products;
}

export function useProduct(id: string): Product | null {
  const products = useProducts();
  return products.find((p) => p.uid_details.unique_id === id) ?? null;
}

const subscribeNoop = () => () => {};

export function useHasHydrated(): boolean {
  return useSyncExternalStore(subscribeNoop, () => true, () => false);
}

export const _internals = { readStore, writeStore, STORAGE_KEY };
