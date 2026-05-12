"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import ProductForm from "@/components/ProductForm";
import ProductTable from "@/components/ProductTable";
import QRCodeDisplay from "@/components/QRCodeDisplay";
import QRScanner from "@/components/QRScanner";
import { Product } from "@/lib/types";
import { useProducts, deleteProduct } from "@/lib/store";
import { Package, ScanLine, LayoutDashboard, PackagePlus, Flag } from "lucide-react";

const STATUS_VARIANT: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
  VALID:   "default",
  INVALID: "destructive",
  FLAGGED: "secondary",
};

type Tab = "dashboard" | "register" | "scan";

export default function Dashboard() {
  const router = useRouter();
  const products = useProducts();
  const [tab, setTab] = useState<Tab>("dashboard");
  const [qrProduct, setQrProduct] = useState<Product | null>(null);

  function handleDelete(id: string) {
    if (!confirm("Delete this product and all its movement history?")) return;
    deleteProduct(id);
  }

  const reportCount = products.reduce((sum, p) => sum + p.reports.length, 0);

  const DESKTOP_NAV: { id: Tab; label: string; icon: React.ReactNode }[] = [
    { id: "dashboard", label: "Products", icon: <LayoutDashboard size={20} /> },
    { id: "register",  label: "Register", icon: <PackagePlus size={20} />    },
    { id: "scan",      label: "Scan QR",  icon: <ScanLine size={20} />       },
  ];

  return (
    <main className="min-h-screen bg-background">

      {/* ════════════════════════════════════════════
          MOBILE LAYOUT — QR scanner only
      ════════════════════════════════════════════ */}
      <div className="md:hidden flex flex-col min-h-screen">
        {/* Welcome banner */}
        <div className="px-4 pt-4 pb-3">
          <div className="rounded-2xl bg-primary text-primary-foreground px-5 py-4">
            <p className="text-[10px] font-medium opacity-75 uppercase tracking-wide mb-0.5">
              Welcome to SPARCS
            </p>
            <h2 className="text-lg font-bold leading-tight">Supply Chain Tracker</h2>
            <p className="text-xs opacity-80 mt-0.5">
              {products.length === 0
                ? "No products registered yet."
                : `${products.length} product${products.length !== 1 ? "s" : ""} tracked`}
            </p>
            {reportCount > 0 && (
              <div className="flex items-center gap-1.5 mt-2 text-xs font-medium bg-white/20 rounded-full px-2.5 py-1 w-fit">
                <Flag size={11} />
                {reportCount} report{reportCount !== 1 ? "s" : ""}
              </div>
            )}
          </div>
        </div>

        {/* QR scanner — fills remaining space */}
        <div className="flex-1 px-4 pb-6">
          <Card className="h-full">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-base">
                <ScanLine size={18} /> Scan Product QR
              </CardTitle>
            </CardHeader>
            <CardContent>
              <QRScanner onScan={(id) => router.push(`/products/${id}`)} />
            </CardContent>
          </Card>
        </div>
      </div>

      {/* ════════════════════════════════════════════
          DESKTOP LAYOUT — full dashboard
      ════════════════════════════════════════════ */}
      <div className="hidden md:block pb-6">
        {/* Header */}
        <header className="border-b sticky top-0 z-20 bg-background/95 backdrop-blur">
          <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <Package className="text-primary" size={22} />
              <div>
                <h1 className="font-bold text-base leading-none">SPARCS Tracker</h1>
                <p className="text-[11px] text-muted-foreground">Supply Chain Monitor</p>
              </div>
            </div>

            <nav className="flex items-center gap-1 bg-muted rounded-lg p-1">
              {DESKTOP_NAV.map(({ id, label, icon }) => (
                <button
                  key={id}
                  onClick={() => setTab(id)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                    tab === id
                      ? "bg-background shadow-sm text-foreground"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {icon} {label}
                </button>
              ))}
            </nav>
          </div>
        </header>

        <div className="max-w-7xl mx-auto px-4 py-4 space-y-5">
          {/* Welcome banner */}
          {tab === "dashboard" && (
            <div className="rounded-2xl bg-primary text-primary-foreground px-5 py-5 flex items-center justify-between gap-4">
              <div>
                <p className="text-xs font-medium opacity-75 uppercase tracking-wide mb-1">
                  Welcome to SPARCS
                </p>
                <h2 className="text-xl font-bold leading-tight">
                  Product Supply Chain Tracker
                </h2>
                <p className="text-sm opacity-80 mt-1">
                  {products.length === 0
                    ? "No products registered yet."
                    : `${products.length} product${products.length !== 1 ? "s" : ""} tracked`}
                </p>
                {reportCount > 0 && (
                  <div className="flex items-center gap-1.5 mt-2 text-xs font-medium bg-white/20 rounded-full px-3 py-1 w-fit">
                    <Flag size={12} />
                    {reportCount} report{reportCount !== 1 ? "s" : ""}
                  </div>
                )}
              </div>
              <div className="shrink-0 opacity-20">
                <Package size={56} />
              </div>
            </div>
          )}

          {tab === "dashboard" && (
            <ProductTable
              products={products}
              onViewQR={(p) => setQrProduct(p)}
              onDelete={handleDelete}
            />
          )}

          {tab === "register" && (
            <div className="max-w-2xl">
              <ProductForm onCreated={() => setTab("dashboard")} />
            </div>
          )}

          {tab === "scan" && (
            <div className="max-w-lg mx-auto">
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center gap-2 text-base">
                    <ScanLine size={18} /> Scan Product QR
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <QRScanner onScan={(id) => router.push(`/products/${id}`)} />
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </div>

      {/* ── QR Code dialog (desktop) ── */}
      <Dialog open={!!qrProduct} onOpenChange={(o) => !o && setQrProduct(null)}>
        <DialogContent className="w-[calc(100%-2rem)] sm:max-w-sm rounded-xl">
          <DialogHeader>
            <DialogTitle className="text-base">
              {qrProduct && `${qrProduct.product_specs.brand} · ${qrProduct.product_specs.variant}`}
            </DialogTitle>
          </DialogHeader>
          {qrProduct && (
            <div className="flex flex-col items-center gap-4 py-2">
              <QRCodeDisplay product={qrProduct} size={200} />
              <div className="w-full text-sm">
                {[
                  { label: "SKU",        value: qrProduct.product_specs.sku_code },
                  { label: "Shipment",   value: qrProduct.logistics_details.shipment_id },
                  { label: "Market",     value: qrProduct.product_specs.intended_market },
                  { label: "Tax Status", value: qrProduct.uid_details.tax_status },
                ].map(({ label, value }) => (
                  <div key={label} className="flex justify-between items-center py-2 border-b last:border-0">
                    <span className="text-muted-foreground">{label}</span>
                    <span className="font-medium">{value}</span>
                  </div>
                ))}
                <div className="pt-2 flex justify-center">
                  <Badge variant={STATUS_VARIANT[qrProduct.status] ?? "outline"}>
                    {qrProduct.status}
                  </Badge>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </main>
  );
}
