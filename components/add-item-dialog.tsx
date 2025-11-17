"use client"

import type React from "react"
import { useState } from "react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Info } from "lucide-react"
import type { Item } from "@/lib/types"
import { useItems } from "@/contexts/items-context"

interface AddItemDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onAddItem: (
    item: Omit<
      Item,
      | "id"
      | "created_at"
      | "updated_at"
      | "output"
      | "stock"
      | "reserved"
      | "available"
      | "rezervisao"
      | "vreme_rezervacije"
      | "sifra_rezervacije"
      | "preuzeo"
      | "vreme_preuzimanja"
      | "sifra_preuzimanja"
    >,
  ) => void
}

export function AddItemDialog({ open, onOpenChange, onAddItem }: AddItemDialogProps) {
  const { items } = useItems()
  const [formData, setFormData] = useState({
    code: "",
    lokacija: "", // Added lokacija field
    project: "Skladište",
    name: "",
    supplier: "",
    price: 0,
    input: 0,
    okov_ime: "",
    okov_cena: 0,
    okov_kom: 0,
    ploce_ime: "",
    ploce_cena: 0,
    ploce_kom: 0,
    low_stock_threshold: 10,
  })

  const hasOkovData = formData.okov_ime || formData.okov_cena > 0 || formData.okov_kom > 0
  const hasPloceData = formData.ploce_ime || formData.ploce_cena > 0 || formData.ploce_kom > 0

  const trimmedCode = formData.code.trim()
  const trimmedName = formData.name.trim()
  const existingItem = items.find((item) => item.code.trim() === trimmedCode && item.name.trim() === trimmedName)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onAddItem({
      ...formData,
      code: trimmedCode,
      name: trimmedName,
    })
    setFormData({
      code: "",
      lokacija: "",
      project: "Skladište",
      name: "",
      supplier: "",
      price: 0,
      input: 0,
      okov_ime: "",
      okov_cena: 0,
      okov_kom: 0,
      ploce_ime: "",
      ploce_cena: 0,
      ploce_kom: 0,
      low_stock_threshold: 10,
    })
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[95vw] max-h-[90vh] overflow-y-auto resize">
        <DialogHeader>
          <DialogTitle>Dodaj Artikal ili Novu Količinu</DialogTitle>
          <DialogDescription>
            Ako šifra i naziv već postoje, dodaće se nova količina od novog dobavljača
          </DialogDescription>
        </DialogHeader>

        {existingItem && trimmedCode && trimmedName && (
          <Alert>
            <Info className="h-4 w-4" />
            <AlertDescription>
              Artikal sa šifrom "{trimmedCode}" i nazivom "{trimmedName}" već postoji. Nova količina i dobavljač će biti
              dodati postojećem artiklu.
            </AlertDescription>
          </Alert>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="code">Šifra *</Label>
              <Input
                id="code"
                value={formData.code}
                onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="lokacija">Lokacija</Label>
              <Input
                id="lokacija"
                value={formData.lokacija}
                onChange={(e) => setFormData({ ...formData, lokacija: e.target.value })}
                placeholder="npr. Polica A1"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="name">Naziv *</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="supplier">Dobavljač</Label>
              <Input
                id="supplier"
                value={formData.supplier}
                onChange={(e) => setFormData({ ...formData, supplier: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="price">Cena</Label>
              <Input
                id="price"
                type="number"
                step="0.01"
                min="0"
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: Number.parseFloat(e.target.value) || 0 })}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="project">Projekat</Label>
              <Input
                id="project"
                value={formData.project}
                onChange={(e) => setFormData({ ...formData, project: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="input">Ulaz</Label>
              <Input
                id="input"
                type="number"
                step="1"
                min="0"
                value={formData.input}
                onChange={(e) => setFormData({ ...formData, input: Number.parseInt(e.target.value) || 0 })}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="threshold">Prag Upozorenja</Label>
              <Input
                id="threshold"
                type="number"
                min="0"
                value={formData.low_stock_threshold}
                onChange={(e) =>
                  setFormData({ ...formData, low_stock_threshold: Number.parseInt(e.target.value) || 10 })
                }
              />
            </div>
          </div>

          <div className="border-t pt-4">
            <h4 className="font-medium mb-3">Okov</h4>
            {hasPloceData && (
              <Alert className="mb-3">
                <Info className="h-4 w-4" />
                <AlertDescription>
                  Ne možete popuniti i Okov i Ploče polja istovremeno. Artikal može biti samo Okov ILI Ploče.
                </AlertDescription>
              </Alert>
            )}
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="okov_ime">Naziv</Label>
                <Input
                  id="okov_ime"
                  value={formData.okov_ime}
                  onChange={(e) => setFormData({ ...formData, okov_ime: e.target.value })}
                  disabled={hasPloceData}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="okov_cena">Cena</Label>
                <Input
                  id="okov_cena"
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.okov_cena}
                  onChange={(e) => setFormData({ ...formData, okov_cena: Number.parseFloat(e.target.value) || 0 })}
                  disabled={hasPloceData}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="okov_kom">Količina</Label>
                <Input
                  id="okov_kom"
                  type="number"
                  step="1"
                  min="0"
                  value={formData.okov_kom}
                  onChange={(e) => setFormData({ ...formData, okov_kom: Number.parseInt(e.target.value) || 0 })}
                  disabled={hasPloceData}
                />
              </div>
            </div>
          </div>

          <div className="border-t pt-4">
            <h4 className="font-medium mb-3">Ploče</h4>
            {hasOkovData && (
              <Alert className="mb-3">
                <Info className="h-4 w-4" />
                <AlertDescription>
                  Ne možete popuniti i Okov i Ploče polja istovremeno. Artikal može biti samo Okov ILI Ploče.
                </AlertDescription>
              </Alert>
            )}
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="ploce_ime">Naziv</Label>
                <Input
                  id="ploce_ime"
                  value={formData.ploce_ime}
                  onChange={(e) => setFormData({ ...formData, ploce_ime: e.target.value })}
                  disabled={hasOkovData}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="ploce_cena">Cena</Label>
                <Input
                  id="ploce_cena"
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.ploce_cena}
                  onChange={(e) => setFormData({ ...formData, ploce_cena: Number.parseFloat(e.target.value) || 0 })}
                  disabled={hasOkovData}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="ploce_kom">Količina</Label>
                <Input
                  id="ploce_kom"
                  type="number"
                  step="1"
                  min="0"
                  value={formData.ploce_kom}
                  onChange={(e) => setFormData({ ...formData, ploce_kom: Number.parseInt(e.target.value) || 0 })}
                  disabled={hasOkovData}
                />
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Otkaži
            </Button>
            <Button type="submit">Dodaj Artikal</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
