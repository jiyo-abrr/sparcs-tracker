"use client";

import { useEffect, useRef } from "react";
import QRCode from "qrcode";
import { Product } from "@/lib/types";

interface Props {
  product: Product;
  size?: number;
  baseUrl?: string;
}

export default function QRCodeDisplay({ product, size = 256, baseUrl }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const id = product.uid_details.unique_id;
  const origin = baseUrl ?? (typeof window !== "undefined" ? window.location.origin : "");
  const url = `${origin}/products/${id}`;

  useEffect(() => {
    if (!canvasRef.current) return;
    QRCode.toCanvas(canvasRef.current, url, {
      width: size,
      margin: 4,
      errorCorrectionLevel: "M",
      color: { dark: "#000000", light: "#ffffff" },
    });
  }, [url, size]);

  return (
    <div className="flex flex-col items-center gap-2">
      <canvas ref={canvasRef} />
      <p className="text-xs text-muted-foreground font-mono">{id}</p>
      <p className="text-[10px] text-muted-foreground/70 break-all text-center max-w-[240px]">{url}</p>
    </div>
  );
}
