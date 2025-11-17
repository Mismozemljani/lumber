"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import type { Item, Reservation, Pickup, InputHistory } from "@/lib/types"
import { mockItems, mockReservations, mockPickups, mockInputHistory } from "@/lib/mock-data"

interface ItemsContextType {
  items: Item[]
  reservations: Reservation[]
  pickups: Pickup[]
  inputHistory: InputHistory[]
  addItem: (
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
  updateItem: (item: Item) => void
  deleteItem: (itemId: string) => void
  addReservation: (reservation: Omit<Reservation, "id" | "reserved_at">) => void
  addPickup: (pickup: Omit<Pickup, "id" | "picked_up_at" | "confirmed_at">) => void
  recalculateItem: (itemId: string) => void
  refreshAll: () => void
}

const ItemsContext = createContext<ItemsContextType | undefined>(undefined)

export function ItemsProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<Item[]>([])
  const [reservations, setReservations] = useState<Reservation[]>([])
  const [pickups, setPickups] = useState<Pickup[]>([])
  const [inputHistory, setInputHistory] = useState<InputHistory[]>([])
  const [refreshTrigger, setRefreshTrigger] = useState(0)
  const [isInitialized, setIsInitialized] = useState(false)

  useEffect(() => {
    const loadedItems = localStorage.getItem("warehouse_items")
    const loadedReservations = localStorage.getItem("warehouse_reservations")
    const loadedPickups = localStorage.getItem("warehouse_pickups")
    const loadedInputHistory = localStorage.getItem("warehouse_input_history")

    setItems(loadedItems ? JSON.parse(loadedItems) : mockItems)
    setReservations(loadedReservations ? JSON.parse(loadedReservations) : mockReservations)
    setPickups(loadedPickups ? JSON.parse(loadedPickups) : mockPickups)
    setInputHistory(loadedInputHistory ? JSON.parse(loadedInputHistory) : mockInputHistory)
    setIsInitialized(true)
  }, [])

  useEffect(() => {
    if (!isInitialized) return
    localStorage.setItem("warehouse_items", JSON.stringify(items))
  }, [items, isInitialized])

  useEffect(() => {
    if (!isInitialized) return
    localStorage.setItem("warehouse_reservations", JSON.stringify(reservations))
  }, [reservations, isInitialized])

  useEffect(() => {
    if (!isInitialized) return
    localStorage.setItem("warehouse_pickups", JSON.stringify(pickups))
  }, [pickups, isInitialized])

  useEffect(() => {
    if (!isInitialized) return
    localStorage.setItem("warehouse_input_history", JSON.stringify(inputHistory))
  }, [inputHistory, isInitialized])

  const recalculateItemsByName = (itemName: string) => {
    setItems((currentItems) => {
      const itemsWithSameName = currentItems.filter((item) => item.name === itemName)
      const itemIds = itemsWithSameName.map((item) => item.id)

      const latestInputHistory = inputHistory
      const latestReservations = reservations
      const latestPickups = pickups

      const totalInput = latestInputHistory
        .filter((h) => itemIds.includes(h.item_id))
        .reduce((sum, h) => sum + h.quantity, 0)

      const totalReserved = latestReservations
        .filter((r) => itemIds.includes(r.item_id))
        .reduce((sum, r) => sum + r.quantity, 0)

      const totalOutput = latestPickups
        .filter((p) => itemIds.includes(p.item_id) && p.confirmed_at)
        .reduce((sum, p) => sum + p.quantity, 0)

      const latestReservation = latestReservations
        .filter((r) => itemIds.includes(r.item_id))
        .sort((a, b) => new Date(b.reserved_at).getTime() - new Date(a.reserved_at).getTime())[0]

      const latestPickup = latestPickups
        .filter((p) => itemIds.includes(p.item_id) && p.confirmed_at)
        .sort((a, b) => new Date(b.picked_up_at).getTime() - new Date(a.picked_up_at).getTime())[0]

      const stock = totalInput - totalOutput
      const available = stock - totalReserved

      return currentItems.map((item) => {
        if (item.name !== itemName) return item

        const itemInput = latestInputHistory
          .filter((h) => h.item_id === item.id)
          .reduce((sum, h) => sum + h.quantity, 0)

        return {
          ...item,
          input: itemInput,
          output: totalOutput,
          stock,
          reserved: totalReserved,
          available,
          rezervisao: latestReservation?.reserved_by,
          vreme_rezervacije: latestReservation?.reserved_at,
          sifra_rezervacije: latestReservation?.reservation_code,
          preuzeo: latestPickup?.picked_up_by,
          vreme_preuzimanja: latestPickup?.picked_up_at,
          sifra_preuzimanja: latestPickup?.confirmation_code,
          updated_at: new Date().toISOString(),
        }
      })
    })
  }

