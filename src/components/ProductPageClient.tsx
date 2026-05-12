"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import ProductDetail from "@/components/ProductDetail";
import QRCodeDisplay from "@/components/QRCodeDisplay";
import { deleteProduct, useHasHydrated, useProduct } from "@/lib/store";
import { REPORT_REASONS, type ReportReason } from "@/lib/types";
import { AlertOctagon, ArrowLeft, CheckCircle2, Flag, Loader2, QrCode, Trash2 } from "lucide-react";

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
  const [showQR, setShowQR] = useState(false);
  const [showReport, setShowReport] = useState(false);
  const [reportState, setReportState] = useState<"idle" | "submitting" | "success">("idle");

  function handleDelete() {
    if (!product) return;
    if (!confirm("Delete this product and all its movement history?")) return;
    deleteProduct(product.uid_details.unique_id);
    router.push("/");
  }

  async function handleReport(_reason: ReportReason) {
    if (reportState !== "idle") return;
    setReportState("submitting");
    await new Promise((r) => setTimeout(r, 1400));
    setReportState("success");
    await new Promise((r) => setTimeout(r, 1400));
    setShowReport(false);
    setReportState("idle");
  }

  function handleReportDialogChange(open: boolean) {
    if (!open && reportState !== "idle") return;
    setShowReport(open);
  }

  const reportDialog = (
    <Dialog open={showReport} onOpenChange={handleReportDialogChange}>
      <DialogContent className="w-[calc(100%-2rem)] sm:max-w-sm rounded-xl">
        <DialogHeader>
          <DialogTitle className="text-base flex items-center gap-2">
            <Flag size={16} className="text-orange-600" /> Report Issue
          </DialogTitle>
        </DialogHeader>

        {reportState === "submitting" && (
          <div className="flex flex-col items-center justify-center gap-3 py-10">
            <Loader2 size={36} className="text-orange-600 animate-spin" />
            <p className="text-sm text-muted-foreground">Submitting report…</p>
          </div>
        )}

        {reportState === "success" && (
          <div className="flex flex-col items-center justify-center gap-3 py-10 text-center">
            <div className="rounded-full bg-green-100 p-3 animate-in zoom-in-50 duration-300">
              <CheckCircle2 size={36} className="text-green-600" />
            </div>
            <div className="space-y-1">
              <p className="text-base font-semibold text-foreground">Thank you for reporting!</p>
              <p className="text-xs text-muted-foreground">
                Your report has been submitted for review.
              </p>
            </div>
          </div>
        )}

        {reportState === "idle" && (
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
        )}
      </DialogContent>
    </Dialog>
  );

  if (!hydrated) {
    return (
      <main className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-sm text-muted-foreground">Loading…</p>
      </main>
    );
  }

  if (!product) {
    return (
      <main className="min-h-screen bg-background flex flex-col items-center justify-center gap-4 px-4 text-center">
        <div className="rounded-full bg-red-100 p-4">
          <AlertOctagon size={40} className="text-red-600" />
        </div>
        <div className="space-y-1.5 max-w-xs">
          <h1 className="text-lg font-semibold">Product Not Detected</h1>
          <p className="text-sm text-muted-foreground">
            No record exists for this stamp ID. It may be counterfeit, mislabeled, or unregistered.
          </p>
          <p className="text-xs text-muted-foreground font-mono pt-1">{productId}</p>
        </div>
        <div className="flex flex-col gap-2 w-full max-w-xs pt-2">
          <Button
            variant="outline"
            className="w-full gap-2 border-orange-400/60 text-orange-700 hover:bg-orange-50 hover:text-orange-800 h-12"
            onClick={() => setShowReport(true)}
          >
            <Flag size={16} /> Report This Product
          </Button>
          <Button variant="ghost" onClick={() => router.push("/")} className="gap-2">
            <ArrowLeft size={16} /> Back to dashboard
          </Button>
        </div>
        {reportDialog}
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

        <Button
          type="button"
          variant="outline"
          className="w-full gap-2 border-orange-400/60 text-orange-700 hover:bg-orange-50 hover:text-orange-800 h-12"
          onClick={() => setShowReport(true)}
        >
          <Flag size={16} /> Report Issue
        </Button>
      </div>

      {reportDialog}

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
