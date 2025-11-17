"use client"

import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Download } from "lucide-react"
import type { Item, InputHistory, Reservation, Pickup } from "@/lib/types"

const safeNumber = (value: any): number => {
  const num = Number(value)
  return isNaN(num) || !isFinite(num) ? 0 : num
}

interface StockHistoryDialogProps {
  item: Item
  inputHistory: InputHistory[]
  reservations: Reservation[]
  pickups: Pickup[]
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function StockHistoryDialog({
  item,
  inputHistory = [],
  reservations = [],
  pickups = [],
  open,
  onOpenChange,
}: StockHistoryDialogProps) {
  const itemInputs = inputHistory?.filter((h) => h.item_id === item.id) || []
  const itemReservations = reservations?.filter((r) => r.item_id === item.id) || []
  const itemPickups = pickups?.filter((p) => p.item_id === item.id && p.confirmed_at) || []

  // Combine all changes into a single timeline
  const changes = [
    ...itemInputs.map((h) => ({
      date: h.input_date,
      type: "Ulaz" as const,
      quantity: h.quantity,
      person: h.supplier,
      code: "-",
      // Use safeNumber for price to prevent NaN
      details: `${safeNumber(h.price).toFixed(2)} RSD po jedinici`,
    })),
    ...itemReservations.map((r) => ({
      date: r.reserved_at,
      type: "Rezervacija" as const,
      quantity: -r.quantity,
      person: r.reserved_by,
      code: r.reservation_code || "-",
      details: r.notes || "-",
    })),
    ...itemPickups.map((p) => ({
      date: p.picked_up_at,
      type: "Preuzimanje" as const,
      quantity: -p.quantity,
      person: p.picked_up_by,
      code: p.confirmation_code || "-",
      details: p.notes || "-",
    })),
  ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())

  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleString("sr-RS", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    })
  }

  const handleExportPDF = () => {
    const printWindow = window.open("", "", "width=800,height=600")
    if (!printWindow) return

    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <title>Istorija Stanja - ${item.name}</title>
        <style>
          body { font-family: Arial, sans-serif; padding: 20px; }
          h1 { color: #333; font-size: 24px; margin-bottom: 10px; }
          .info { color: #666; font-size: 14px; margin-bottom: 20px; }
          .summary { display: grid; grid-template-columns: repeat(3, 1fr); gap: 20px; margin-bottom: 20px; }
          .summary-item { border: 1px solid #ddd; padding: 15px; border-radius: 8px; }
          .summary-label { font-size: 12px; color: #666; margin-bottom: 5px; }
          .summary-value { font-size: 28px; font-weight: bold; }
          .green { color: #16a34a; }
          .yellow { color: #ca8a04; }
          .blue { color: #2563eb; }
          table { width: 100%; border-collapse: collapse; margin-top: 20px; }
          th, td { border: 1px solid #ddd; padding: 12px; text-align: left; font-size: 12px; }
          th { background-color: #f5f5f5; font-weight: bold; }
          .badge { padding: 4px 8px; border-radius: 12px; font-size: 11px; font-weight: 500; }
          .badge-green { background-color: #dcfce7; color: #166534; }
          .badge-yellow { background-color: #fef9c3; color: #854d0e; }
          .badge-blue { background-color: #dbeafe; color: #1e40af; }
          @media print {
            body { padding: 0; }
          }
        </style>
      </head>
      <body>
        <h1>Istorija Stanja - ${item.name}</h1>
        <div class="info">
          Šifra: ${item.code} | Trenutno stanje: ${safeNumber(item.stock)} | 
          Rezervisano: ${safeNumber(item.reserved)} | Dostupno: ${safeNumber(item.available)}
        </div>
        
        <div class="summary">
          <div class="summary-item">
            <div class="summary-label">Ukupan Ulaz</div>
            <div class="summary-value green">${safeNumber(itemInputs.reduce((sum, h) => sum + h.quantity, 0))}</div>
          </div>
          <div class="summary-item">
            <div class="summary-label">Ukupno Rezervisano</div>
            <div class="summary-value yellow">${safeNumber(itemReservations.reduce((sum, r) => sum + r.quantity, 0))}</div>
          </div>
          <div class="summary-item">
            <div class="summary-label">Ukupno Preuzeto</div>
            <div class="summary-value blue">${safeNumber(itemPickups.reduce((sum, p) => sum + p.quantity, 0))}</div>
          </div>
        </div>

        <table>
          <thead>
            <tr>
              <th>Datum i Vreme</th>
              <th>Tip</th>
              <th style="text-align: right;">Količina</th>
              <th>Osoba/Dobavljač</th>
              <th>Šifra</th>
              <th>Detalji</th>
            </tr>
          </thead>
          <tbody>
            ${changes
              .map(
                (change) => `
              <tr>
                <td>${formatDateTime(change.date)}</td>
                <td>
                  <span class="badge badge-${change.type === "Ulaz" ? "green" : change.type === "Rezervacija" ? "yellow" : "blue"}">
                    ${change.type}
                  </span>
                </td>
                <td style="text-align: right; font-weight: 500; color: ${safeNumber(change.quantity) > 0 ? "#16a34a" : "#dc2626"}">
                  ${safeNumber(change.quantity) > 0 ? "+" : ""}${safeNumber(change.quantity)}
                </td>
                <td>${change.person}</td>
                <td style="font-family: monospace;">${change.code}</td>
                <td style="color: #666;">${change.details}</td>
              </tr>
            `,
              )
              .join("")}
          </tbody>
        </table>
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

  const totalInput = itemInputs.reduce((sum, h) => sum + h.quantity, 0)
  const totalReserved = itemReservations.reduce((sum, r) => sum + r.quantity, 0)
  const totalPickedUp = itemPickups.reduce((sum, p) => sum + p.quantity, 0)

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[95vw] max-h-[90vh] overflow-y-auto resize">
        <DialogHeader>
          <DialogTitle>Istorija Stanja - {item.name}</DialogTitle>
          <DialogDescription>
            Šifra: {item.code} | Trenutno stanje: {safeNumber(item.stock)} | Rezervisano: {safeNumber(item.reserved)} |
            Dostupno: {safeNumber(item.available)}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="grid grid-cols-3 gap-4 p-4 bg-muted rounded-lg">
            <div>
              <div className="text-sm text-muted-foreground">Ukupan Ulaz</div>
              <div className="text-2xl font-bold text-green-600">{safeNumber(totalInput)}</div>
            </div>
            <div>
              <div className="text-sm text-muted-foreground">Ukupno Rezervisano</div>
              <div className="text-2xl font-bold text-yellow-600">{safeNumber(totalReserved)}</div>
            </div>
            <div>
              <div className="text-sm text-muted-foreground">Ukupno Preuzeto</div>
              <div className="text-2xl font-bold text-blue-600">{safeNumber(totalPickedUp)}</div>
            </div>
          </div>

          <div className="rounded-lg border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Datum i Vreme</TableHead>
                  <TableHead>Tip</TableHead>
                  <TableHead className="text-right">Količina</TableHead>
                  <TableHead>Osoba/Dobavljač</TableHead>
                  <TableHead>Šifra</TableHead>
                  <TableHead>Detalji</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {changes.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center text-muted-foreground">
                      Nema zabeleženih promena
                    </TableCell>
                  </TableRow>
                ) : (
                  changes.map((change, index) => (
                    <TableRow key={index}>
                      <TableCell className="text-sm">{formatDateTime(change.date)}</TableCell>
                      <TableCell>
                        <span
                          className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                            change.type === "Ulaz"
                              ? "bg-green-100 text-green-800"
                              : change.type === "Rezervacija"
                                ? "bg-yellow-100 text-yellow-800"
                                : "bg-blue-100 text-blue-800"
                          }`}
                        >
                          {change.type}
                        </span>
                      </TableCell>
                      <TableCell
                        className={`text-right font-medium ${safeNumber(change.quantity) > 0 ? "text-green-600" : "text-red-600"}`}
                      >
                        {safeNumber(change.quantity) > 0 ? "+" : ""}
                        {safeNumber(change.quantity)}
                      </TableCell>
                      <TableCell>{change.person}</TableCell>
                      <TableCell className="font-mono text-xs">{change.code}</TableCell>
                      <TableCell className="text-sm text-muted-foreground">{change.details}</TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>

          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={handleExportPDF}>
              <Download className="h-4 w-4 mr-2" />
              Izvezi PDF
            </Button>
            <Button onClick={() => onOpenChange(false)}>Zatvori</Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
