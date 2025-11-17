"use client"

import { useState, useRef, useEffect } from "react"
import { DashboardHeader } from "@/components/dashboard-header"
import { PickupDialog } from "@/components/pickup-dialog"
import { ProjectCalendar } from "@/components/project-calendar"
import { PdfViewerDialog } from "@/components/pdf-viewer-dialog"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Package, RefreshCw, Search, Calendar, FileText } from 'lucide-react'
import { useItems } from "@/contexts/items-context"
import { useProjects } from "@/contexts/projects-context"
import type { Item, Project } from "@/lib/types"
import { Input } from "@/components/ui/input"

export function PickupDashboard() {
  const { items, pickups, reservations, addPickup, refresh } = useItems()
  const { projects } = useProjects()
  const [selectedItem, setSelectedItem] = useState<Item | null>(null)
  const [isPickupDialogOpen, setIsPickupDialogOpen] = useState(false)
  const [isCalendarOpen, setIsCalendarOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [pdfViewerState, setPdfViewerState] = useState<{ open: boolean; url: string; title: string }>({
    open: false,
    url: "",
    title: "",
  })

  const topScrollRef = useRef<HTMLDivElement>(null)
  const tableScrollRef = useRef<HTMLDivElement>(null)
  const topScrollContentRef = useRef<HTMLDivElement>(null)

  const safeNumber = (value: any, decimals = 0): string => {
    const num = Number(value)
    if (isNaN(num) || value === null || value === undefined) {
      return decimals > 0 ? "0." + "0".repeat(decimals) : "0"
    }
    return decimals > 0 ? num.toFixed(decimals) : num.toString()
  }

  const filteredItems = items.filter((item) => {
    const query = searchQuery.toLowerCase()
    return (
      item.code.toLowerCase().includes(query) ||
      item.name.toLowerCase().includes(query) ||
      item.project.toLowerCase().includes(query)
    )
  })

  const projectNames = Array.from(new Set(items.map((item) => item.project).filter(Boolean)))

  useEffect(() => {
    const topScroll = topScrollRef.current
    const tableScroll = tableScrollRef.current

    if (!topScroll || !tableScroll) return

    const handleTopScroll = () => {
      if (tableScroll) {
        tableScroll.scrollLeft = topScroll.scrollLeft
      }
    }

    const handleTableScroll = () => {
      if (topScroll) {
        topScroll.scrollLeft = tableScroll.scrollLeft
      }
    }

    topScroll.addEventListener("scroll", handleTopScroll)
    tableScroll.addEventListener("scroll", handleTableScroll)

    return () => {
      topScroll.removeEventListener("scroll", handleTopScroll)
      tableScroll.removeEventListener("scroll", handleTableScroll)
    }
  }, [])

  useEffect(() => {
    const updateScrollbarWidth = () => {
      const tableScroll = tableScrollRef.current
      const topScrollContent = topScrollContentRef.current

      if (tableScroll && topScrollContent) {
        const tableWidth = tableScroll.scrollWidth
        topScrollContent.style.width = `${tableWidth}px`
      }
    }

    updateScrollbarWidth()
    const timeoutId1 = setTimeout(updateScrollbarWidth, 100)
    const timeoutId2 = setTimeout(updateScrollbarWidth, 500)

    window.addEventListener("resize", updateScrollbarWidth)

    return () => {
      clearTimeout(timeoutId1)
      clearTimeout(timeoutId2)
      window.removeEventListener("resize", updateScrollbarWidth)
    }
  }, [filteredItems, isCalendarOpen])

  const handlePickup = (itemId: string) => {
    const item = items.find((i) => i.id === itemId)
    if (item) {
      setSelectedItem(item)
      setIsPickupDialogOpen(true)
    }
  }

  const handleAddPickup = (pickup: Parameters<typeof addPickup>[0]) => {
    addPickup(pickup)
    setIsPickupDialogOpen(false)
  }

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

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
      <DashboardHeader />
      <main className="container mx-auto px-4 py-6">
        {projectNames.length > 0 && (
          <div className="mb-6">
            <h3 className="text-sm font-medium mb-3">Brzi pristup projektima:</h3>
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

        <div className={isCalendarOpen ? "grid lg:grid-cols-[1fr_70%] gap-4" : ""}>
          <div className={isCalendarOpen ? "overflow-auto" : ""}>
            <Tabs defaultValue="items" className="space-y-6">
              <div className="flex items-center gap-2">
                <TabsList>
                  <TabsTrigger value="items">Artikli</TabsTrigger>
                  <TabsTrigger value="pickups">Moja Preuzimanja</TabsTrigger>
                </TabsList>
                <Button variant="outline" onClick={() => setIsCalendarOpen(!isCalendarOpen)}>
                  <Calendar className="h-4 w-4 mr-2" />
                  Kalendar
                </Button>
              </div>

              <TabsContent value="items" className="space-y-4">
                <div className="flex items-center justify-between">
                  <h2 className="text-2xl font-bold">Dostupni Artikli</h2>
                  <Button onClick={refresh} variant="outline" size="sm">
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Osveži
                  </Button>
                </div>

                <div className="relative max-w-sm">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    type="text"
                    placeholder="Pretraži artikle..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>

                <Card>
                  <CardContent className="p-6">
                    <div className="rounded-lg border bg-card overflow-hidden">
                      <div
                        ref={topScrollRef}
                        className="overflow-x-auto overflow-y-hidden bg-slate-200 dark:bg-slate-700 border-b border-slate-300 dark:border-slate-600"
                        style={{ height: "18px" }}
                      >
                        <div ref={topScrollContentRef} style={{ height: "1px", width: "100%" }} />
                      </div>
                      <div ref={tableScrollRef} className="overflow-auto max-h-[420px]">
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>Šifra</TableHead>
                              <TableHead>Projekat</TableHead>
                              <TableHead>Naziv</TableHead>
                              <TableHead className="text-right">Stanje</TableHead>
                              <TableHead className="text-right">Akcije</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {filteredItems.map((item) => (
                              <TableRow key={item.id}>
                                <TableCell className="font-mono font-medium">{item.code}</TableCell>
                                <TableCell>{item.project}</TableCell>
                                <TableCell className="font-medium">{item.name}</TableCell>
                                <TableCell className="text-right">{safeNumber(item.stock)}</TableCell>
                                <TableCell className="text-right">
                                  <Button variant="outline" size="sm" onClick={() => handlePickup(item.id)}>
                                    <Package className="h-4 w-4 mr-1" />
                                    Preuzmi
                                  </Button>
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="pickups" className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-2xl font-bold">Moja Preuzimanja</h2>
                    <p className="text-muted-foreground">Pregled svih vaših preuzimanja</p>
                  </div>
                  <Button onClick={refresh} variant="outline" size="sm">
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Osveži
                  </Button>
                </div>
                <Card>
                  <CardContent className="p-6">
                    <div className="rounded-lg border">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Artikal</TableHead>
                            <TableHead>Šifra</TableHead>
                            <TableHead className="text-right">Količina</TableHead>
                            <TableHead>Preuzeo</TableHead>
                            <TableHead>Datum</TableHead>
                            <TableHead>Status</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {pickups.length === 0 ? (
                            <TableRow>
                              <TableCell colSpan={6} className="text-center text-muted-foreground">
                                Nemate preuzimanja
                              </TableCell>
                            </TableRow>
                          ) : (
                            pickups.map((pickup) => {
                              const item = items.find((i) => i.id === pickup.item_id)
                              return (
                                <TableRow key={pickup.id}>
                                  <TableCell className="font-medium">{item?.name}</TableCell>
                                  <TableCell className="font-mono">{item?.code}</TableCell>
                                  <TableCell className="text-right">{safeNumber(pickup.quantity)}</TableCell>
                                  <TableCell>{pickup.picked_up_by}</TableCell>
                                  <TableCell>{new Date(pickup.picked_up_at).toLocaleString("sr-RS")}</TableCell>
                                  <TableCell>
                                    {pickup.confirmed_at ? (
                                      <Badge className="bg-green-500 text-white">Potvrđeno</Badge>
                                    ) : (
                                      <Badge variant="secondary">Na čekanju</Badge>
                                    )}
                                  </TableCell>
                                </TableRow>
                              )
                            })
                          )}
                        </TableBody>
                      </Table>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
          {isCalendarOpen && (
            <div className="overflow-auto">
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
        </div>
      </main>

      {selectedItem && (
        <PickupDialog
          item={selectedItem}
          open={isPickupDialogOpen}
          onOpenChange={setIsPickupDialogOpen}
          onAddPickup={handleAddPickup}
        />
      )}

      <PdfViewerDialog
        open={pdfViewerState.open}
        onOpenChange={(open) => setPdfViewerState({ ...pdfViewerState, open })}
        pdfUrl={pdfViewerState.url}
        title={pdfViewerState.title}
      />
    </div>
  )
}
