"use client"

import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Download } from "lucide-react"
import type { Item, InputHistory } from "@/lib/types"

const safeNumber = (value: any): number => {
  const num = Number(value)
  return isNaN(num) || !isFinite(num) ? 0 : num
}

interface SupplierHistoryDialogProps {
  item: Item
  inputHistory: InputHistory[]
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function SupplierHistoryDialog({ item, inputHistory, open, onOpenChange }: SupplierHistoryDialogProps) {
  const history = inputHistory
    .filter((h) => h.item_id === item.id)
    .sort((a, b) => new Date(b.input_date).getTime() - new Date(a.input_date).getTime())

  const totalQuantity = history.reduce((sum, h) => sum + h.quantity, 0)
  const totalValue = history.reduce((sum, h) => sum + h.quantity * h.price, 0)
  const uniqueSuppliers = new Set(history.map((h) => h.supplier))

  const handleExportPDF = () => {
    const printWindow = window.open("", "", "width=800,height=600")
    if (!printWindow) return

    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <title>Istorija Dobavljača - ${item.name}</title>
        <style>
          body { font-family: Arial, sans-serif; padding: 20px; }
          h1 { color: #333; font-size: 24px; margin-bottom: 10px; }
          .info { color: #666; font-size: 14px; margin-bottom: 20px; }
          .summary { display: grid; grid-template-columns: repeat(3, 1fr); gap: 20px; margin-bottom: 20px; }
          .summary-item { border: 1px solid #ddd; padding: 15px; border-radius: 8px; }
          .summary-label { font-size: 12px; color: #666; margin-bottom: 5px; }
          .summary-value { font-size: 28px; font-weight: bold; }
          table { width: 100%; border-collapse: collapse; margin-top: 20px; }
          th, td { border: 1px solid #ddd; padding: 12px; text-align: left; font-size: 12px; }
          th { background-color: #f5f5f5; font-weight: bold; }
          .badge { display: inline-block; padding: 4px 12px; border: 1px solid #ddd; border-radius: 12px; font-size: 11px; }
          .suppliers { margin-top: 20px; padding: 15px; background-color: #f9fafb; border-radius: 8px; }
          .supplier-item { display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #e5e7eb; }
          @media print {
            body { padding: 0; }
          }
        </style>
      </head>
      <body>
        <h1>Istorija Dobavljača - ${item.name}</h1>
        <div class="info">
          Šifra: ${item.code} | Projekat: ${item.project}
        </div>
        
        <div class="summary">
          <div class="summary-item">
            <div class="summary-label">Ukupna Količina</div>
            <div class="summary-value">${totalQuantity}</div>
          </div>
          <div class="summary-item">
            <div class="summary-label">Ukupna Vrednost</div>
            <div class="summary-value">${totalValue.toFixed(2)} RSD</div>
          </div>
          <div class="summary-item">
            <div class="summary-label">Broj Dobavljača</div>
            <div class="summary-value">${uniqueSuppliers.size}</div>
          </div>
        </div>

        <table>
          <thead>
            <tr>
              <th>Datum i Vreme</th>
              <th>Dobavljač</th>
              <th style="text-align: right;">Količina</th>
              <th style="text-align: right;">Cena po Jedinici</th>
              <th style="text-align: right;">Ukupna Vrednost</th>
            </tr>
          </thead>
          <tbody>
            ${history
              .map(
                (entry) => `
              <tr>
                <td>${new Date(entry.input_date).toLocaleString("sr-RS")}</td>
                <td><span class="badge">${entry.supplier}</span></td>
                <td style="text-align: right; font-weight: 500;">${entry.quantity}</td>
                <td style="text-align: right;">${entry.price.toFixed(2)} RSD</td>
                <td style="text-align: right; font-weight: bold;">${(entry.quantity * entry.price).toFixed(2)} RSD</td>
              </tr>
            `,
              )
              .join("")}
          </tbody>
        </table>

        ${
          uniqueSuppliers.size > 1
            ? `
          <div class="suppliers">
            <h4 style="margin-top: 0; margin-bottom: 15px;">Dobavljači po Ceni</h4>
            ${Array.from(uniqueSuppliers)
              .map((supplier) => {
                const supplierEntries = history.filter((h) => h.supplier === supplier)
                const avgPrice = supplierEntries.reduce((sum, h) => sum + h.price, 0) / supplierEntries.length
                const totalQty = supplierEntries.reduce((sum, h) => sum + h.quantity, 0)
                return `
                <div class="supplier-item">
                  <span style="font-weight: 500;">${supplier}</span>
                  <span style="color: #666; font-size: 12px;">
                    Prosečna cena: ${avgPrice.toFixed(2)} RSD | Ukupno: ${totalQty} kom
                  </span>
                </div>
              `
              })
              .join("")}
          </div>
        `
            : ""
        }
      </body>
      </html>
    `

    printWindow.document.write(htmlContent)
    printWindow.document.close()
    printWindow.focus()
    setTimeout(() => {
      printWindow.print()
      printWindow.close()
    }, 250)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[95vw] max-h-[90vh] overflow-y-auto resize">
        <DialogHeader>
          <DialogTitle>Istorija Dobavljača - {item.name}</DialogTitle>
          <DialogDescription>
            Šifra: {item.code} | Projekat: {item.project}
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-3 gap-4 mb-4">
          <div className="rounded-lg border p-4">
            <div className="text-sm text-muted-foreground">Ukupna Količina</div>
            <div className="text-2xl font-bold">{totalQuantity}</div>
          </div>
          <div className="rounded-lg border p-4">
            <div className="text-sm text-muted-foreground">Ukupna Vrednost</div>
            <div className="text-2xl font-bold">{totalValue.toFixed(2)} RSD</div>
          </div>
          <div className="rounded-lg border p-4">
            <div className="text-sm text-muted-foreground">Broj Dobavljača</div>
            <div className="text-2xl font-bold">{uniqueSuppliers.size}</div>
          </div>
        </div>

        <div className="rounded-lg border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Datum i Vreme</TableHead>
                <TableHead>Dobavljač</TableHead>
                <TableHead className="text-right">Količina</TableHead>
                <TableHead className="text-right">Cena po Jedinici</TableHead>
                <TableHead className="text-right">Ukupna Vrednost</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {history.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center text-muted-foreground">
                    Nema istorije ulaza
                  </TableCell>
                </TableRow>
              ) : (
                history.map((entry) => (
                  <TableRow key={entry.id}>
                    <TableCell className="text-sm">
                      {new Date(entry.input_date).toLocaleString("sr-RS", {
                        year: "numeric",
                        month: "2-digit",
                        day: "2-digit",
                        hour: "2-digit",
                        minute: "2-digit",
                        second: "2-digit",
                      })}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{entry.supplier}</Badge>
                    </TableCell>
                    <TableCell className="text-right font-medium">{entry.quantity}</TableCell>
                    <TableCell className="text-right">{entry.price.toFixed(2)} RSD</TableCell>
                    <TableCell className="text-right font-bold">
                      {(entry.quantity * entry.price).toFixed(2)} RSD
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>

        {uniqueSuppliers.size > 1 && (
          <div className="mt-4 p-4 bg-muted rounded-lg">
            <h4 className="font-medium mb-2">Dobavljači po Ceni</h4>
            <div className="space-y-2">
              {Array.from(uniqueSuppliers).map((supplier) => {
                const supplierEntries = history.filter((h) => h.supplier === supplier)
                const avgPrice = supplierEntries.reduce((sum, h) => sum + h.price, 0) / supplierEntries.length
                const totalQty = supplierEntries.reduce((sum, h) => sum + h.quantity, 0)
                return (
                  <div key={supplier} className="flex justify-between items-center">
                    <span className="font-medium">{supplier}</span>
                    <div className="text-sm text-muted-foreground">
                      Prosečna cena: {avgPrice.toFixed(2)} RSD | Ukupno: {totalQty} kom
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        <div className="flex justify-end gap-2 mt-4">
          <Button variant="outline" onClick={handleExportPDF}>
            <Download className="h-4 w-4 mr-2" />
            Izvezi PDF
          </Button>
          <Button onClick={() => onOpenChange(false)}>Zatvori</Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
