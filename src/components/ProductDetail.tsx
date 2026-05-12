"use client";

import { Product, getMarketKind } from "@/lib/types";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  MapPin, Package, Building2, Hash, FileText, Clock, Factory,
  AlertTriangle, Truck, Globe,
} from "lucide-react";
import LocationMap from "./LocationMap";

const STATUS_VARIANT: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
  VALID:   "default",
  INVALID: "destructive",
  FLAGGED: "secondary",
};

const MOVE_STATUS_COLOR: Record<string, string> = {
  "Released":                "bg-green-500",
  "Transferred":             "bg-blue-400",
  "In-Transit (Road)":       "bg-yellow-400",
  "In-Transit (Sea)":        "bg-cyan-500",
  "In-Transit (Air)":        "bg-purple-500",
  "Received at Destination": "bg-emerald-500",
  "Held":                    "bg-orange-500",
  "Seized":                  "bg-red-600",
};

function InfoCell({ icon: Icon, label, value }: { icon: React.ElementType; label: string; value: string }) {
  return (
    <div className="flex items-start gap-2.5 rounded-lg border bg-muted/30 px-3 py-2.5 min-w-0">
      <Icon size={14} className="text-muted-foreground shrink-0 mt-0.5" />
      <div className="min-w-0">
        <p className="text-[10px] uppercase tracking-wide text-muted-foreground">{label}</p>
        <p className="text-sm font-semibold truncate">{value}</p>
      </div>
    </div>
  );
}

interface Props {
  product: Product;
}

