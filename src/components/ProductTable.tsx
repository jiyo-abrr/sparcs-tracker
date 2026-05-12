"use client";

import { useRouter } from "next/navigation";
import { Product } from "@/lib/types";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { QrCode, MapPin, Trash2, Package, AlertTriangle, ArrowRight } from "lucide-react";

const STATUS_VARIANT: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
  VALID:    "default",
  INVALID:  "destructive",
  FLAGGED:  "secondary",
};

function AlertBadges({ product }: { product: Product }) {
  const { is_duplicate_detected, reported_stolen, geofencing_violation } = product.security_alerts;
  if (!is_duplicate_detected && !reported_stolen && !geofencing_violation) return null;
  return (
    <div className="flex gap-1 flex-wrap">
      {is_duplicate_detected && (
        <span className="inline-flex items-center gap-0.5 text-[10px] font-medium text-destructive border border-destructive/40 rounded px-1 py-0.5">
          <AlertTriangle size={9} /> Dupe
        </span>
      )}
      {reported_stolen && (
        <span className="inline-flex items-center gap-0.5 text-[10px] font-medium text-destructive border border-destructive/40 rounded px-1 py-0.5">
          <AlertTriangle size={9} /> Stolen
        </span>
      )}
      {geofencing_violation && (
        <span className="inline-flex items-center gap-0.5 text-[10px] font-medium text-orange-600 border border-orange-400/40 rounded px-1 py-0.5">
          <AlertTriangle size={9} /> Geo
        </span>
      )}
    </div>
  );
}

interface Props {
  products: Product[];
  onViewQR: (p: Product) => void;
  onDelete: (id: string) => void;
}

export default function ProductTable({ products, onViewQR, onDelete }: Props) {
  const router = useRouter();

  if (products.length === 0) {
    return (
      <div className="flex flex-col items-center gap-3 py-16 text-center">
        <Package size={40} className="text-muted-foreground/40" />
        <p className="text-sm text-muted-foreground">No products registered yet.</p>
      </div>
    );
  }

  return (
    <>
      {/* ── Mobile: card list ── */}
      <div className="md:hidden space-y-3">
        {products.map((p) => {
          const uid = p.uid_details.unique_id;
          return (
            <div key={uid} className="border rounded-xl p-4 space-y-3 bg-card cursor-pointer hover:bg-muted/30 transition-colors" onClick={() => router.push(`/products/${uid}`)}>
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <p className="font-semibold text-base truncate">
                    {p.product_specs.brand} · {p.product_specs.variant}
                  </p>
                  <p className="text-xs text-muted-foreground font-mono">{uid}</p>
                </div>
                <Badge variant={STATUS_VARIANT[p.status] ?? "outline"} className="shrink-0 mt-0.5">
                  {p.status}
                </Badge>
              </div>

              <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
                <div>
                  <p className="text-[10px] uppercase tracking-wide text-muted-foreground">Manufacturer</p>
                  <p className="font-medium truncate">{p.origin_details.manufacturer}</p>
                </div>
                <div>
                  <p className="text-[10px] uppercase tracking-wide text-muted-foreground">Factory</p>
                  <p className="font-medium truncate">{p.origin_details.factory_name}</p>
                </div>
                <div className="col-span-2">
                  <p className="text-[10px] uppercase tracking-wide text-muted-foreground">Destination</p>
                  <p className="font-medium truncate">{p.logistics_details.intended_destination}</p>
                </div>
                <div>
                  <p className="text-[10px] uppercase tracking-wide text-muted-foreground">Movements</p>
                  <p className="font-medium flex items-center gap-1">
                    <MapPin size={11} className="text-muted-foreground" />
                    {p.logistics_details.movement_history.length}
                  </p>
                </div>
                <div>
                  <p className="text-[10px] uppercase tracking-wide text-muted-foreground">Registered</p>
                  <p className="font-medium">{new Date(p.created_at).toLocaleDateString('en-PH')}</p>
                </div>
                {(p.security_alerts.is_duplicate_detected || p.security_alerts.reported_stolen || p.security_alerts.geofencing_violation) && (
                  <div className="col-span-2">
                    <p className="text-[10px] uppercase tracking-wide text-muted-foreground mb-1">Alerts</p>
                    <AlertBadges product={p} />
                  </div>
                )}
              </div>

              <div className="flex gap-2 pt-1 border-t" onClick={(e) => e.stopPropagation()}>
                <Button size="sm" variant="outline" className="flex-1 gap-1.5" onClick={() => onViewQR(p)}>
                  <QrCode size={14} /> QR Code
                </Button>
                <Button
                  size="icon" variant="ghost"
                  className="text-destructive hover:text-destructive shrink-0"
                  onClick={() => onDelete(uid)}
                >
                  <Trash2 size={15} />
                </Button>
              </div>
            </div>
          );
        })}
      </div>

      {/* ── Desktop: table ── */}
      <div className="hidden md:block overflow-x-auto rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Unique ID</TableHead>
              <TableHead>Brand / Variant</TableHead>
              <TableHead>Manufacturer</TableHead>
              <TableHead>Destination</TableHead>
              <TableHead>Status</TableHead>
              <TableHead><MapPin size={13} className="inline mr-1" />Moves</TableHead>
              <TableHead>Alerts</TableHead>
              <TableHead>Registered</TableHead>
              <TableHead className="text-right">
                <span className="flex items-center justify-end gap-1">Actions <ArrowRight size={11} className="text-muted-foreground/50" /></span>
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {products.map((p) => {
              const uid = p.uid_details.unique_id;
              return (
                <TableRow
                  key={uid}
                  className="cursor-pointer hover:bg-muted/50"
                  onClick={() => router.push(`/products/${uid}`)}
                >
                  <TableCell className="font-mono text-xs text-muted-foreground">{uid}</TableCell>
                  <TableCell>
                    <div>
                      <p className="font-medium">{p.product_specs.brand}</p>
                      <p className="text-xs text-muted-foreground">{p.product_specs.variant}</p>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div>
                      <p className="font-medium">{p.origin_details.manufacturer}</p>
                      <p className="text-xs text-muted-foreground">{p.origin_details.factory_name}</p>
                    </div>
                  </TableCell>
                  <TableCell className="text-sm">{p.logistics_details.intended_destination}</TableCell>
                  <TableCell>
                    <Badge variant={STATUS_VARIANT[p.status] ?? "outline"}>{p.status}</Badge>
                  </TableCell>
                  <TableCell>{p.logistics_details.movement_history.length}</TableCell>
                  <TableCell><AlertBadges product={p} /></TableCell>
                  <TableCell className="text-xs text-muted-foreground">
                    {new Date(p.created_at).toLocaleDateString('en-PH')}
                  </TableCell>
                  <TableCell className="text-right" onClick={(e) => e.stopPropagation()}>
                    <div className="flex items-center justify-end gap-1">
                      <Button size="icon" variant="ghost" title="Show QR" onClick={() => onViewQR(p)}>
                        <QrCode size={16} />
                      </Button>
                      <Button
                        size="icon" variant="ghost" title="Delete"
                        className="text-destructive hover:text-destructive"
                        onClick={() => onDelete(uid)}
                      >
                        <Trash2 size={16} />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>
    </>
  );
}
