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
    // Generate at a high pixel resolution to ensure crisp printing
    // at small physical sizes (0.7 inches) and reduce margin.
    QRCode.toCanvas(canvasRef.current, url, {
      width: 1024,
      margin: 1,
      errorCorrectionLevel: "M",
      color: { dark: "#000000", light: "#ffffff" },
    });
  }, [url]);

  return (
    <div className="flex flex-col items-center gap-2 print:gap-0 print:m-0">
      <canvas 
        ref={canvasRef} 
        style={{ width: size, height: size, maxWidth: "100%" }}
        className="print:!w-[0.7in] print:!h-[0.7in]" 
      />
      <p className="text-xs text-muted-foreground font-mono print:text-[6px] print:leading-tight">{id}</p>
      <p className="text-[10px] text-muted-foreground/70 break-all text-center max-w-[240px] print:hidden">{url}</p>
    </div>
  );
}
