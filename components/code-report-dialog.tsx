"use client"

import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { useItems } from "@/contexts/items-context"
import { FileDown } from "lucide-react"

interface CodeReportDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

const safeNumber = (value: any): number => {
  const num = Number(value)
  return isNaN(num) || !isFinite(num) ? 0 : num
}

export function CodeReportDialog({ open, onOpenChange }: CodeReportDialogProps) {
  const { items, inputHistory } = useItems()

  // Group items by code
  const itemsByCode = items.reduce(
    (acc, item) => {
      if (!acc[item.code]) {
        acc[item.code] = []
      }
      acc[item.code].push(item)
      return acc
    },
    {} as Record<string, typeof items>,
  )

  // Calculate totals for each code
  const codeGroups = Object.entries(itemsByCode).map(([code, groupItems]) => {
    const totalStock = groupItems.reduce((sum, item) => sum + item.stock, 0)
    const totalReserved = groupItems.reduce((sum, item) => sum + item.reserved, 0)
    const totalAvailable = groupItems.reduce((sum, item) => sum + item.available, 0)
    const totalInput = groupItems.reduce((sum, item) => sum + item.input, 0)
    const totalOutput = groupItems.reduce((sum, item) => sum + item.output, 0)
    const projects = [...new Set(groupItems.map((item) => item.project))].join(", ")
    const names = [...new Set(groupItems.map((item) => item.name))].join(", ")

    return {
      code,
      names,
      projects,
      totalStock,
      totalReserved,
      totalAvailable,
      totalInput,
      totalOutput,
      items: groupItems,
    }
  })

  const handleExportPDF = () => {
    const printWindow = window.open("", "_blank")
    if (!printWindow) return

    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="UTF-8">
          <title>Izveštaj po Šifri</title>
          <style>
            * {
              margin: 0;
              padding: 0;
              box-sizing: border-box;
            }
            body {
              font-family: Arial, sans-serif;
              padding: 20px;
              width: 100%;
            }
            h1 {
              color: #333;
              margin-bottom: 10px;
              font-size: 24px;
            }
            .meta {
              color: #666;
              margin-bottom: 20px;
              font-size: 14px;
            }
            .code-section {
              margin-bottom: 30px;
              page-break-inside: avoid;
            }
            h3 {
              color: #555;
              margin-bottom: 10px;
              font-size: 18px;
            }
            .summary {
              display: grid;
              grid-template-columns: repeat(2, 1fr);
              gap: 10px;
              margin-bottom: 15px;
              font-size: 14px;
            }
            table {
              width: 100%;
              border-collapse: collapse;
              margin-top: 10px;
              font-size: 12px;
            }
            th, td {
              border: 1px solid #ddd;
              padding: 8px;
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
              body {
                padding: 10px;
              }
              button {
                display: none;
              }
            }
          </style>
        </head>
        <body>
          <h1>Izveštaj po Šifri</h1>
          <div class="meta">
            <p>Datum izveštaja: ${new Date().toLocaleDateString("sr-RS")}</p>
          </div>
          ${codeGroups
            .map(
              (group) => `
            <div class="code-section">
              <h3>Šifra: ${group.code}</h3>
              <div class="summary">
                <div><strong>Nazivi:</strong> ${group.names}</div>
                <div><strong>Projekti:</strong> ${group.projects}</div>
                <div><strong>Ukupno Stanje:</strong> ${group.totalStock}</div>
                <div><strong>Ukupno Rezervisano:</strong> ${group.totalReserved}</div>
                <div><strong>Ukupno Dostupno:</strong> ${group.totalAvailable}</div>
                <div><strong>Ukupan Ulaz:</strong> ${group.totalInput}</div>
              </div>
              <table>
                <thead>
                  <tr>
                    <th>Naziv</th>
                    <th>Projekat</th>
                    <th>Dobavljač</th>
                    <th class="text-right">Cena</th>
                    <th class="text-right">Stanje</th>
                    <th class="text-right">Rezervisano</th>
                    <th class="text-right">Dostupno</th>
                  </tr>
                </thead>
                <tbody>
                  ${group.items
                    .map(
                      (item) => `
                    <tr>
                      <td>${item.name}</td>
                      <td>${item.project}</td>
                      <td>${item.supplier}</td>
                      <td class="text-right">${safeNumber(item.price).toFixed(2)}</td>
                      <td class="text-right">${safeNumber(item.stock)}</td>
                      <td class="text-right">${safeNumber(item.reserved)}</td>
                      <td class="text-right">${safeNumber(item.available)}</td>
                    </tr>
                  `,
                    )
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
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto resize">
        <DialogHeader>
          <DialogTitle>Izveštaj po Šifri</DialogTitle>
          <DialogDescription>Pregled artikala grupisanih po šifri</DialogDescription>
        </DialogHeader>

        <div className="flex justify-end mb-4">
          <Button onClick={handleExportPDF} variant="outline">
            <FileDown className="h-4 w-4 mr-2" />
            Izvezi PDF
          </Button>
        </div>

        <div className="space-y-6">
          {codeGroups.map((group) => (
            <div key={group.code} className="border rounded-lg p-4">
              <h3 className="font-bold text-lg mb-2">Šifra: {group.code}</h3>
              <div className="grid grid-cols-2 gap-4 mb-4 text-sm">
                <div>
                  <span className="font-medium">Nazivi:</span> {group.names}
                </div>
                <div>
                  <span className="font-medium">Projekti:</span> {group.projects}
                </div>
                <div>
                  <span className="font-medium">Ukupno Stanje:</span> {group.totalStock}
                </div>
                <div>
                  <span className="font-medium">Ukupno Rezervisano:</span> {group.totalReserved}
                </div>
                <div>
                  <span className="font-medium">Ukupno Dostupno:</span> {group.totalAvailable}
                </div>
                <div>
                  <span className="font-medium">Ukupan Ulaz:</span> {group.totalInput}
                </div>
              </div>

              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Naziv</TableHead>
                    <TableHead>Projekat</TableHead>
                    <TableHead>Dobavljač</TableHead>
                    <TableHead>Cena</TableHead>
                    <TableHead>Stanje</TableHead>
                    <TableHead>Rezervisano</TableHead>
                    <TableHead>Dostupno</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {group.items.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell>{item.name}</TableCell>
                      <TableCell>{item.project}</TableCell>
                      <TableCell>{item.supplier}</TableCell>
                      <TableCell className="text-right">{safeNumber(item.price).toFixed(2)}</TableCell>
                      <TableCell className="text-right">{safeNumber(item.stock)}</TableCell>
                      <TableCell className="text-right">{safeNumber(item.reserved)}</TableCell>
                      <TableCell className="text-right">{safeNumber(item.available)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  )
}
