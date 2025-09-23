import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { useState } from "react"
import { updateTrainingTimes } from "@/lib/training-times"

export function EditDialog({ text }: { text: string }) {
  const [textValue, setTextValue] = useState(text)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [open, setOpen] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    
    try {
      await updateTrainingTimes({ data: textValue })
      // Dialog schließen und Seite neu laden
      setOpen(false)
      window.location.reload()
    } catch (error) {
      console.error("Error updating training times:", error)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" onClick={() => setOpen(true)}>Bearbeiten</Button>
      </DialogTrigger>
              <DialogContent className="sm:max-w-[800px] w-full">
        <form onSubmit={handleSubmit}>
          <DialogHeader className="mb-6">
            <DialogTitle>Bearbeiten</DialogTitle>
            <DialogDescription>
              Bearbeiten Sie hier den Inhalt der angezeigten Karte.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4">
            <div className="grid gap-3">
              <Label htmlFor="training-text">Text</Label>
              <Textarea
                id="training-text"
                value={textValue}
                onChange={(e) => setTextValue(e.target.value)}
                className="min-h-[100px]"
                placeholder="Geben Sie die Trainingszeiten ein..."
              />
            </div>
          </div>
          <DialogFooter className="mt-6">
            <DialogClose asChild>
              <Button variant="outline" type="button">
                Cancel
              </Button>
            </DialogClose>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Speichere..." : "Save changes"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}