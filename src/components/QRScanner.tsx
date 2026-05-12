"use client";

import { useEffect, useRef, useState } from "react";
import { Html5Qrcode } from "html5-qrcode";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { StopCircle, ScanLine, ImageUp, AlertCircle, Search } from "lucide-react";

interface Props {
  onScan: (productId: string) => void;
}

const ID_PATTERN = /PH-\d{4}-[A-Z]{3}-\d{6}/;

function parseQR(text: string): string | null {
  const trimmed = text.trim();
  try {
    const payload = JSON.parse(trimmed);
    if (payload?.id) return String(payload.id);
  } catch {
    // not JSON, fall through
  }
  const match = trimmed.match(ID_PATTERN);
  return match ? match[0] : null;
}

export default function QRScanner({ onScan }: Props) {
  const [scanning, setScanning] = useState(false);
  const [cameraBlocked, setCameraBlocked] = useState(false);
  const [insecureContext, setInsecureContext] = useState(false);
  const [fileError, setFileError] = useState("");
  const [fileLoading, setFileLoading] = useState(false);
  const [manualId, setManualId] = useState("");
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const elementId = "qr-reader";

  async function startScan() {
    if (typeof window !== "undefined" && !window.isSecureContext) {
      setInsecureContext(true);
      setCameraBlocked(true);
      setScanning(false);
      return;
    }
    setCameraBlocked(false);
    setFileError("");
    setScanning(true);
    try {
      const html5QrCode = new Html5Qrcode(elementId);
      scannerRef.current = html5QrCode;
      await html5QrCode.start(
        { facingMode: "environment" },
        { fps: 10, qrbox: { width: 240, height: 240 } },
        (decodedText) => {
          const id = parseQR(decodedText);
          if (id) { stopScan(); onScan(id); }
        },
        undefined
      );
    } catch {
      setScanning(false);
      setCameraBlocked(true);
    }
  }

  async function stopScan() {
    if (scannerRef.current?.isScanning) {
      await scannerRef.current.stop();
    }
    setScanning(false);
  }

  async function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setFileError("");
    setFileLoading(true);
    let scanner: Html5Qrcode | null = null;
    try {
      scanner = new Html5Qrcode("qr-file-reader");
      const decoded = await scanner.scanFile(file, false);
      const id = parseQR(decoded);
      if (id) {
        onScan(id);
        return;
      }
      setFileError(`Decoded text isn't a SPARCS stamp: "${decoded.slice(0, 60)}"`);
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      setFileError(`Could not decode: ${msg}`);
    } finally {
      try { await scanner?.clear(); } catch { /* ignore */ }
      setFileLoading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  }

  function handleManualSubmit(e: React.FormEvent) {
    e.preventDefault();
    const id = manualId.trim().toUpperCase();
    if (id) { onScan(id); setManualId(""); }
  }

  useEffect(() => {
    startScan();
    return () => {
      if (scannerRef.current?.isScanning) {
        scannerRef.current.stop().catch(() => {});
      }
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const photoPanel = (
    <div className="rounded-xl border-2 border-dashed border-muted-foreground/25 bg-muted/20 p-4 space-y-3">
      <p className="text-xs font-medium text-center text-muted-foreground uppercase tracking-wide">
        {insecureContext ? "Tap to scan with your phone's camera" : "Scan from a photo"}
      </p>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        className="hidden"
        onChange={handleFile}
      />

      <Button
        size={insecureContext ? "lg" : "default"}
        variant={insecureContext ? "default" : "outline"}
        className="w-full gap-2"
        disabled={fileLoading}
        onClick={() => fileInputRef.current?.click()}
      >
        <ImageUp size={16} />
        {fileLoading ? "Reading QR…" : "Take Photo / Choose Image"}
      </Button>

      {fileError && (
        <p className="text-xs text-destructive text-center break-words">{fileError}</p>
      )}
    </div>
  );

  return (
    <div className="space-y-4">
      {/* Off-screen scanner sink — html5-qrcode appends a canvas inside this element.
          Must have real dimensions; display:none breaks scanFile on iOS Safari. */}
      <div
        id="qr-file-reader"
        aria-hidden
        style={{ position: "absolute", left: "-9999px", top: 0, width: 1, height: 1, overflow: "hidden" }}
      />

      {insecureContext && photoPanel}

      {/* ── Live camera viewfinder ── */}
      <div
        id={elementId}
        className={scanning ? "rounded-xl overflow-hidden border w-full" : "hidden"}
      />

      {!insecureContext && !scanning && !cameraBlocked && (
        <div className="flex flex-col items-center gap-3 py-6">
          <ScanLine size={40} className="text-muted-foreground/40" />
          <Button onClick={startScan} size="lg" className="w-full gap-2">
            <ScanLine size={18} /> Start Camera
          </Button>
        </div>
      )}

      {scanning && (
        <Button variant="outline" onClick={stopScan} className="w-full gap-2">
          <StopCircle size={16} /> Stop
        </Button>
      )}

      {/* ── Camera blocked ── */}
      {cameraBlocked && (
        <div className="rounded-xl border border-orange-300 bg-orange-50 p-4 space-y-3">
          <div className="flex items-start gap-2 text-orange-700">
            <AlertCircle size={16} className="shrink-0 mt-0.5" />
            <div className="text-sm">
              <p className="font-semibold">
                {insecureContext ? "Live camera not available over HTTP" : "Camera unavailable"}
              </p>
              <p className="text-orange-600 mt-0.5">
                {insecureContext
                  ? "Browsers only allow the live camera on HTTPS or localhost. Use \"Take Photo\" above — it opens your phone's native camera and works over HTTP."
                  : "Camera permission was denied. Use the options below or retry."}
              </p>
            </div>
          </div>
          {!insecureContext && (
            <Button variant="outline" size="sm" onClick={startScan} className="w-full gap-2 text-xs">
              <ScanLine size={14} /> Retry Camera
            </Button>
          )}
        </div>
      )}

      {!insecureContext && photoPanel}

      {/* ── Manual ID entry ── */}
      <div className="rounded-xl border bg-muted/10 p-4 space-y-3">
        <p className="text-xs font-medium text-center text-muted-foreground uppercase tracking-wide">
          Enter product ID manually
        </p>
        <form onSubmit={handleManualSubmit} className="flex gap-2">
          <Input
            placeholder="PH-2026-ABC-123456"
            value={manualId}
            onChange={(e) => setManualId(e.target.value)}
            className="font-mono text-sm"
          />
          <Button type="submit" size="icon" disabled={!manualId.trim()}>
            <Search size={16} />
          </Button>
        </form>
      </div>
    </div>
  );
}
