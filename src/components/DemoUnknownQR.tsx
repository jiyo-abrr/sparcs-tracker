"use client";

import { useEffect, useRef } from "react";
import QRCode from "qrcode";

export const UNKNOWN_DEMO_ID = "PH-2026-XXX-000000";

interface Props {
  size?: number;
  baseUrl?: string;
}

export default function DemoUnknownQR({ size = 180, baseUrl }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const origin = baseUrl ?? (typeof window !== "undefined" ? window.location.origin : "");
  const url = `${origin}/products/${UNKNOWN_DEMO_ID}`;

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
      <p className="text-xs text-muted-foreground font-mono">{UNKNOWN_DEMO_ID}</p>
      <p className="text-[10px] text-muted-foreground/70 break-all text-center max-w-[240px]">
        {url}
      </p>
    </div>
  );
}
