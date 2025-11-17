"use client"

import type React from "react"
import { useState } from "react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AlertCircle, CheckCircle2, FileText, Calendar } from 'lucide-react'
import { useAuth } from "@/contexts/auth-context"
import { useUsers } from "@/contexts/users-context"
import { useProjects } from "@/contexts/projects-context"
import { useItems } from "@/contexts/items-context"
import { ProjectCalendar } from "@/components/project-calendar"
import { PdfViewerDialog } from "@/components/pdf-viewer-dialog"
import type { Item, Pickup, Project } from "@/lib/types"

const safeNumber = (value: any): number => {
  const num = Number(value)
  return isNaN(num) || !isFinite(num) ? 0 : num
}

interface PickupDialogProps {
  item: Item
  open: boolean
  onOpenChange: (open: boolean) => void
  onAddPickup: (pickup: Omit<Pickup, "id" | "picked_up_at" | "confirmed_at">) => void
}

export function PickupDialog({ item, open, onOpenChange, onAddPickup }: PickupDialogProps) {
  const { user } = useAuth()
  const { users } = useUsers()
  const { projects } = useProjects()
  const { items, reservations, pickups } = useItems()
  const [quantity, setQuantity] = useState("")
  const [pickedUpBy, setPickedUpBy] = useState(user?.name || "")
  const [confirmationCode, setConfirmationCode] = useState("")
  const [notes, setNotes] = useState("")
  const [codeError, setCodeError] = useState("")
  const [isCalendarOpen, setIsCalendarOpen] = useState(false)
  const [selectedItem, setSelectedItem] = useState<Item>(item)
  const [pdfViewerState, setPdfViewerState] = useState<{ open: boolean; url: string; title: string }>({
    open: false,
    url: "",
    title: "",
  })

  const pickupUsers = users.filter((u) => u.role === "PREUZIMANJE")
  const userNames = pickupUsers.map((u) => u.name).sort()

  const projectNames = Array.from(new Set(items.map((i) => i.project).filter(Boolean)))

  const handleViewPdf = (projectNameOrObj: string | Project) => {
    let project: Project | undefined

    if (typeof projectNameOrObj === "string") {
      project = projects.find((p) => p.name === projectNameOrObj)
    } else {
      project = projectNameOrObj
    }

    if (project?.pdf_url) {
      setPdfViewerState({
        open: true,
        url: project.pdf_url,
        title: `${project.name} - ${project.pdf_document || "PDF Dokument"}`,
      })
    }
  }

  const handleCodeChange = (value: string) => {
    setConfirmationCode(value)
    if (value.length > 0 && value.length !== 6) {
      setCodeError("Kod mora imati tačno 6 karaktera")
    } else {
      setCodeError("")
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (confirmationCode && confirmationCode.length !== 6) {
      setCodeError("Kod mora imati tačno 6 karaktera")
      return
    }

    const selectedUser = pickupUsers.find((u) => u.name === pickedUpBy)
    if (!selectedUser) {
      setCodeError("Morate izabrati korisnika")
      return
    }

    if (!selectedUser.userCode) {
      setCodeError("Odabrani korisnik nema dodeljenu šifru")
      return
    }

    if (confirmationCode.toUpperCase() !== selectedUser.userCode.toUpperCase()) {
      setCodeError(`Pogrešna šifra. Možete koristiti samo svoju dodeljenu šifru: ${selectedUser.userCode}`)
      return
    }

    onAddPickup({
      item_id: selectedItem.id,
      quantity: safeNumber(quantity),
      picked_up_by: pickedUpBy,
      confirmation_code: confirmationCode || undefined,
      notes: notes || undefined,
    })

    setQuantity("")
    setConfirmationCode("")
    setNotes("")
    setCodeError("")
  }

  const isCodeValid = confirmationCode.length === 6

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-[95vw] max-h-[90vh] overflow-y-auto resize-both">
          <DialogHeader>
            <DialogTitle>Preuzimanje Artikla</DialogTitle>
            <DialogDescription>
              Izaberite artikal za preuzimanje
            </DialogDescription>
          </DialogHeader>

          <div className="mb-4 border rounded-lg max-h-[300px] overflow-y-auto">
            <Table>
              <TableHeader className="sticky top-0 bg-background">
                <TableRow>
                  <TableHead>Šifra</TableHead>
                  <TableHead>Projekat</TableHead>
                  <TableHead>Naziv</TableHead>
                  <TableHead>Lokacija</TableHead>
                  <TableHead className="text-right">Cena</TableHead>
                  <TableHead className="text-right">Stanje</TableHead>
                  <TableHead className="text-right">Akcija</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {items.filter(i => safeNumber(i.stock) > 0).map((itm) => (
                  <TableRow 
                    key={itm.id} 
                    className={selectedItem.id === itm.id ? "bg-muted" : ""}
                  >
                    <TableCell className="font-mono">{itm.code}</TableCell>
                    <TableCell>{itm.project}</TableCell>
                    <TableCell>{itm.name}</TableCell>
                    <TableCell>{itm.lokacija || "-"}</TableCell>
                    <TableCell className="text-right">{safeNumber(itm.price).toFixed(2)} RSD</TableCell>
                    <TableCell className="text-right">
                      <Badge>{safeNumber(itm.stock)}</Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant={selectedItem.id === itm.id ? "default" : "outline"}
                        size="sm"
                        onClick={() => setSelectedItem(itm)}
                      >
                        {selectedItem.id === itm.id ? "Izabrano" : "Izaberi"}
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {projectNames.length > 0 && (
            <div className="mb-4 border-b pb-4">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-medium">Brzi pristup projektima:</h3>
                <Button variant="outline" size="sm" onClick={() => setIsCalendarOpen(!isCalendarOpen)}>
                  <Calendar className="h-4 w-4 mr-2" />
                  {isCalendarOpen ? "Sakrij" : "Prikaži"} Kalendar
                </Button>
              </div>
              <div className="flex flex-wrap gap-2">
                {projectNames.map((projectName) => {
                  const project = projects.find((p) => p.name === projectName)
                  return (
                    <div key={projectName} className="flex gap-1 items-center">
                      <Button variant="outline" size="sm">
                        <FileText className="h-4 w-4 mr-2" />
                        {projectName}
                      </Button>
                      {project?.pdf_url && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleViewPdf(project)}
                          title={`Pregled ${project.pdf_document || "PDF"}`}
                        >
                          <FileText className="h-4 w-4 text-red-600" />
                        </Button>
                      )}
                    </div>
                  )
                })}
              </div>
            </div>
          )}

          {isCalendarOpen && (
            <div className="mb-4 border-b pb-4">
              <ProjectCalendar
                projects={projects}
                reservations={reservations}
                pickups={pickups}
                items={items}
                onClose={() => setIsCalendarOpen(false)}
                onViewPdf={handleViewPdf}
              />
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label>Izabrani Artikal</Label>
              <div className="p-3 bg-muted rounded-md">
                <div className="font-medium">{selectedItem.name}</div>
                <div className="text-sm text-muted-foreground">
                  {selectedItem.code} | {selectedItem.project}
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Dostupno na stanju</Label>
              <div className="text-2xl font-bold">{safeNumber(selectedItem.stock).toFixed(2)}</div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="pickup-quantity">Količina *</Label>
              <Input
                id="pickup-quantity"
                type="number"
                step="1"
                min="0"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="picked-up-by">Preuzima *</Label>
              <Select value={pickedUpBy} onValueChange={setPickedUpBy} required>
                <SelectTrigger id="picked-up-by">
                  <SelectValue placeholder="Izaberite korisnika" />
                </SelectTrigger>
                <SelectContent>
                  {userNames.map((name) => (
                    <SelectItem key={name} value={name}>
                      {name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmation-code">Kod za potvrdu (6 karaktera) *</Label>
              <Input
                id="confirmation-code"
                type="text"
                maxLength={6}
                value={confirmationCode}
                onChange={(e) => handleCodeChange(e.target.value.toUpperCase())}
                placeholder="ABC123"
                className="font-mono"
                required
              />
              {codeError && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{codeError}</AlertDescription>
                </Alert>
              )}
              {isCodeValid && !codeError && (
                <Alert className="border-green-500 bg-green-50 dark:bg-green-950">
                  <CheckCircle2 className="h-4 w-4 text-green-600" />
                  <AlertDescription className="text-green-600">
                    Kod je validan. Preuzimanje će biti automatski potvrđeno.
                  </AlertDescription>
                </Alert>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="pickup-notes">Napomena</Label>
              <Textarea id="pickup-notes" value={notes} onChange={(e) => setNotes(e.target.value)} rows={3} />
            </div>

            <div className="flex justify-end gap-2 pt-4">
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Otkaži
              </Button>
              <Button type="submit" disabled={!!codeError}>
                Potvrdi Preuzimanje
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      <PdfViewerDialog
        open={pdfViewerState.open}
        onOpenChange={(open) => setPdfViewerState({ ...pdfViewerState, open })}
        pdfUrl={pdfViewerState.url}
        title={pdfViewerState.title}
      />
    </>
  )
}
