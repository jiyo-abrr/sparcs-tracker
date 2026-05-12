"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import ProductDetail from "@/components/ProductDetail";
import AddLocationForm from "@/components/AddLocationForm";
import QRCodeDisplay from "@/components/QRCodeDisplay";
import { addReport, deleteProduct, useHasHydrated, useProduct } from "@/lib/store";
import { REPORT_REASONS, type ReportReason } from "@/lib/types";
import { ArrowLeft, ChevronDown, ChevronUp, Flag, QrCode, Trash2 } from "lucide-react";

const STATUS_VARIANT: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
  VALID:   "default",
  INVALID: "destructive",
  FLAGGED: "secondary",
};

interface Props {
  productId: string;
}

export default function ProductPageClient({ productId }: Props) {
  const router = useRouter();
  const product = useProduct(productId);
  const hydrated = useHasHydrated();
  const [showLogForm, setShowLogForm] = useState(false);
  const [showQR, setShowQR] = useState(false);
  const [showReport, setShowReport] = useState(false);

  function handleDelete() {
    if (!product) return;
    if (!confirm("Delete this product and all its movement history?")) return;
    deleteProduct(product.uid_details.unique_id);
    router.push("/");
  }

  function handleReport(reason: ReportReason) {
    if (!product) return;
    addReport(product.uid_details.unique_id, reason);
    setShowReport(false);
  }

  if (!hydrated) {
    return (
      <main className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-sm text-muted-foreground">Loading…</p>
      </main>
    );
  }

  if (!product) {
    return (
      <main className="min-h-screen bg-background flex flex-col items-center justify-center gap-3 px-4 text-center">
        <h1 className="text-lg font-semibold">Product not found</h1>
        <p className="text-sm text-muted-foreground font-mono">{productId}</p>
        <Button variant="outline" onClick={() => router.push("/")} className="gap-2">
          <ArrowLeft size={16} /> Back to dashboard
        </Button>
      </main>
    );
  }

  const title = `${product.product_specs.brand} · ${product.product_specs.variant}`;

  return (
    <main className="min-h-screen bg-background pb-10">
      <header className="sticky top-0 z-20 border-b bg-background/95 backdrop-blur">
        <div className="max-w-2xl mx-auto px-4 py-3 flex items-center justify-between gap-3">
          <button
            onClick={() => router.push("/")}
            className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft size={16} /> Back
          </button>

          <h1 className="font-semibold text-sm truncate flex-1 text-center">{title}</h1>

          <div className="flex items-center gap-1">
            <Button
              size="icon" variant="ghost" title="Report issue"
              className="text-orange-600 hover:text-orange-700"
              onClick={() => setShowReport(true)}
            >
              <Flag size={18} />
            </Button>
            <Button size="icon" variant="ghost" title="Show QR" onClick={() => setShowQR(true)}>
              <QrCode size={18} />
            </Button>
            <Button
              size="icon" variant="ghost" title="Delete product"
              className="text-destructive hover:text-destructive"
              onClick={handleDelete}
            >
              <Trash2 size={18} />
            </Button>
          </div>
        </div>
      </header>

      <div className="max-w-2xl mx-auto px-4 py-5 space-y-6">
        <ProductDetail product={product} />

        <Separator />

        <div className="rounded-xl border overflow-hidden">
          <button
            type="button"
            onClick={() => setShowLogForm((v) => !v)}
            className="w-full flex items-center justify-between px-4 py-3.5 text-sm font-semibold bg-muted/40 hover:bg-muted/60 transition-colors"
          >
            Log New Movement
            {showLogForm ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          </button>
          {showLogForm && (
            <div className="px-4 py-4 border-t">
              <AddLocationForm
                productId={product.uid_details.unique_id}
                onAdded={() => {
                  setShowLogForm(false);
                  window.scrollTo({ top: 0, behavior: "smooth" });
                }}
              />
            </div>
          )}
        </div>
      </div>

      <Dialog open={showReport} onOpenChange={setShowReport}>
        <DialogContent className="w-[calc(100%-2rem)] sm:max-w-sm rounded-xl">
          <DialogHeader>
            <DialogTitle className="text-base flex items-center gap-2">
              <Flag size={16} className="text-orange-600" /> Report Issue
            </DialogTitle>
          </DialogHeader>
          <div className="py-2 space-y-2">
            <p className="text-sm text-muted-foreground">
              Select the reason for reporting this product. This will flag it for review.
            </p>
            <div className="flex flex-col gap-2 pt-1">
              {REPORT_REASONS.map((reason) => (
                <Button
                  key={reason}
                  variant="outline"
                  className="justify-start gap-2 h-auto py-3"
                  onClick={() => handleReport(reason)}
                >
                  <Flag size={14} className="text-orange-600 shrink-0" />
                  <span className="text-sm">{reason}</span>
                </Button>
              ))}
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={showQR} onOpenChange={setShowQR}>
        <DialogContent className="w-[calc(100%-2rem)] sm:max-w-sm rounded-xl">
          <DialogHeader>
            <DialogTitle className="text-base">{title}</DialogTitle>
          </DialogHeader>
          <div className="flex flex-col items-center gap-4 py-2">
            <QRCodeDisplay product={product} size={200} />
            <div className="w-full text-sm">
              {[
                { label: "SKU",         value: product.product_specs.sku_code },
                { label: "Shipment",    value: product.logistics_details.shipment_id },
                { label: "Market",      value: product.product_specs.intended_market },
                { label: "Tax Status",  value: product.uid_details.tax_status },
              ].map(({ label, value }) => (
                <div key={label} className="flex justify-between items-center py-2 border-b last:border-0">
                  <span className="text-muted-foreground">{label}</span>
                  <span className="font-medium">{value}</span>
                </div>
              ))}
              <div className="pt-2 flex justify-center">
                <Badge variant={STATUS_VARIANT[product.status] ?? "outline"}>
                  {product.status}
                </Badge>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </main>
  );
}