export default function ProductDetail({ product }: Props) {
  const { uid_details, origin_details, logistics_details, product_specs } = product;
  const history = logistics_details.movement_history;

  return (
    <div className="space-y-6">
      {/* ── Hero ── */}
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h2 className="text-xl font-bold leading-tight">
            {product_specs.brand} · {product_specs.variant}
          </h2>
          <p className="text-xs text-muted-foreground font-mono mt-0.5">{uid_details.unique_id}</p>
        </div>
        <div className="flex flex-col items-end gap-1.5 shrink-0 mt-1">
          <Badge variant={STATUS_VARIANT[product.status] ?? "outline"} className="text-sm px-3 py-1">
            {product.status}
          </Badge>
          {(() => {
            const kind = getMarketKind(product_specs.intended_market);
            return (
              <span
                className={
                  kind === "EXPORT"
                    ? "text-[10px] font-bold tracking-wider rounded-full px-2.5 py-1 bg-purple-100 text-purple-800 border border-purple-300"
                    : "text-[10px] font-bold tracking-wider rounded-full px-2.5 py-1 bg-blue-100 text-blue-800 border border-blue-300"
                }
              >
                {kind}
              </span>
            );
          })()}
        </div>
      </div>

      <Separator />

      {/* ── UID Details ── */}
      <section>
        <h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-3">UID Details</h3>
        <div className="grid grid-cols-2 gap-2">
          <InfoCell icon={Hash}     label="Unique ID"       value={uid_details.unique_id} />
          <InfoCell icon={Clock}    label="Activation Date" value={new Date(uid_details.activation_date).toLocaleString('en-PH')} />
          <InfoCell icon={FileText} label="Tax Status"      value={uid_details.tax_status} />
          <div className="flex items-start gap-2.5 rounded-lg border bg-muted/30 px-3 py-2.5 col-span-2 min-w-0">
            <Hash size={14} className="text-muted-foreground shrink-0 mt-0.5" />
            <div className="min-w-0">
              <p className="text-[10px] uppercase tracking-wide text-muted-foreground">Security Hash</p>
              <p className="text-xs font-mono break-all">{uid_details.security_hash}</p>
            </div>
          </div>
        </div>
      </section>

      <Separator />

      {/* ── Origin Details ── */}
      <section>
        <h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-3">Origin Details</h3>
        <div className="grid grid-cols-2 gap-2">
          <InfoCell icon={Building2} label="Manufacturer"       value={origin_details.manufacturer} />
          <InfoCell icon={Factory}   label="Factory Name"       value={origin_details.factory_name} />
          <InfoCell icon={MapPin}    label="City"               value={origin_details.factory_location.city} />
          <InfoCell icon={Globe}     label="Country"            value={origin_details.factory_location.country} />
          <InfoCell icon={Hash}      label="Facility ID"        value={origin_details.factory_location.facility_id} />
          <InfoCell icon={Truck}     label="Production Line"    value={origin_details.production_line} />
          <div className="col-span-2">
            <InfoCell icon={Clock} label="Production Timestamp" value={new Date(origin_details.production_timestamp).toLocaleString('en-PH')} />
          </div>
          {origin_details.factory_location.coordinates.lat !== 0 && (
            <div className="col-span-2 text-xs text-muted-foreground font-mono px-3 py-1">
              Factory coords: {origin_details.factory_location.coordinates.lat.toFixed(5)}, {origin_details.factory_location.coordinates.lng.toFixed(5)}
            </div>
          )}
        </div>
      </section>

      <Separator />

      {/* ── Product Specs ── */}
      <section>
        <h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-3">Product Specs</h3>
        <div className="grid grid-cols-2 gap-2">
          <InfoCell icon={Package}   label="Brand"           value={product_specs.brand} />
          <InfoCell icon={Package}   label="Variant"         value={product_specs.variant} />
          <InfoCell icon={Hash}      label="SKU Code"        value={product_specs.sku_code} />
          <InfoCell icon={Globe}     label="Intended Market" value={product_specs.intended_market} />
        </div>
        {product_specs.intended_market !== "Philippines Domestic" && (
          <div className="mt-2 flex items-center gap-2 rounded-lg border border-orange-400/40 bg-orange-50 px-3 py-2 text-xs text-orange-700">
            <AlertTriangle size={12} />
            Non-domestic market — verify tax classification before sale
          </div>
        )}
      </section>

      <Separator />

      {/* ── Logistics ── */}
      <section>
        <h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-3">Logistics</h3>
        <div className="grid grid-cols-2 gap-2 mb-4">
          <InfoCell icon={MapPin}    label="Intended Destination"  value={logistics_details.intended_destination} />
          <InfoCell icon={Hash}      label="Shipment ID"           value={logistics_details.shipment_id} />
          {logistics_details.current_warehouse_id && (
            <InfoCell icon={Building2} label="Current Warehouse ID"   value={logistics_details.current_warehouse_id} />
          )}
          {logistics_details.current_location_name && (
            <InfoCell icon={MapPin}    label="Current Location"       value={logistics_details.current_location_name} />
          )}
        </div>

      </section>

      <Separator />

      {/* ── Movement History ── */}
      <section>
        <h3 className="text-sm font-semibold flex items-center gap-1.5 mb-3">
          <MapPin size={14} />
          Movement History
          <span className="ml-auto text-xs text-muted-foreground font-normal">
            {history.length} stage{history.length !== 1 ? "s" : ""}
          </span>
        </h3>

        {history.length > 0 ? (
          <>
            <LocationMap locations={history} />

            <div className="mt-4 space-y-0 relative">
              <div className="absolute left-[17px] top-5 bottom-5 w-px bg-border" />
              {history.map((m, i) => {
                const isFirst = i === 0;
                const isLast  = i === history.length - 1;
                const dotColor = MOVE_STATUS_COLOR[m.status] ?? (isFirst ? "bg-green-500" : isLast ? "bg-orange-500" : "bg-blue-400");
                return (
                  <div key={m.id} className="flex gap-3 relative pb-4 last:pb-0">
                    <div className={`w-8 h-8 rounded-full border-2 border-background ${dotColor} flex items-center justify-center shrink-0 z-10`}>
                      <span className="text-[10px] font-bold text-white">{i + 1}</span>
                    </div>
                    <div className="flex-1 pt-0.5 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="text-sm font-semibold">{m.stage}</p>
                        <span className="text-xs bg-muted rounded px-1.5 py-0.5">{m.status}</span>
                      </div>
                      <p className="text-sm text-muted-foreground">{m.location}</p>
                      <p className="text-xs text-muted-foreground font-mono">
                        {m.coordinates.lat.toFixed(5)}, {m.coordinates.lng.toFixed(5)}
                      </p>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {new Date(m.timestamp).toLocaleString('en-PH')}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        ) : (
          <div className="flex flex-col items-center gap-2 py-8 text-center border rounded-lg bg-muted/20">
            <MapPin size={28} className="text-muted-foreground/40" />
            <p className="text-sm text-muted-foreground">No movements logged yet.</p>
          </div>
        )}
      </section>
    </div>
  );
}
