"use client"

import type React from "react"
import { useState } from "react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Upload, FileSpreadsheet, AlertCircle, TableIcon, Download } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import type { ImportRow } from "@/lib/types"
import * as XLSX from "xlsx"

interface ImportDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onImport: (rows: ImportRow[]) => void
}

export function ImportDialog({ open, onOpenChange, onImport }: ImportDialogProps) {
  const [error, setError] = useState<string | null>(null)
  const [preview, setPreview] = useState<ImportRow[]>([])
  const [rawData, setRawData] = useState<any[]>([])
  const [columnMapping, setColumnMapping] = useState<Record<string, string>>({})
  const [showMapping, setShowMapping] = useState(false)
  const [fileHeaders, setFileHeaders] = useState<string[]>([])

  const systemColumns = [
    { key: "code", label: "Šifra" },
    { key: "name", label: "Naziv" },
    { key: "project", label: "Projekat" },
    { key: "lokacija", label: "Lokacija" },
    { key: "supplier", label: "Dobavljač" },
    { key: "price", label: "Cena" },
    { key: "input", label: "Ulaz" },
    { key: "okov_ime", label: "Okov Ime" },
    { key: "okov_cena", label: "Okov Cena" },
    { key: "okov_kom", label: "Okov Kom" },
    { key: "ploce_ime", label: "Ploče Ime" },
    { key: "ploce_cena", label: "Ploče Cena" },
    { key: "ploce_kom", label: "Ploče Kom" },
  ]

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setError(null)
    setPreview([])
    setRawData([])
    setShowMapping(false)

    console.log("[v0] File selected:", file.name, file.type)

    const reader = new FileReader()

    reader.onload = (event) => {
      try {
        const data = event.target?.result
        let workbook: XLSX.WorkBook

        // Support XLSX, XLS, ODS, and CSV
        if (file.name.endsWith(".csv")) {
          const text = data as string
          workbook = XLSX.read(text, { type: "string" })
        } else {
          workbook = XLSX.read(data, { type: "array" })
        }

        const sheetName = workbook.SheetNames[0]
        const worksheet = workbook.Sheets[sheetName]
        const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 }) as any[][]

        console.log("[v0] Parsed data rows:", jsonData.length)

        if (jsonData.length < 2) {
          setError("Fajl mora imati zaglavlje i bar jedan red podataka")
          return
        }

        const headers = jsonData[0].map((h: any) => String(h || "").trim())
        setFileHeaders(headers)
        console.log("[v0] File headers:", headers)

        // Auto-detect column mapping
        const autoMapping: Record<string, string> = {}
        headers.forEach((header, index) => {
          const lowerHeader = header.toLowerCase()
          if (lowerHeader.includes("šifra") || lowerHeader.includes("sifra") || lowerHeader === "code") {
            autoMapping[`col_${index}`] = "code"
          } else if (lowerHeader.includes("naziv") || lowerHeader === "name" || lowerHeader.includes("materijal")) {
            autoMapping[`col_${index}`] = "name"
          } else if (lowerHeader.includes("projekat") || lowerHeader === "project") {
            autoMapping[`col_${index}`] = "project"
          } else if (lowerHeader.includes("lokacija") || lowerHeader === "location") {
            autoMapping[`col_${index}`] = "lokacija"
          } else if (
            lowerHeader.includes("dobavljač") ||
            lowerHeader.includes("dobavljac") ||
            lowerHeader === "supplier"
          ) {
            autoMapping[`col_${index}`] = "supplier"
          } else if (lowerHeader.includes("cena") && !lowerHeader.includes("okov") && !lowerHeader.includes("plo")) {
            autoMapping[`col_${index}`] = "price"
          } else if (
            lowerHeader.includes("ulaz") ||
            lowerHeader === "input" ||
            lowerHeader.includes("količina") ||
            lowerHeader.includes("kolicina")
          ) {
            autoMapping[`col_${index}`] = "input"
          } else if (lowerHeader.includes("okov") && lowerHeader.includes("ime")) {
            autoMapping[`col_${index}`] = "okov_ime"
          } else if (lowerHeader.includes("okov") && lowerHeader.includes("cena")) {
            autoMapping[`col_${index}`] = "okov_cena"
          } else if (lowerHeader.includes("okov") && lowerHeader.includes("kom")) {
            autoMapping[`col_${index}`] = "okov_kom"
          } else if ((lowerHeader.includes("ploče") || lowerHeader.includes("ploce")) && lowerHeader.includes("ime")) {
            autoMapping[`col_${index}`] = "ploce_ime"
          } else if ((lowerHeader.includes("ploče") || lowerHeader.includes("ploce")) && lowerHeader.includes("cena")) {
            autoMapping[`col_${index}`] = "ploce_cena"
          } else if ((lowerHeader.includes("ploče") || lowerHeader.includes("ploce")) && lowerHeader.includes("kom")) {
            autoMapping[`col_${index}`] = "ploce_kom"
          }
        })

        setColumnMapping(autoMapping)

        const rows = jsonData
          .slice(1)
          .filter((row) => row.some((cell) => cell !== null && cell !== undefined && String(cell).trim() !== ""))
        setRawData(rows)
        setShowMapping(true)

        console.log("[v0] Auto-detected mapping:", autoMapping)
      } catch (err) {
        console.error("[v0] Parse error:", err)
        setError("Greška pri čitanju fajla. Proverite format.")
      }
    }

    reader.onerror = () => {
      setError("Greška pri učitavanju fajla")
    }

    if (file.name.endsWith(".csv")) {
      reader.readAsText(file, "UTF-8")
    } else {
      reader.readAsArrayBuffer(file)
    }
  }

  const applyMapping = () => {
    try {
      const rows: ImportRow[] = []

      for (const row of rawData) {
        const mappedRow: any = {}

        Object.entries(columnMapping).forEach(([colKey, sysKey]) => {
          const colIndex = Number.parseInt(colKey.replace("col_", ""))
          const value = row[colIndex]

          if (sysKey === "code") mappedRow.code = String(value || "").trim()
          else if (sysKey === "name") mappedRow.name = String(value || "").trim()
          else if (sysKey === "project") mappedRow.project = String(value || "").trim() || "Skladište"
          else if (sysKey === "lokacija") mappedRow.lokacija = String(value || "").trim()
          else if (sysKey === "supplier") mappedRow.supplier = String(value || "").trim()
          else if (sysKey === "price") mappedRow.price = Number.parseFloat(String(value || "0")) || 0
          else if (sysKey === "input") mappedRow.input = Number.parseInt(String(value || "0")) || 0
          else if (sysKey === "okov_ime") mappedRow.okov_ime = String(value || "").trim()
          else if (sysKey === "okov_cena") mappedRow.okov_cena = Number.parseFloat(String(value || "0")) || 0
          else if (sysKey === "okov_kom") mappedRow.okov_kom = Number.parseInt(String(value || "0")) || 0
          else if (sysKey === "ploce_ime") mappedRow.ploce_ime = String(value || "").trim()
          else if (sysKey === "ploce_cena") mappedRow.ploce_cena = Number.parseFloat(String(value || "0")) || 0
          else if (sysKey === "ploce_kom") mappedRow.ploce_kom = Number.parseInt(String(value || "0")) || 0
        })

        if (mappedRow.name) {
          // Generate code if not provided
          if (!mappedRow.code) {
            mappedRow.code = `AUTO-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`
          }
          rows.push(mappedRow as ImportRow)
        }
      }

      console.log("[v0] Mapped rows:", rows.length)
      setPreview(rows)
      setShowMapping(false)
    } catch (err) {
      console.error("[v0] Mapping error:", err)
      setError("Greška pri mapiranju kolona")
    }
  }

  const handleImport = () => {
    if (preview.length === 0) {
      setError("Nema podataka za uvoz")
      return
    }
    console.log("[v0] Importing rows:", preview.length)
    onImport(preview)
    setPreview([])
    setRawData([])
    setShowMapping(false)
    onOpenChange(false)
  }

  const safeNumber = (value: number | undefined | null): string => {
    if (value === null || value === undefined || Number.isNaN(value)) {
      return "0.00"
    }
    return value.toFixed(2)
  }

  const downloadSampleCSV = () => {
    const headers = ["šifra", "projekat", "naziv", "dobavljač", "cena", "ulaz", "lokacija"]
    const sampleData = [
      ["WH-001", "Projekat A", "Vijci M6x20", "Dobavljač 3", "0.55", "1800", "Polica A1"],
      ["WH-002", "Projekat A", "Matice M6", "Dobavljač 1", "0.30", "800", "Polica A2"],
      ["WH-003", "Projekat B", "Šrafovi M8x30", "Dobavljač 2", "0.75", "500", "Polica B1"],
      ["WH-004", "Skladište", "Podloške 8mm", "Dobavljač 2", "0.20", "1200", "Polica C1"],
      ["WH-005", "Skladište", "Kablovi 2.5mm", "Dobavljač 3", "2.50", "300", "Polica C2"],
      ["WH-006", "Projekat C", "Prekidači", "Dobavljač 3", "5.00", "200", "Polica D1"],
      ["WH-007", "Projekat D", "LED Sijalice", "Dobavljač 4", "8.00", "150", "Polica D2"],
      ["WH-008", "Projekat A", "Šper ploča breza", "TIS", "18.00", "100", "Dobavljač 1"],
    ]

    // Create CSV content with BOM for proper UTF-8 encoding
    const BOM = "\uFEFF"
    const csvContent = BOM + [headers.join(","), ...sampleData.map((row) => row.join(","))].join("\n")

    // Create blob and download
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
    const link = document.createElement("a")
    const url = URL.createObjectURL(blob)

    link.setAttribute("href", url)
    link.setAttribute("download", "primer-magacin-import.csv")
    link.style.visibility = "hidden"
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)

    console.log("[v0] Sample CSV downloaded with", sampleData.length, "rows")
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto resize">
        <DialogHeader>
          <DialogTitle>Uvoz iz Excel/CSV</DialogTitle>
          <DialogDescription>
            Učitajte .xlsx, .ods, ili .csv fajl sa kolonama: šifra, projekat, naziv, dobavljač, cena, ulaz
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="flex justify-end">
            <Button type="button" variant="outline" size="sm" onClick={downloadSampleCSV}>
              <Download className="h-4 w-4 mr-2" />
              Preuzmi Primer
            </Button>
          </div>

          <div className="border-2 border-dashed rounded-lg p-8 text-center">
            <FileSpreadsheet className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <Label htmlFor="file-upload" className="cursor-pointer">
              <div className="text-sm text-muted-foreground mb-2">Kliknite da izaberete fajl ili prevucite ovde</div>
              <Button type="button" variant="outline" size="sm">
                <Upload className="h-4 w-4 mr-2" />
                Izaberi Fajl
              </Button>
            </Label>
            <input
              id="file-upload"
              type="file"
              accept=".csv,.xlsx,.xls,.xlsb,.ods,.xltx,.xltm"
              className="hidden"
              onChange={handleFileUpload}
            />
          </div>

          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {showMapping && fileHeaders.length > 0 && (
            <div className="space-y-4">
              <h4 className="font-medium flex items-center gap-2">
                <TableIcon className="h-4 w-4" />
                Mapiranje Kolona
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {fileHeaders.map((header, index) => (
                  <div key={index} className="flex flex-col gap-2">
                    <Label className="text-sm font-medium truncate" title={header}>
                      {header}
                    </Label>
                    <Select
                      value={columnMapping[`col_${index}`] || ""}
                      onValueChange={(value) => setColumnMapping({ ...columnMapping, [`col_${index}`]: value })}
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Izaberite kolonu" />
                      </SelectTrigger>
                      <SelectContent>
                        {systemColumns.map((col) => (
                          <SelectItem key={col.key} value={col.key}>
                            {col.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                ))}
              </div>
              <Button onClick={applyMapping} className="w-full">
                Primeni Mapiranje i Prikaži Pregled
              </Button>
            </div>
          )}

          {preview.length > 0 && (
            <div>
              <h4 className="font-medium mb-2">Pregled ({preview.length} redova)</h4>
              <div className="rounded-lg border max-h-64 overflow-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Šifra</TableHead>
                      <TableHead>Naziv</TableHead>
                      <TableHead>Dobavljač</TableHead>
                      <TableHead className="text-right">Cena</TableHead>
                      <TableHead className="text-right">Ulaz</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {preview.slice(0, 10).map((row, i) => (
                      <TableRow key={i}>
                        <TableCell className="font-mono">{row.code}</TableCell>
                        <TableCell>{row.name}</TableCell>
                        <TableCell>{row.supplier || "-"}</TableCell>
                        <TableCell className="text-right">{safeNumber(row.price)}</TableCell>
                        <TableCell className="text-right">{row.input || 0}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
              {preview.length > 10 && (
                <p className="text-sm text-muted-foreground mt-2">... i još {preview.length - 10} redova</p>
              )}
            </div>
          )}

          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Otkaži
            </Button>
            <Button type="button" onClick={handleImport} disabled={preview.length === 0}>
              Uvezi {preview.length > 0 && `(${preview.length})`}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
