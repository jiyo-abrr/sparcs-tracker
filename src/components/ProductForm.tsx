"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, PackagePlus, Navigation } from "lucide-react";
import { createProduct } from "@/lib/store";
import type { TaxStatus } from "@/lib/types";

interface Props {
  onCreated: () => void;
}

const EMPTY = {
  manufacturer: "", factory_name: "", factory_city: "", factory_country: "Philippines",
  facility_id: "", factory_lat: "", factory_lng: "", production_line: "", production_timestamp: "",
  intended_destination: "", current_warehouse_id: "", current_location_name: "",
  shipment_id: "", brand: "", variant: "", sku_code: "",
  intended_market: "Philippines Domestic", tax_status: "Paid", activation_date: "",
};

export default function ProductForm({ onCreated }: Props) {
  const [form, setForm] = useState(EMPTY);
  const [loading, setLoading] = useState(false);
  const [locLoading, setLocLoading] = useState(false);
  const [error, setError] = useState("");

  const set = (k: string) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((f) => ({ ...f, [k]: e.target.value }));
  const setSel = (k: string) => (v: string | null) =>
    setForm((f) => ({ ...f, [k]: v ?? "" }));

  function useFactoryLocation() {
    setLocLoading(true);
    navigator.geolocation?.getCurrentPosition(
      (pos) => {
        setForm((f) => ({
          ...f,
          factory_lat: pos.coords.latitude.toFixed(6),
          factory_lng: pos.coords.longitude.toFixed(6),
        }));
        setLocLoading(false);
      },
      () => setLocLoading(false)
    );
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      createProduct({
        manufacturer: form.manufacturer,
        factory_name: form.factory_name,
        factory_city: form.factory_city,
        factory_country: form.factory_country,
        facility_id: form.facility_id,
        factory_lat: form.factory_lat ? parseFloat(form.factory_lat) : 0,
        factory_lng: form.factory_lng ? parseFloat(form.factory_lng) : 0,
        production_line: form.production_line,
        production_timestamp: form.production_timestamp,
        intended_destination: form.intended_destination,
        current_warehouse_id: form.current_warehouse_id,
        current_location_name: form.current_location_name,
        shipment_id: form.shipment_id,
        brand: form.brand,
        variant: form.variant,
        sku_code: form.sku_code,
        intended_market: form.intended_market,
        tax_status: form.tax_status as TaxStatus,
        activation_date: form.activation_date || new Date().toISOString(),
      });
      setForm(EMPTY);
      onCreated();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to register product");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <PackagePlus size={20} /> Register Product
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={submit} className="space-y-6">

          {/* ── UID Details ── */}
          <section className="space-y-3">
            <h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              UID Details
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label>Activation Date</Label>
                <Input type="datetime-local" value={form.activation_date} onChange={set("activation_date")} />
              </div>
              <div className="space-y-1">
                <Label>Tax Status</Label>
                <Select value={form.tax_status} onValueChange={setSel("tax_status")}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {["Paid", "Unpaid", "Pending"].map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </section>

          {/* ── Origin Details ── */}
          <section className="space-y-3">
            <h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Origin Details
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label>Manufacturer <span className="text-destructive">*</span></Label>
                <Input placeholder="Global Tobacco Corp" value={form.manufacturer} onChange={set("manufacturer")} required />
              </div>
              <div className="space-y-1">
                <Label>Factory Name <span className="text-destructive">*</span></Label>
                <Input placeholder="Plant Delta-09" value={form.factory_name} onChange={set("factory_name")} required />
              </div>
              <div className="space-y-1">
                <Label>Factory City <span className="text-destructive">*</span></Label>
                <Input placeholder="Batangas" value={form.factory_city} onChange={set("factory_city")} required />
              </div>
              <div className="space-y-1">
                <Label>Country</Label>
                <Input placeholder="Philippines" value={form.factory_country} onChange={set("factory_country")} />
              </div>
              <div className="space-y-1">
                <Label>Facility ID <span className="text-destructive">*</span></Label>
                <Input placeholder="FAC-88221" value={form.facility_id} onChange={set("facility_id")} required />
              </div>
              <div className="space-y-1">
                <Label>Production Line <span className="text-destructive">*</span></Label>
                <Input placeholder="Line_04_HighSpeed" value={form.production_line} onChange={set("production_line")} required />
              </div>
              <div className="space-y-1 sm:col-span-2">
                <Label>Production Timestamp <span className="text-destructive">*</span></Label>
                <Input type="datetime-local" value={form.production_timestamp} onChange={set("production_timestamp")} required />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label className="text-sm font-medium">Factory Coordinates</Label>
                <Button type="button" variant="outline" size="sm" onClick={useFactoryLocation} disabled={locLoading} className="gap-1.5 text-xs h-7">
                  {locLoading ? <Loader2 size={11} className="animate-spin" /> : <Navigation size={11} />}
                  Use My Location
                </Button>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1">
                  <Label className="text-xs text-muted-foreground">Latitude</Label>
                  <Input placeholder="14.1200" value={form.factory_lat} onChange={set("factory_lat")} type="number" step="any" />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs text-muted-foreground">Longitude</Label>
                  <Input placeholder="121.0800" value={form.factory_lng} onChange={set("factory_lng")} type="number" step="any" />
                </div>
              </div>
            </div>
          </section>

          {/* ── Logistics ── */}
          <section className="space-y-3">
            <h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Logistics
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1 sm:col-span-2">
                <Label>Intended Destination <span className="text-destructive">*</span></Label>
                <Input placeholder="Region VII - Central Visayas" value={form.intended_destination} onChange={set("intended_destination")} required />
              </div>
              <div className="space-y-1">
                <Label>Shipment ID <span className="text-destructive">*</span></Label>
                <Input placeholder="SHIP-77665544-B" value={form.shipment_id} onChange={set("shipment_id")} required />
              </div>
              <div className="space-y-1">
                <Label>Current Warehouse ID</Label>
                <Input placeholder="WH-CEBU-FINAL-05" value={form.current_warehouse_id} onChange={set("current_warehouse_id")} />
              </div>
              <div className="space-y-1 sm:col-span-2">
                <Label>Current Location Name</Label>
                <Input placeholder="Mandaue City Logistics Hub" value={form.current_location_name} onChange={set("current_location_name")} />
              </div>
            </div>
          </section>

          {/* ── Product Specs ── */}
          <section className="space-y-3">
            <h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Product Specs
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label>Brand <span className="text-destructive">*</span></Label>
                <Input placeholder="Mountain Fresh" value={form.brand} onChange={set("brand")} required />
              </div>
              <div className="space-y-1">
                <Label>Variant <span className="text-destructive">*</span></Label>
                <Input placeholder="Menthol 20s" value={form.variant} onChange={set("variant")} required />
              </div>
              <div className="space-y-1">
                <Label>SKU Code <span className="text-destructive">*</span></Label>
                <Input placeholder="SKU-5544" value={form.sku_code} onChange={set("sku_code")} required />
              </div>
              <div className="space-y-1">
                <Label>Intended Market</Label>
                <Select value={form.intended_market} onValueChange={setSel("intended_market")}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {["Philippines Domestic", "Export Only", "Duty-Free"].map((m) => (
                      <SelectItem key={m} value={m}>{m}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </section>

          {error && <p className="text-sm text-red-500">{error}</p>}

          <Button type="submit" disabled={loading} className="w-full">
            {loading ? <Loader2 className="animate-spin mr-2" size={16} /> : null}
            Register Product
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
