"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { FileDown } from "lucide-react"
import { useItems } from "@/contexts/items-context"
import type { InputHistory } from "@/lib/types"

interface SupplierReportDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function SupplierReportDialog({ open, onOpenChange }: SupplierReportDialogProps) {
  const { items, inputHistory } = useItems()
  const [startDate, setStartDate] = useState("")
  const [endDate, setEndDate] = useState("")

  const filteredHistory = inputHistory.filter((entry) => {
    if (!startDate && !endDate) return true
    const entryDate = new Date(entry.input_date)
    const start = startDate ? new Date(startDate) : null
    const end = endDate ? new Date(endDate) : null

    if (start && entryDate < start) return false
    if (end && entryDate > end) return false
    return true
  })

  const groupedBySupplier = filteredHistory.reduce(
    (acc, entry) => {
      const supplier = entry.supplier || "Nepoznat"
      if (!acc[supplier]) {
        acc[supplier] = []
      }
      acc[supplier].push(entry)
      return acc
    },
    {} as Record<string, InputHistory[]>,
  )

  const handleExportPDF = () => {
    const printWindow = window.open("", "_blank")
    if (!printWindow) return

    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="UTF-8">
          <title>Izveštaj po dobavljačima</title>
          <style>
            body {
              font-family: Arial, sans-serif;
              padding: 20px;
            }
            h1 {
              color: #333;
              margin-bottom: 10px;
            }
            .meta {
              color: #666;
              margin-bottom: 20px;
            }
            .supplier-section {
              margin-bottom: 30px;
            }
            h2 {
              color: #555;
              margin-top: 20px;
              margin-bottom: 10px;
            }
            table {
              width: 100%;
              border-collapse: collapse;
              margin-top: 10px;
            }
            th, td {
              border: 1px solid #ddd;
              padding: 12px;
              text-align: left;
            }
            th {
              background-color: #f4f4f4;
              font-weight: bold;
            }
            tr:nth-child(even) {
              background-color: #f9f9f9;
            }
            .text-right {
              text-align: right;
            }
            @media print {
              button {
                display: none;
              }
            }
          </style>
        </head>
        <body>
          <h1>Izveštaj po dobavljačima</h1>
          <div class="meta">
            <p>Datum: ${new Date().toLocaleDateString("sr-RS")}</p>
            ${startDate ? `<p>Od: ${new Date(startDate).toLocaleDateString("sr-RS")}</p>` : ""}
            ${endDate ? `<p>Do: ${new Date(endDate).toLocaleDateString("sr-RS")}</p>` : ""}
          </div>
          ${Object.entries(groupedBySupplier)
            .map(
              ([supplier, entries]) => `
            <div class="supplier-section">
              <h2>${supplier}</h2>
              <table>
                <thead>
                  <tr>
                    <th>Datum</th>
                    <th>Artikal</th>
                    <th>Lokacija</th>
                    <th class="text-right">Količina</th>
                    <th class="text-right">Cena</th>
                    <th class="text-right">Ukupno</th>
                  </tr>
                </thead>
                <tbody>
                  ${entries
                    .map((entry) => {
                      const item = items.find((i) => i.id === entry.item_id)
                      const quantity = entry.quantity ?? 0
                      const price = entry.price ?? 0
                      const total = quantity * price
                      return `
                    <tr>
                      <td>${new Date(entry.input_date).toLocaleDateString("sr-RS")}</td>
                      <td>${item?.name || "N/A"} (${item?.code || "N/A"})</td>
                      <td>${item?.lokacija || "-"}</td>
                      <td class="text-right">${quantity.toFixed(2)}</td>
                      <td class="text-right">${price.toFixed(2)} RSD</td>
                      <td class="text-right">${total.toFixed(2)} RSD</td>
                    </tr>
                  `
                    })
                    .join("")}
                </tbody>
              </table>
            </div>
          `,
            )
            .join("")}
          <button onclick="window.print()" style="margin-top: 20px; padding: 10px 20px; background: #333; color: white; border: none; cursor: pointer; border-radius: 4px;">
            Štampaj / Sačuvaj kao PDF
          </button>
        </body>
      </html>
    `

    printWindow.document.write(html)
    printWindow.document.close()
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[95vw] max-h-[90vh] overflow-y-auto resize">
        <DialogHeader>
          <DialogTitle>Izveštaj po dobavljačima</DialogTitle>
          <DialogDescription>Pregled ulaza po dobavljačima i datumima</DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="start-date">Od datuma</Label>
              <Input id="start-date" type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="end-date">Do datuma</Label>
              <Input id="end-date" type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
            </div>
          </div>

          <div className="flex justify-end">
            <Button onClick={handleExportPDF} variant="outline">
              <FileDown className="h-4 w-4 mr-2" />
              Izvezi PDF
            </Button>
          </div>

          <div className="space-y-6">
            {Object.entries(groupedBySupplier).map(([supplier, entries]) => (
              <div key={supplier} className="space-y-2">
                <h3 className="text-lg font-semibold">{supplier}</h3>
                <div className="rounded-lg border overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Datum</TableHead>
                        <TableHead>Artikal</TableHead>
                        <TableHead>Lokacija</TableHead>
                        <TableHead className="text-right">Količina</TableHead>
                        <TableHead className="text-right">Cena</TableHead>
                        <TableHead className="text-right">Ukupno</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {entries.map((entry) => {
                        const item = items.find((i) => i.id === entry.item_id)
                        const quantity = entry.quantity ?? 0
                        const price = entry.price ?? 0
                        const total = quantity * price
                        return (
                          <TableRow key={entry.id}>
                            <TableCell>{new Date(entry.input_date).toLocaleDateString("sr-RS")}</TableCell>
                            <TableCell>
                              {item?.name || "N/A"} ({item?.code || "N/A"})
                            </TableCell>
                            <TableCell>{item?.lokacija || "-"}</TableCell>
                            <TableCell className="text-right">{quantity.toFixed(2)}</TableCell>
                            <TableCell className="text-right">{price.toFixed(2)} RSD</TableCell>
                            <TableCell className="text-right font-medium">{total.toFixed(2)} RSD</TableCell>
                          </TableRow>
                        )
                      })}
                    </TableBody>
                  </Table>
                </div>
              </div>
            ))}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
