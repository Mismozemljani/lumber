"use client"

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Download, ExternalLink } from "lucide-react"
import { useEffect } from "react"

interface PdfViewerDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  pdfUrl: string
  title: string
}

export function PdfViewerDialog({ open, onOpenChange, pdfUrl, title }: PdfViewerDialogProps) {
  useEffect(() => {
    if (open && pdfUrl) {
      // Open PDF in new tab
      const newWindow = window.open(pdfUrl, "_blank")
      if (newWindow) {
        newWindow.focus()
      }
      // Close the dialog after opening
      setTimeout(() => {
        onOpenChange(false)
      }, 300)
    }
  }, [open, pdfUrl, onOpenChange])

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Otvaranje PDF-a</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <p className="text-sm text-muted-foreground">PDF dokument "{title}" se otvara u novom tabu...</p>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => window.open(pdfUrl, "_blank")}>
              <ExternalLink className="h-4 w-4 mr-2" />
              Otvori ponovo
            </Button>
            <Button variant="outline" asChild>
              <a href={pdfUrl} download={title}>
                <Download className="h-4 w-4 mr-2" />
                Preuzmi
              </a>
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
