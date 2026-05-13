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
    // Generate at very high resolution (2048px) for pristine print quality.
    // Use 'L' error correction for small prints (0.75 in): it creates fewer, 
    // larger data modules which are much easier for phone cameras to resolve.
    QRCode.toCanvas(canvasRef.current, url, {
      width: 2048,
      margin: 2,
      errorCorrectionLevel: "L",
      color: { dark: "#000000", light: "#ffffff" },
    });
  }, [url]);

  return (
    <div className="flex flex-col items-center gap-2">
      <div style={{ width: size, height: size }} className="flex justify-center items-center overflow-hidden">
        <canvas 
          ref={canvasRef} 
          className="!w-full !h-full object-contain"
        />
      </div>
      <p className="text-xs text-muted-foreground font-mono">{id}</p>
      <p className="text-[10px] text-muted-foreground/70 break-all text-center max-w-[240px]">{url}</p>
    </div>
  );
}