  const recalculateItem = (itemId: string) => {
    const item = items.find((i) => i.id === itemId)
    if (item) {
      recalculateItemsByName(item.name)
    }
  }

  useEffect(() => {
    if (!isInitialized) return
    const uniqueNames = new Set(items.map((item) => item.name))
    uniqueNames.forEach((name) => recalculateItemsByName(name))
  }, [reservations, pickups, inputHistory, refreshTrigger, isInitialized])

  const refreshAll = () => {
    setRefreshTrigger((prev) => prev + 1)
  }

  const addItem = (
    newItem: Omit<
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
  ) => {
    const trimmedCode = newItem.code.trim()
    const trimmedName = newItem.name.trim()

    const existingItem = items.find((item) => item.code.trim() === trimmedCode && item.name.trim() === trimmedName)

    if (existingItem) {
      const newHistory: InputHistory = {
        id: Math.random().toString(36).substr(2, 9),
        item_id: existingItem.id,
        quantity: newItem.input,
        price: newItem.price,
        supplier: newItem.supplier,
        input_date: new Date().toISOString(),
      }
      setInputHistory((prev) => {
        const updated = [...prev, newHistory]
        return updated
      })

      setItems((prev) =>
        prev.map((item) =>
          item.id === existingItem.id
            ? {
                ...item,
                supplier: newItem.supplier,
                price: newItem.price,
                project: newItem.project,
                lokacija: newItem.lokacija || item.lokacija,
                okov_ime: newItem.okov_ime || item.okov_ime,
                okov_cena: newItem.okov_cena || item.okov_cena,
                okov_kom: (item.okov_kom || 0) + (newItem.okov_kom || 0),
                ploce_ime: newItem.ploce_ime || item.ploce_ime,
                ploce_cena: newItem.ploce_cena || item.ploce_cena,
                ploce_kom: (item.ploce_kom || 0) + (newItem.ploce_kom || 0),
                updated_at: new Date().toISOString(),
              }
            : item,
        ),
      )
    } else {
      const itemId = Math.random().toString(36).substr(2, 9)
      const item: Item = {
        ...newItem,
        code: trimmedCode,
        name: trimmedName,
        id: itemId,
        output: 0,
        stock: newItem.input,
        reserved: 0,
        available: newItem.input,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }
      setItems((prev) => [...prev, item])

      const newHistory: InputHistory = {
        id: Math.random().toString(36).substr(2, 9),
        item_id: itemId,
        quantity: newItem.input,
        price: newItem.price,
        supplier: newItem.supplier,
        input_date: new Date().toISOString(),
      }
      setInputHistory((prev) => [...prev, newHistory])
    }
  }

  const updateItem = (updatedItem: Item) => {
    setItems((prev) =>
      prev.map((item) => {
        if (item.id === updatedItem.id) {
          return { ...updatedItem, updated_at: new Date().toISOString() }
        }
        return item
      }),
    )
    setRefreshTrigger((prev) => prev + 1)
  }

  const deleteItem = (itemId: string) => {
    setItems((prev) => prev.filter((item) => item.id !== itemId))
    setReservations((prev) => prev.filter((r) => r.item_id !== itemId))
    setPickups((prev) => prev.filter((p) => p.item_id !== itemId))
    setInputHistory((prev) => prev.filter((h) => h.item_id !== itemId))
  }

  const addReservation = (reservation: Omit<Reservation, "id" | "reserved_at">) => {
    const newReservation: Reservation = {
      ...reservation,
      id: Math.random().toString(36).substr(2, 9),
      reserved_at: new Date().toISOString(),
    }
    setReservations((prev) => [...prev, newReservation])
  }

  const addPickup = (pickup: Omit<Pickup, "id" | "picked_up_at" | "confirmed_at">) => {
    const newPickup: Pickup = {
      ...pickup,
      id: Math.random().toString(36).substr(2, 9),
      picked_up_at: new Date().toISOString(),
      confirmed_at: pickup.confirmation_code?.length === 6 ? new Date().toISOString() : undefined,
    }
    setPickups((prev) => [...prev, newPickup])
  }

  return (
    <ItemsContext.Provider
      value={{
        items,
        reservations,
        pickups,
        inputHistory,
        addItem,
        updateItem,
        deleteItem,
        addReservation,
        addPickup,
        recalculateItem,
        refreshAll,
      }}
    >
      {children}
    </ItemsContext.Provider>
  )
}

export function useItems() {
  const context = useContext(ItemsContext)
  if (context === undefined) {
    throw new Error("useItems must be used within an ItemsProvider")
  }
  return context
}
