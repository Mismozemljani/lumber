"use client"

import { useState } from "react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Edit, Trash2, History } from "lucide-react"
import { EditItemDialog } from "@/components/edit-item-dialog"
import { SupplierHistoryDialog } from "@/components/supplier-history-dialog"
import { StockHistoryDialog } from "@/components/stock-history-dialog"
import type { Item, InputHistory, Reservation, Pickup } from "@/lib/types"
import { cn } from "@/lib/utils"

interface ItemsTableProps {
  items: Item[]
  inputHistory: InputHistory[]
  reservations: Reservation[]
  pickups: Pickup[]
  onUpdateItem?: (item: Item) => void
  onDeleteItem?: (itemId: string) => void
  isAdmin: boolean
  showLimitedColumns?: boolean
}

export function ItemsTable({
  items,
  inputHistory,
  reservations,
  pickups,
  onUpdateItem,
  onDeleteItem,
  isAdmin,
  showLimitedColumns = false,
}: ItemsTableProps) {
  const [editingItem, setEditingItem] = useState<Item | null>(null)
  const [historyItem, setHistoryItem] = useState<Item | null>(null)
  const [stockHistoryItem, setStockHistoryItem] = useState<Item | null>(null)

  const getStockBadgeVariant = (available: number, threshold: number) => {
    if (available <= 0) return "destructive"
    if (available < threshold) return "warning"
    return "default"
  }

  const getStockBadgeColor = (available: number, threshold: number) => {
    if (available <= 0) return "bg-red-500 text-white hover:bg-red-600"
    if (available < threshold) return "bg-yellow-500 text-black hover:bg-yellow-600"
    return ""
  }

  const formatDateTime = (dateString?: string) => {
    if (!dateString) return "-"
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

  // Helper function to safely render numeric values
  const safeNumber = (value: number | undefined | null): number => {
    if (value === null || value === undefined || isNaN(value)) {
      return 0
    }
    return value
  }

  return (
    <>
      <div className="rounded-lg border bg-card overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Šifra</TableHead>
                <TableHead>Lokacija</TableHead>
                {isAdmin && <TableHead>Projekat</TableHead>}
                <TableHead>Naziv</TableHead>
                {isAdmin && <TableHead>Dobavljač</TableHead>}
                <TableHead className="text-right">Cena</TableHead>
                {isAdmin && (
                  <>
                    <TableHead>Okov Ime</TableHead>
                    <TableHead className="text-right">Okov Cena</TableHead>
                    <TableHead className="text-right">Okov Kom</TableHead>
                    <TableHead>Ploče Ime</TableHead>
                    <TableHead className="text-right">Ploče Cena</TableHead>
                    <TableHead className="text-right">Ploče Kom</TableHead>
                  </>
                )}
                {!showLimitedColumns && <>{isAdmin && <TableHead className="text-right">Ulaz</TableHead>}</>}
                <TableHead className="text-right">Stanje</TableHead>
                {!showLimitedColumns && <TableHead className="text-right">Dostupno</TableHead>}
                {!showLimitedColumns && <>{isAdmin && <TableHead className="text-right">Rezervisano</TableHead>}</>}
                {isAdmin && (
                  <>
                    <TableHead>Rezervisao</TableHead>
                    <TableHead>Vreme Rezervacije</TableHead>
                    <TableHead>Šifra Rezervacije</TableHead>
                    <TableHead>Preuzeto</TableHead>
                    <TableHead>Preuzeo</TableHead>
                    <TableHead>Vreme Preuzimanja</TableHead>
                    <TableHead>Šifra Preuzimanja</TableHead>
                  </>
                )}
                <TableHead className="text-right">Akcije</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {items.map((item) => (
                <TableRow key={item.id} className="cursor-pointer hover:bg-muted/50">
                  <TableCell className="font-mono font-medium">{item.code}</TableCell>
                  <TableCell>{item.lokacija || "-"}</TableCell>
                  {isAdmin && <TableCell>{item.project}</TableCell>}
                  <TableCell className="font-medium">{item.name}</TableCell>
                  {isAdmin && <TableCell>{item.supplier}</TableCell>}
                  <TableCell className="text-right">{safeNumber(item.price).toFixed(2)} RSD</TableCell>
                  {isAdmin && (
                    <>
                      <TableCell>{item.okov_ime || "-"}</TableCell>
                      <TableCell className="text-right">
                        {item.okov_cena ? `${safeNumber(item.okov_cena).toFixed(2)} RSD` : "-"}
                      </TableCell>
                      <TableCell className="text-right">{item.okov_kom ? safeNumber(item.okov_kom) : "-"}</TableCell>
                      <TableCell>{item.ploce_ime || "-"}</TableCell>
                      <TableCell className="text-right">
                        {item.ploce_cena ? `${safeNumber(item.ploce_cena).toFixed(2)} RSD` : "-"}
                      </TableCell>
                      <TableCell className="text-right">{item.ploce_kom ? safeNumber(item.ploce_kom) : "-"}</TableCell>
                    </>
                  )}
                  {!showLimitedColumns && (
                    <>
                      {isAdmin && (
                        <TableCell className="text-right">
                          <Button
                            variant="link"
                            size="sm"
                            className="p-0 h-auto font-normal"
                            onClick={() => setHistoryItem(item)}
                          >
                            {safeNumber(item.input)}
                          </Button>
                        </TableCell>
                      )}
                    </>
                  )}
                  <TableCell className="text-right">
                    <Button
                      variant="link"
                      size="sm"
                      className="p-0 h-auto font-normal"
                      onClick={() => setStockHistoryItem(item)}
                    >
                      {safeNumber(item.stock)}
                    </Button>
                  </TableCell>
                  {!showLimitedColumns && (
                    <TableCell className="text-right">
                      <Badge className={cn(getStockBadgeColor(safeNumber(item.available), item.low_stock_threshold))}>
                        {safeNumber(item.available)}
                      </Badge>
                    </TableCell>
                  )}
                  {!showLimitedColumns && (
                    <>{isAdmin && <TableCell className="text-right">{safeNumber(item.reserved)}</TableCell>}</>
                  )}
                  {isAdmin && (
                    <>
                      <TableCell>{item.rezervisao || "-"}</TableCell>
                      <TableCell className="text-xs">{formatDateTime(item.vreme_rezervacije)}</TableCell>
                      <TableCell className="font-mono text-xs">{item.sifra_rezervacije || "-"}</TableCell>
                      <TableCell className="text-right">
                        {safeNumber(
                          pickups
                            .filter((p) => p.item_id === item.id && p.confirmed_at)
                            .reduce((sum, p) => sum + p.quantity, 0),
                        )}
                      </TableCell>
                      <TableCell>{item.preuzeo || "-"}</TableCell>
                      <TableCell className="text-xs">{formatDateTime(item.vreme_preuzimanja)}</TableCell>
                      <TableCell className="font-mono text-xs">{item.sifra_preuzimanja || "-"}</TableCell>
                    </>
                  )}
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setHistoryItem(item)}
                        title="Istorija dobavljača"
                      >
                        <History className="h-4 w-4" />
                      </Button>
                      {isAdmin && onUpdateItem && (
                        <Button variant="ghost" size="sm" onClick={() => setEditingItem(item)}>
                          <Edit className="h-4 w-4" />
                        </Button>
                      )}
                      {isAdmin && onDeleteItem && (
                        <Button variant="ghost" size="sm" onClick={() => onDeleteItem(item.id)}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>

      {editingItem && onUpdateItem && (
        <EditItemDialog
          item={editingItem}
          open={!!editingItem}
          onOpenChange={(open) => !open && setEditingItem(null)}
          onUpdateItem={onUpdateItem}
        />
      )}

      {historyItem && (
        <SupplierHistoryDialog
          item={historyItem}
          inputHistory={inputHistory}
          open={!!historyItem}
          onOpenChange={(open) => !open && setHistoryItem(null)}
        />
      )}

      {stockHistoryItem && (
        <StockHistoryDialog
          item={stockHistoryItem}
          inputHistory={inputHistory}
          reservations={reservations}
          pickups={pickups}
          open={!!stockHistoryItem}
          onOpenChange={(open) => !open && setStockHistoryItem(null)}
        />
      )}
    </>
  )
}
