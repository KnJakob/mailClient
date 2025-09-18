import { useState } from "react";
import { Button } from "./ui/button";
import { Clipboard, ClipboardCheck } from "lucide-react";

export function ClipboardButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
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
