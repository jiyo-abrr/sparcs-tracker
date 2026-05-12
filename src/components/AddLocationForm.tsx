"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, MapPin, Navigation } from "lucide-react";
import { addMovement, updateProduct } from "@/lib/store";

const MOVEMENT_STATUSES = [
  "Released",
  "Transferred",
  "In-Transit (Road)",
  "In-Transit (Sea)",
  "In-Transit (Air)",
  "Received at Destination",
  "Held",
  "Seized",
];

interface Props {
  productId: string;
  onAdded: () => void;
}

export default function AddLocationForm({ productId, onAdded }: Props) {
  const [form, setForm] = useState({
    stage: "",
    location: "",
    lat: "",
    lng: "",
    status: "",
    current_warehouse_id: "",
    current_location_name: "",
  });
  const [loading, setLoading] = useState(false);
  const [locLoading, setLocLoading] = useState(false);
  const [error, setError] = useState("");

  const set = (k: string) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((f) => ({ ...f, [k]: e.target.value }));

  function useCurrentLocation() {
    setLocLoading(true);
    navigator.geolocation?.getCurrentPosition(
      (pos) => {
        setForm((f) => ({
          ...f,
          lat: pos.coords.latitude.toFixed(6),
          lng: pos.coords.longitude.toFixed(6),
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
      const result = addMovement(productId, {
        stage: form.stage,
        location: form.location,
        lat: parseFloat(form.lat),
        lng: parseFloat(form.lng),
        status: form.status,
      });
      if (!result) {
        setError("Product not found");
        return;
      }

      if (form.current_warehouse_id || form.current_location_name) {
        updateProduct(productId, {
          ...(form.current_warehouse_id ? { current_warehouse_id: form.current_warehouse_id } : {}),
          ...(form.current_location_name ? { current_location_name: form.current_location_name } : {}),
        });
      }

      setForm({ stage: "", location: "", lat: "", lng: "", status: "", current_warehouse_id: "", current_location_name: "" });
      onAdded();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to log movement");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={submit} className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div className="space-y-1">
          <Label>Stage</Label>
          <Input
            placeholder="e.g. Factory Exit, Warehouse A"
            value={form.stage}
            onChange={set("stage")}
            required
          />
        </div>
        <div className="space-y-1">
          <Label>Location Name</Label>
          <Input
            placeholder="e.g. Plant Delta-09, Batangas"
            value={form.location}
            onChange={set("location")}
            required
          />
        </div>
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label className="text-sm font-medium">GPS Coordinates</Label>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={useCurrentLocation}
            disabled={locLoading}
            className="gap-1.5 text-xs h-7"
          >
            {locLoading ? <Loader2 size={11} className="animate-spin" /> : <Navigation size={11} />}
            Use My Location
          </Button>
        </div>
        <div className="grid grid-cols-2 gap-2">
          <div className="space-y-1">
            <Label className="text-xs text-muted-foreground">Latitude</Label>
            <Input placeholder="14.5995" value={form.lat} onChange={set("lat")} required type="number" step="any" />
          </div>
          <div className="space-y-1">
            <Label className="text-xs text-muted-foreground">Longitude</Label>
            <Input placeholder="120.9842" value={form.lng} onChange={set("lng")} required type="number" step="any" />
          </div>
        </div>
      </div>

      <div className="space-y-1">
        <Label>Movement Status</Label>
        <Select value={form.status} onValueChange={(v) => setForm((f) => ({ ...f, status: v ?? "" }))}>
          <SelectTrigger>
            <SelectValue placeholder="Select status" />
          </SelectTrigger>
          <SelectContent>
            {MOVEMENT_STATUSES.map((s) => (
              <SelectItem key={s} value={s}>{s}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="rounded-lg border bg-muted/20 p-3 space-y-3">
        <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
          Update Current Warehouse (optional)
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          <div className="space-y-1">
            <Label className="text-xs">Warehouse ID</Label>
            <Input
              placeholder="WH-CEBU-FINAL-05"
              value={form.current_warehouse_id}
              onChange={set("current_warehouse_id")}
            />
          </div>
          <div className="space-y-1">
            <Label className="text-xs">Location Name</Label>
            <Input
              placeholder="Mandaue City Logistics Hub"
              value={form.current_location_name}
              onChange={set("current_location_name")}
            />
          </div>
        </div>
      </div>

      {error && <p className="text-sm text-red-500">{error}</p>}

      <Button type="submit" disabled={loading || !form.status} className="w-full h-12 text-sm gap-2">
        {loading ? <Loader2 className="animate-spin" size={16} /> : <MapPin size={16} />}
        Log Movement
      </Button>
    </form>
  );
}
