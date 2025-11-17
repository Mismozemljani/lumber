"use client"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { FileDown } from "lucide-react"
import type { Item } from "@/lib/types"

const safeNumber = (value: any): number => {
  const num = Number(value)
  return isNaN(num) || !isFinite(num) ? 0 : num
}

interface ProjectReportDialogProps {
  project: string
  items: Item[]
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function ProjectReportDialog({ project, items, open, onOpenChange }: ProjectReportDialogProps) {
  const projectItems = items.filter((item) => item.project === project)

  const handleExportPDF = () => {
    // Create a simple HTML table for printing
    const printWindow = window.open("", "_blank")
    if (!printWindow) return

    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Izveštaj - ${project}</title>
          <style>
            body {
              font-family: Arial, sans-serif;
              padding: 20px;
              max-width: 100%;
            }
            h1 {
              color: #333;
              margin-bottom: 10px;
            }
            .meta {
              color: #666;
              margin-bottom: 20px;
            }
            table {
              width: 100%;
              border-collapse: collapse;
              margin-top: 20px;
            }
            th, td {
              border: 1px solid #ddd;
              padding: 12px;
              text-align: left;
              font-size: 12px;
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
          <h1>Izveštaj za projekat: ${project}</h1>
          <div class="meta">
            <p>Datum: ${new Date().toLocaleDateString("sr-RS")}</p>
            <p>Ukupno artikala: ${projectItems.length}</p>
          </div>
          <table>
            <thead>
              <tr>
                <th>Šifra</th>
                <th>Lokacija</th>
                <th>Naziv</th>
                <th>Dobavljač</th>
                <th class="text-right">Cena</th>
                <th class="text-right">Ulaz</th>
                <th class="text-right">Izlaz</th>
                <th class="text-right">Stanje</th>
                <th class="text-right">Rezervisano</th>
                <th class="text-right">Dostupno</th>
              </tr>
            </thead>
            <tbody>
              ${projectItems
                .map(
                  (item) => `
                <tr>
                  <td>${item.code}</td>
                  <td>${item.lokacija || "-"}</td>
                  <td>${item.name}</td>
                  <td>${item.supplier}</td>
                  <td class="text-right">${safeNumber(item.price).toFixed(2)} RSD</td>
                  <td class="text-right">${safeNumber(item.input).toFixed(2)}</td>
                  <td class="text-right">${safeNumber(item.output).toFixed(2)}</td>
                  <td class="text-right">${safeNumber(item.stock).toFixed(2)}</td>
                  <td class="text-right">${safeNumber(item.reserved).toFixed(2)}</td>
                  <td class="text-right">${safeNumber(item.available).toFixed(2)}</td>
                </tr>
              `,
                )
                .join("")}
            </tbody>
          </table>
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
          <DialogTitle>Izveštaj za projekat: {project}</DialogTitle>
          <DialogDescription>Pregled svih artikala i njihovih pozicija u magacinu</DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <div className="text-sm text-muted-foreground">Ukupno artikala: {projectItems.length}</div>
            <Button onClick={handleExportPDF} variant="outline">
              <FileDown className="h-4 w-4 mr-2" />
              Izvezi PDF
            </Button>
          </div>

          <div className="rounded-lg border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Šifra</TableHead>
                  <TableHead>Lokacija</TableHead>
                  <TableHead>Naziv</TableHead>
                  <TableHead>Dobavljač</TableHead>
                  <TableHead className="text-right">Cena</TableHead>
                  <TableHead className="text-right">Ulaz</TableHead>
                  <TableHead className="text-right">Izlaz</TableHead>
                  <TableHead className="text-right">Stanje</TableHead>
                  <TableHead className="text-right">Rezervisano</TableHead>
                  <TableHead className="text-right">Dostupno</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {projectItems.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell className="font-mono">{item.code}</TableCell>
                    <TableCell>{item.lokacija || "-"}</TableCell>
                    <TableCell className="font-medium">{item.name}</TableCell>
                    <TableCell>{item.supplier}</TableCell>
                    <TableCell className="text-right">{safeNumber(item.price).toFixed(2)} RSD</TableCell>
                    <TableCell className="text-right">{safeNumber(item.input).toFixed(2)}</TableCell>
                    <TableCell className="text-right">{safeNumber(item.output).toFixed(2)}</TableCell>
                    <TableCell className="text-right">{safeNumber(item.stock).toFixed(2)}</TableCell>
                    <TableCell className="text-right">{safeNumber(item.reserved).toFixed(2)}</TableCell>
                    <TableCell className="text-right">{safeNumber(item.available).toFixed(2)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
