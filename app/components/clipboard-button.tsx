"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Clipboard, ClipboardCheck } from "lucide-react";

export function ClipboardButton() {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      // Datei aus dem public/ Ordner laden
      const res = await fetch("/trainingszeiten.txt");
      if (!res.ok) throw new Error("Datei konnte nicht geladen werden");

      const text = await res.text();

      // Inhalt ins Clipboard schreiben
      await navigator.clipboard.writeText(text);

      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Fehler beim Kopieren:", err);
    }
  };

  return (
    <Button onClick={handleCopy} variant="outline" className="flex items-center gap-2">
      {copied ? <ClipboardCheck size={18} /> : <Clipboard size={18} />}
      {copied ? "Kopiert!" : "Kopieren"}
    </Button>
  );
}
