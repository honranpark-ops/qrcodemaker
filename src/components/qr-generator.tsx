"use client";

import { useMemo, useState, useTransition } from "react";
import { QRCodeSVG } from "qrcode.react";

import { saveQrCode } from "@/app/saved/actions";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { sanitizeQrInput } from "@/lib/qr";

const DEFAULT_TEXT = "https://example.com";

export function QrGenerator() {
  const [raw, setRaw] = useState(DEFAULT_TEXT);
  const [error, setError] = useState<string | null>(null);
  const [lastValid, setLastValid] = useState(DEFAULT_TEXT);
  const [note, setNote] = useState("");
  const [saveMsg, setSaveMsg] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const value = useMemo(() => {
    const r = sanitizeQrInput(raw);
    if (r.ok) return r.value;
    return lastValid;
  }, [raw, lastValid]);

  const handleChange = (next: string) => {
    setRaw(next);
    const r = sanitizeQrInput(next);
    if (r.ok) {
      setLastValid(r.value);
      setError(null);
    } else {
      setError(r.error);
    }
  };

  const handleDownloadPng = () => {
    const svg = document.getElementById("qr-svg");
    if (!svg || !(svg instanceof SVGSVGElement)) return;

    const serializer = new XMLSerializer();
    const source = serializer.serializeToString(svg);
    const svgBlob = new Blob([source], { type: "image/svg+xml;charset=utf-8" });
    const url = URL.createObjectURL(svgBlob);

    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      const canvas = document.createElement("canvas");
      const size = 512;
      canvas.width = size;
      canvas.height = size;
      const ctx = canvas.getContext("2d");
      if (!ctx) {
        URL.revokeObjectURL(url);
        return;
      }
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(0, 0, size, size);
      ctx.drawImage(img, 0, 0, size, size);
      canvas.toBlob((blob) => {
        if (!blob) return;
        const a = document.createElement("a");
        a.href = URL.createObjectURL(blob);
        a.download = "qrcode.png";
        a.click();
        URL.revokeObjectURL(a.href);
      }, "image/png");
      URL.revokeObjectURL(url);
    };
    img.src = url;
  };

  const handleSaveToServer = () => {
    setSaveMsg(null);
    const r = sanitizeQrInput(raw);
    if (!r.ok) {
      setSaveMsg(r.error);
      return;
    }
    startTransition(async () => {
      const res = await saveQrCode(r.value, note);
      if ("error" in res && res.error) {
        setSaveMsg(res.error);
      } else {
        setSaveMsg("서버에 저장했습니다. 「저장된 QR」에서 확인할 수 있어요.");
        setNote("");
      }
    });
  };

  return (
    <Card className="w-full max-w-md shadow-md">
      <CardHeader>
        <CardTitle>QR 코드</CardTitle>
        <CardDescription>
          URL 또는 텍스트를 입력하면 즉시 QR 코드가 생성됩니다.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="qr-text">내용</Label>
          <Input
            id="qr-text"
            value={raw}
            onChange={(e) => handleChange(e.target.value)}
            placeholder="https:// 또는 텍스트"
            autoComplete="off"
            aria-invalid={!!error}
          />
          {error ? (
            <p className="text-sm text-destructive" role="alert">
              {error}
            </p>
          ) : null}
        </div>
        <div className="space-y-2">
          <Label htmlFor="qr-note">저장 시 메모 (선택, 200자)</Label>
          <Input
            id="qr-note"
            value={note}
            onChange={(e) => setNote(e.target.value.slice(0, 200))}
            placeholder="예: 명함용, 이벤트 안내"
            maxLength={200}
            autoComplete="off"
          />
        </div>
        <div className="flex justify-center rounded-lg border bg-card p-6">
          <QRCodeSVG
            id="qr-svg"
            value={value}
            size={220}
            level="M"
            includeMargin
            bgColor="#ffffff"
            fgColor="#0f1419"
          />
        </div>
      </CardContent>
      <CardFooter className="flex flex-col gap-3">
        <div className="flex flex-wrap gap-2">
          <Button type="button" variant="secondary" onClick={handleDownloadPng}>
            PNG 저장
          </Button>
          <Button
            type="button"
            onClick={handleSaveToServer}
            disabled={pending}
          >
            {pending ? "저장 중…" : "서버에 저장"}
          </Button>
        </div>
        {saveMsg ? (
          <p
            className={
              saveMsg.startsWith("서버에 저장")
                ? "text-sm text-muted-foreground"
                : "text-sm text-destructive"
            }
            role="status"
          >
            {saveMsg}
          </p>
        ) : null}
      </CardFooter>
    </Card>
  );
}
